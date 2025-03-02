
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

// Main serve function
serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    // Parse request JSON
    let reqJson;
    try {
      reqJson = await req.json();
    } catch (e) {
      console.error("Error parsing request JSON:", e);
      return new Response(
        JSON.stringify({ success: false, error: "Invalid JSON in request body" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Validate URL parameter
    const url = reqJson?.url;
    if (!url) {
      return new Response(
        JSON.stringify({ success: false, error: "URL parameter is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    console.log(`Processing URL: ${url}`);

    // Detect platform (Amazon or Flipkart)
    const platform = detectPlatform(url);
    if (!platform) {
      return new Response(
        JSON.stringify({ success: false, error: "Unsupported platform. Only Amazon and Flipkart are currently supported." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Set custom headers for the request
    const headers = new Headers({
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
    });

    // Make request to the product URL
    console.log(`Sending request to ${url}`);
    const response = await fetch(url, { headers });
    
    // Handle non-successful response
    if (!response.ok) {
      const status = response.status;
      console.error(`Failed to fetch URL: ${status}`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Failed to fetch URL: ${status}`,
          url: url,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 502 }
      );
    }

    // Get HTML content
    const html = await response.text();
    console.log(`Received HTML content of length: ${html.length}`);

    // Parse HTML using DOMParser
    const doc = new DOMParser().parseFromString(html, "text/html");
    if (!doc) {
      return new Response(
        JSON.stringify({ success: false, error: "Failed to parse HTML content" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Extract product data based on platform
    let productData;
    if (platform === "amazon") {
      productData = extractAmazonProductData(doc);
    } else if (platform === "flipkart") {
      productData = extractFlipkartProductData(doc);
    }

    console.log(`Extracted product data:`, productData);

    // Return the extracted data
    return new Response(
      JSON.stringify({ success: true, productData }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: `Error extracting product data: ${error.message || "Unknown error"}` 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

// Function to detect the e-commerce platform from URL
function detectPlatform(url: string): "amazon" | "flipkart" | null {
  if (url.includes("amazon")) return "amazon";
  if (url.includes("flipkart")) return "flipkart";
  return null;
}

// Function to extract Amazon product data
function extractAmazonProductData(doc: Document) {
  try {
    // Product title
    let productName = null;
    const titleElement = doc.querySelector("#productTitle");
    if (titleElement) {
      productName = titleElement.textContent?.trim();
    }

    // Product price
    let price = null;
    const priceElements = [
      doc.querySelector(".a-price .a-offscreen"),
      doc.querySelector("#priceblock_ourprice"),
      doc.querySelector("#priceblock_dealprice"),
      doc.querySelector(".a-price-whole")
    ];

    for (const element of priceElements) {
      if (element && element.textContent) {
        price = element.textContent.trim();
        break;
      }
    }

    // Product image
    let image = null;
    const imageElement = doc.querySelector("#landingImage") || doc.querySelector("#imgBlkFront");
    if (imageElement) {
      image = imageElement.getAttribute("src") || imageElement.getAttribute("data-old-hires");
    }

    // Product description
    let description = null;
    const descriptionElement = doc.querySelector("#productDescription p") || 
                               doc.querySelector("#feature-bullets .a-list-item");
    if (descriptionElement) {
      description = descriptionElement.textContent?.trim();
    }

    return { name: productName, price, image, description };
  } catch (error) {
    console.error("Error extracting Amazon product data:", error);
    return { name: null, price: null, image: null, description: null };
  }
}

// Function to extract Flipkart product data
function extractFlipkartProductData(doc: Document) {
  try {
    // Product title
    let productName = null;
    const titleElement = doc.querySelector(".B_NuCI") || doc.querySelector("h1.yhB1nd") || doc.querySelector("span.B_NuCI");
    if (titleElement) {
      productName = titleElement.textContent?.trim();
    }

    // Product price
    let price = null;
    const priceElement = doc.querySelector("div._30jeq3._16Jk6d") || doc.querySelector("div._30jeq3");
    if (priceElement) {
      price = priceElement.textContent?.trim();
    }

    // Product image
    let image = null;
    const imageElement = doc.querySelector("img._396cs4") || doc.querySelector("div._3kidJX img");
    if (imageElement) {
      image = imageElement.getAttribute("src");
    }

    // Product description
    let description = null;
    const descriptionElement = doc.querySelector("div._1mXcCf.RmoJUa") || doc.querySelector("div._2o-xpa");
    if (descriptionElement) {
      description = descriptionElement.textContent?.trim();
    }

    // If description is not found, try to extract from specification table
    if (!description) {
      const specRows = doc.querySelectorAll("div._14cfVK");
      if (specRows && specRows.length > 0) {
        const specs = Array.from(specRows).map(row => {
          const label = row.querySelector("div._1hKmbr")?.textContent?.trim();
          const value = row.querySelector("div.URwL2w")?.textContent?.trim();
          return label && value ? `${label}: ${value}` : null;
        }).filter(Boolean);
        
        if (specs.length > 0) {
          description = specs.join("\n");
        }
      }
    }

    return { name: productName, price, image, description };
  } catch (error) {
    console.error("Error extracting Flipkart product data:", error);
    return { name: null, price: null, image: null, description: null };
  }
}
