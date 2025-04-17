
// Follow ES module imports
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

// CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Simple HTML parsing function using regex since DOM parsing is unreliable in Edge Functions
function extractProductDetails(html, platform) {
  const productData = {
    name: null,
    price: null,
    image: null,
    description: null
  };
  
  try {
    console.log(`Extracting ${platform} product data using regex...`);
    
    if (platform === 'amazon') {
      // Amazon product title
      const titleMatch = html.match(/<span\s+id="productTitle"[^>]*>(.*?)<\/span>/is);
      if (titleMatch && titleMatch[1]) {
        productData.name = titleMatch[1].trim();
      }
      
      // Amazon product price
      const priceMatch = html.match(/<span\s+class="a-price[^"]*"[^>]*>[^<]*<span[^>]*>(.*?)<\/span>/is);
      if (priceMatch && priceMatch[1]) {
        productData.price = priceMatch[1].trim();
      }
      
      // Amazon product image
      const imageMatch = html.match(/<img[^>]*id="landingImage"[^>]*src="([^"]*)"[^>]*>/is) || 
                         html.match(/<img[^>]*data-old-hires="([^"]*)"[^>]*>/is);
      if (imageMatch && imageMatch[1]) {
        productData.image = imageMatch[1].trim();
      }
      
      // Amazon product description
      const descMatch = html.match(/<div\s+id="feature-bullets"[^>]*>.*?<ul[^>]*>(.*?)<\/ul>/is);
      if (descMatch && descMatch[1]) {
        const cleanDesc = descMatch[1].replace(/<li[^>]*>(.*?)<\/li>/gi, '$1\n');
        productData.description = cleanDesc.replace(/<[^>]*>/g, '').trim();
      }
    } 
    else if (platform === 'flipkart') {
      // Flipkart product title
      const titleMatch = html.match(/<span[^>]*class="B_NuCI"[^>]*>(.*?)<\/span>/is) || 
                         html.match(/<h1[^>]*class="yhB1nd"[^>]*>(.*?)<\/h1>/is);
      if (titleMatch && titleMatch[1]) {
        productData.name = titleMatch[1].trim();
      }
      
      // Flipkart product price
      const priceMatch = html.match(/<div[^>]*class="_30jeq3[^"]*"[^>]*>(.*?)<\/div>/is);
      if (priceMatch && priceMatch[1]) {
        productData.price = priceMatch[1].trim();
      }
      
      // Flipkart product image
      const imageMatch = html.match(/<img[^>]*class="_396cs4"[^>]*src="([^"]*)"[^>]*>/is) || 
                         html.match(/<img[^>]*class="_2r_T1I"[^>]*src="([^"]*)"[^>]*>/is);
      if (imageMatch && imageMatch[1]) {
        productData.image = imageMatch[1].trim();
      }
      
      // Flipkart product description
      const descMatch = html.match(/<div[^>]*class="_1mXcCf"[^>]*>(.*?)<\/div>/is);
      if (descMatch && descMatch[1]) {
        productData.description = descMatch[1].replace(/<[^>]*>/g, '').trim();
      }
    }
    
    console.log("Extracted product data:", productData);
    return productData;
  } catch (error) {
    console.error("Error in regex extraction:", error);
    return productData;
  }
}

// Main request handler
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    // Get Axiom API key from environment (optional, we'll use our own scraping as primary method)
    const axiomApiKey = Deno.env.get("AXIOM_API_KEY");
    
    // Get request body
    const requestData = await req.json();
    const { url, platform } = requestData;

    if (!url) {
      throw new Error("Missing required product URL");
    }

    console.log(`Starting product extraction for URL: ${url}`);

    // Determine which ecommerce platform we're working with
    const detectedPlatform = platform || 
      (url.includes('amazon') ? 'amazon' : 
      url.includes('flipkart') ? 'flipkart' : null);

    if (!detectedPlatform) {
      throw new Error("Unsupported ecommerce platform. Only Amazon and Flipkart are currently supported.");
    }
    
    // Attempt direct scraping first
    try {
      console.log("Attempting direct HTML scraping...");
      
      // Fetch the product page with a realistic user agent
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch product page: ${response.status} ${response.statusText}`);
      }
      
      const html = await response.text();
      console.log(`Fetched ${html.length} bytes of HTML`);
      
      // Use our regex-based extraction which is more reliable in Edge Functions
      const productData = extractProductDetails(html, detectedPlatform);
      
      // Check if we have enough data
      if (!productData.name) {
        throw new Error("Could not extract essential product data");
      }
      
      console.log("Successfully extracted product data:", productData);
      
      return new Response(
        JSON.stringify({
          success: true,
          message: "Product extracted successfully",
          productData,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
      
    } catch (scrapingError) {
      console.error("Direct scraping failed:", scrapingError);
      
      // If direct scraping fails, try calling our other Edge Function
      try {
        console.log("Falling back to Axiom AI function...");
        
        // Call the Axiom AI Edge Function which uses Puppeteer
        const { data: axiomData, error: axiomError } = await fetch(
          `https://utuguowpwezberrmqabw.functions.supabase.co/axiom-ai`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders
            },
            body: JSON.stringify({
              url,
              platform: detectedPlatform
            })
          }
        ).then(res => res.json());
        
        if (axiomError) {
          throw new Error(`Axiom AI function error: ${axiomError}`);
        }
        
        if (axiomData && axiomData.success && axiomData.productData) {
          console.log("Axiom AI function succeeded:", axiomData);
          
          return new Response(
            JSON.stringify({
              success: true,
              message: "Product extracted successfully",
              productData: axiomData.productData,
            }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 200,
            }
          );
        } else {
          throw new Error("Invalid response from Axiom AI function");
        }
      } catch (axiomError) {
        console.error("Axiom AI function failed:", axiomError);
        
        // If we also have an Axiom API key, try that as a last resort
        if (axiomApiKey) {
          console.log("Falling back to Axiom API...");
          
          // Call the Axiom AI API to extract product details
          const axiomResponse = await fetch("https://api.axiom.ai/v1/product/extract", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${axiomApiKey}`,
              "X-API-Version": "2023-09",
            },
            body: JSON.stringify({
              productUrl: url,
              platform: detectedPlatform,
              fields: ["name", "price", "description", "image", "availability", "specifications"],
              requestSource: "supabase-edge",
            }),
          });

          if (!axiomResponse.ok) {
            const errorData = await axiomResponse.json();
            console.error("Axiom API error:", errorData);
            throw new Error(`Axiom API error: ${errorData.message || "Unknown error"}`);
          }

          const axiomData = await axiomResponse.json();
          console.log("Axiom product extraction succeeded:", axiomData);

          // Format the response for the frontend
          const productData = {
            name: axiomData.name || "Unknown Product",
            price: axiomData.price || "0",
            description: axiomData.description || "",
            image: axiomData.image || "",
          };

          return new Response(
            JSON.stringify({
              success: true,
              message: "Product extracted successfully",
              productData,
              source: "axiom-api"
            }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 200,
            }
          );
        } else {
          // If all approaches fail, return the original scraping error
          throw scrapingError;
        }
      }
    }
  } catch (error) {
    console.error("Product extraction error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        message: "Product extraction failed",
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
