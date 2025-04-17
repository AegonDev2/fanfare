
// Follow ES module imports
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38-alpha.2/deno-dom-wasm.ts";

// CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Simple HTML parsing function using regex as a fallback if DOM parsing fails
function extractWithRegex(html, selectors) {
  const results = {};
  
  if (selectors.title) {
    const titleMatch = html.match(selectors.title);
    if (titleMatch && titleMatch[1]) {
      results.name = titleMatch[1].trim();
    }
  }
  
  if (selectors.price) {
    const priceMatch = html.match(selectors.price);
    if (priceMatch && priceMatch[1]) {
      results.price = priceMatch[1].trim();
    }
  }
  
  if (selectors.image) {
    const imageMatch = html.match(selectors.image);
    if (imageMatch && imageMatch[1]) {
      results.image = imageMatch[1].trim();
    }
  }
  
  if (selectors.description) {
    const descMatch = html.match(selectors.description);
    if (descMatch && descMatch[1]) {
      results.description = descMatch[1].trim();
    }
  }
  
  return results;
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
      
      let productData = {};
      
      // Try DOM parsing first
      try {
        const parser = new DOMParser();
        const document = parser.parseFromString(html, "text/html");
        
        if (!document) {
          throw new Error("Failed to parse HTML");
        }
        
        if (detectedPlatform === 'flipkart') {
          // Extract Flipkart product data
          const name = document.querySelector("span.B_NuCI")?.textContent?.trim() || 
                      document.querySelector("h1.yhB1nd")?.textContent?.trim();
                      
          const price = document.querySelector("div._30jeq3")?.textContent?.trim() ||
                       document.querySelector("div._16Jk6d")?.textContent?.trim();
                       
          const image = document.querySelector("img._396cs4")?.getAttribute("src") || 
                       document.querySelector("img._2r_T1I")?.getAttribute("src");
          
          // Get product description
          let description = "";
          const specLists = document.querySelectorAll("div._3k-BhJ");
          specLists.forEach(list => {
            const specs = list.querySelectorAll("li");
            specs.forEach(spec => {
              if (spec.textContent) {
                description += spec.textContent.trim() + "\n";
              }
            });
          });
          
          if (!description) {
            const descElement = document.querySelector("div._1mXcCf");
            description = descElement ? descElement.textContent?.trim() || "" : "";
          }
          
          productData = { name, price, image, description };
        } else if (detectedPlatform === 'amazon') {
          // Extract Amazon product data
          const name = document.querySelector("#productTitle")?.textContent?.trim();
          
          const priceElement = document.querySelector(".a-price .a-offscreen") || 
                              document.querySelector("#priceblock_ourprice") || 
                              document.querySelector(".a-price-whole");
          const price = priceElement?.textContent?.trim();
          
          const imageElement = document.querySelector("#landingImage") || 
                              document.querySelector("#imgBlkFront") || 
                              document.querySelector(".a-dynamic-image");
          const image = imageElement?.getAttribute("src") || imageElement?.getAttribute("data-old-hires");
          
          // Get product description
          let description = "";
          const featureBullets = document.querySelector("#feature-bullets");
          if (featureBullets) {
            const bullets = featureBullets.querySelectorAll("li");
            bullets.forEach(bullet => {
              if (bullet.textContent) {
                description += bullet.textContent.trim() + "\n";
              }
            });
          }
          
          if (!description) {
            const descElement = document.querySelector("#productDescription") || 
                              document.querySelector("#aplus");
            description = descElement ? descElement.textContent?.trim() || "" : "";
          }
          
          productData = { name, price, image, description };
        }
      } catch (domError) {
        console.error("DOM parsing failed, falling back to regex:", domError);
        
        // Fall back to regex extraction if DOM parsing fails
        const regexSelectors = {
          flipkart: {
            title: /<span class="B_NuCI"[^>]*>(.*?)<\/span>/i,
            price: /<div class="_30jeq3[^>]*>(.*?)<\/div>/i,
            image: /<img[^>]*class="_396cs4"[^>]*src="([^"]*)"[^>]*>/i,
            description: /<div class="_1mXcCf"[^>]*>(.*?)<\/div>/is
          },
          amazon: {
            title: /<span id="productTitle"[^>]*>(.*?)<\/span>/i,
            price: /<span class="a-price-whole"[^>]*>(.*?)<\/span>/i,
            image: /<img[^>]*id="landingImage"[^>]*src="([^"]*)"[^>]*>/i,
            description: /<div id="feature-bullets"[^>]*>(.*?)<\/div>/is
          }
        };
        
        productData = extractWithRegex(html, regexSelectors[detectedPlatform]);
      }
      
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
      
      // If direct scraping fails and we have an Axiom API key, try Axiom API as fallback
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
          price: parseFloat(axiomData.price?.replace(/[^\d.]/g, "") || "0"),
          description: axiomData.description || "",
          image: axiomData.image || "",
          availability: axiomData.availability || true,
          specifications: axiomData.specifications || {},
          platform: detectedPlatform,
        };

        return new Response(
          JSON.stringify({
            success: true,
            message: "Product extracted successfully",
            data: {
              productData,
              axiomJobId: axiomData.job_id || null,
            },
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        );
      } else {
        // If both approaches fail, return the scraping error
        throw scrapingError;
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
