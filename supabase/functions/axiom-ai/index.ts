
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
// Use a newer version of deno_dom that exists
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData = await req.json().catch(() => {
      throw new Error("Invalid JSON in request body");
    });
    
    const { url } = requestData;
    
    if (!url) {
      throw new Error("URL is required");
    }

    console.log(`Starting web automation for URL: ${url}`);
    
    // Basic fetch implementation (no actual browser automation)
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    console.log(`Successfully fetched HTML content (${html.length} bytes)`);
    
    // Use Deno DOM to parse the HTML
    const parser = new DOMParser();
    const document = parser.parseFromString(html, "text/html");
    
    if (!document) {
      throw new Error("Failed to parse HTML document");
    }

    // Extract product data
    const productData = {
      name: null,
      price: null,
      image: null,
      description: null,
    };

    // Try to extract product name
    try {
      // Common selectors for product names
      const nameSelectors = [
        'h1', // Generic
        '#productTitle', // Amazon
        '.B_NuCI', // Flipkart
        '.product-title', // Generic
        '[data-testid="product-name"]', // Generic
      ];

      for (const selector of nameSelectors) {
        const element = document.querySelector(selector);
        if (element && element.textContent.trim()) {
          productData.name = element.textContent.trim();
          console.log(`Found product name: ${productData.name}`);
          break;
        }
      }
    } catch (error) {
      console.error("Error extracting product name:", error);
    }

    // Try to extract product price
    try {
      // Common selectors for prices
      const priceSelectors = [
        '.a-price .a-offscreen', // Amazon
        '._30jeq3', // Flipkart
        '.product-price', // Generic
        '[data-testid="product-price"]', // Generic
        '.price', // Generic
        '.offer-price', // Generic
      ];

      for (const selector of priceSelectors) {
        const element = document.querySelector(selector);
        if (element && element.textContent.trim()) {
          productData.price = element.textContent.trim();
          console.log(`Found product price: ${productData.price}`);
          break;
        }
      }
    } catch (error) {
      console.error("Error extracting product price:", error);
    }

    // Try to extract product image
    try {
      // Common selectors for main product images
      const imageSelectors = [
        '#landingImage', // Amazon
        '#imgTagWrapperId img', // Amazon
        '._396QI4 img', // Flipkart
        '.product-image img', // Generic
        '.main-image img', // Generic
      ];

      for (const selector of imageSelectors) {
        const element = document.querySelector(selector);
        if (element) {
          productData.image = element.getAttribute('src');
          console.log(`Found product image: ${productData.image}`);
          break;
        }
      }
    } catch (error) {
      console.error("Error extracting product image:", error);
    }

    // Try to extract product description
    try {
      // Common selectors for product descriptions
      const descSelectors = [
        '#productDescription', // Amazon
        '#feature-bullets', // Amazon bullet points
        '._1mXcCf', // Flipkart
        '.product-description', // Generic
        '.description', // Generic
      ];

      for (const selector of descSelectors) {
        const element = document.querySelector(selector);
        if (element && element.textContent.trim()) {
          productData.description = element.textContent.trim().substring(0, 500);
          console.log(`Found product description (truncated): ${productData.description}`);
          break;
        }
      }
    } catch (error) {
      console.error("Error extracting product description:", error);
    }

    return new Response(
      JSON.stringify({
        success: true,
        url,
        timestamp: new Date().toISOString(),
        productData,
        message: "Web content extraction completed",
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error("Error in web automation:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 400,
      }
    );
  }
});
