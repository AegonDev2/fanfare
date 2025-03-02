
// axiom-ai/index.ts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import puppeteer from "https://deno.land/x/puppeteer@16.2.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

console.log("Axiom AI function started");

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log("Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Processing extraction request");
    const { url, platform, retryCount = 0 } = await req.json();
    
    if (!url) {
      return new Response(
        JSON.stringify({ success: false, error: "URL is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    console.log(`Extracting from ${platform} URL: ${url}`);
    
    // Validate platform
    if (!['amazon', 'flipkart'].includes(platform)) {
      return new Response(
        JSON.stringify({ success: false, error: "Unsupported platform" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Initialize browser with appropriate settings
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1280,720',
      ],
    });

    try {
      console.log("Browser launched, opening page");
      const page = await browser.newPage();
      
      // Set a realistic user agent to avoid detection
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      
      // Set viewport to a common resolution
      await page.setViewport({ width: 1280, height: 720 });
      
      // Set request timeout and navigation timeout (in milliseconds)
      page.setDefaultNavigationTimeout(30000);
      page.setDefaultTimeout(30000);
      
      // Block unnecessary resources to speed up loading
      await page.setRequestInterception(true);
      page.on('request', (req) => {
        const resourceType = req.resourceType();
        if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
          req.abort();
        } else {
          req.continue();
        }
      });

      console.log(`Navigating to ${url}`);
      const response = await page.goto(url, { waitUntil: 'domcontentloaded' });
      
      if (!response) {
        throw new Error("Failed to load the page");
      }
      
      const status = response.status();
      console.log(`Page loaded with status: ${status}`);
      
      if (status >= 400) {
        throw new Error(`Page returned status code: ${status}`);
      }
      
      // Wait for the main content to load
      await page.waitForTimeout(2000);
      
      // Platform-specific extraction logic
      let productData;
      if (platform === 'flipkart') {
        productData = await extractFlipkartProductData(page);
      } else if (platform === 'amazon') {
        productData = await extractAmazonProductData(page);
      }
      
      if (!productData.name) {
        throw new Error("Failed to extract essential product data");
      }
      
      console.log("Successfully extracted product data:", productData);
      
      await browser.close();
      console.log("Browser closed");
      
      return new Response(
        JSON.stringify({ success: true, productData }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
      
    } catch (error) {
      await browser.close();
      console.error("Error during extraction:", error);
      throw error;
    }
    
  } catch (error) {
    console.error("Error in Axiom AI function:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error occurred" 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 500 
      }
    );
  }
});

async function extractFlipkartProductData(page) {
  console.log("Extracting Flipkart product data");
  
  try {
    // Wait for product page elements to load
    await page.waitForSelector("span.B_NuCI", { timeout: 5000 }).catch(() => console.log("Product title not found"));
    await page.waitForSelector("div._30jeq3", { timeout: 5000 }).catch(() => console.log("Price not found"));
    
    // Extract product information
    const productData = await page.evaluate(() => {
      const name = document.querySelector("span.B_NuCI")?.textContent?.trim() || null;
      const price = document.querySelector("div._30jeq3")?.textContent?.trim() || null;
      
      // Get the first product image
      const imageElement = document.querySelector("img._396cs4") || document.querySelector("img._2r_T1I");
      const image = imageElement ? imageElement.src : null;
      
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
      
      // If no specs found, try to get the description text
      if (!description) {
        const descElement = document.querySelector("div._1mXcCf");
        description = descElement ? descElement.textContent?.trim() || "" : "";
      }
      
      return { name, price, image, description };
    });
    
    console.log("Flipkart extraction successful:", productData);
    return productData;
  } catch (error) {
    console.error("Error extracting Flipkart data:", error);
    throw new Error("Failed to extract Flipkart product data: " + error.message);
  }
}

async function extractAmazonProductData(page) {
  console.log("Extracting Amazon product data");
  
  try {
    // Wait for product page elements to load
    await page.waitForSelector("#productTitle", { timeout: 5000 }).catch(() => console.log("Product title not found"));
    await page.waitForSelector(".a-price .a-offscreen", { timeout: 5000 }).catch(() => console.log("Price not found"));
    
    // Extract product information
    const productData = await page.evaluate(() => {
      const name = document.querySelector("#productTitle")?.textContent?.trim() || null;
      
      // Try different price selectors as Amazon has multiple formats
      const priceElement = document.querySelector(".a-price .a-offscreen") || 
                           document.querySelector("#priceblock_ourprice") || 
                           document.querySelector(".a-price-whole");
      const price = priceElement?.textContent?.trim() || null;
      
      // Get the primary product image
      const imageElement = document.querySelector("#landingImage") || 
                          document.querySelector("#imgBlkFront") || 
                          document.querySelector(".a-dynamic-image");
      const image = imageElement ? imageElement.src : null;
      
      // Get product description
      let description = "";
      
      // Try to get from feature bullets
      const featureBullets = document.querySelector("#feature-bullets");
      if (featureBullets) {
        const bullets = featureBullets.querySelectorAll("li");
        bullets.forEach(bullet => {
          if (bullet.textContent) {
            description += bullet.textContent.trim() + "\n";
          }
        });
      }
      
      // If no bullets, try product description
      if (!description) {
        const descElement = document.querySelector("#productDescription") || 
                           document.querySelector("#aplus");
        description = descElement ? descElement.textContent?.trim() || "" : "";
      }
      
      return { name, price, image, description };
    });
    
    console.log("Amazon extraction successful:", productData);
    return productData;
  } catch (error) {
    console.error("Error extracting Amazon data:", error);
    throw new Error("Failed to extract Amazon product data: " + error.message);
  }
}
