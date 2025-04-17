
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import puppeteer from "https://deno.land/x/puppeteer@16.2.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

console.log("Product extraction service started with Puppeteer");

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log("Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Processing extraction request");
    const { url, platform } = await req.json();
    
    // Validate inputs
    if (!url) {
      return new Response(
        JSON.stringify({ success: false, error: "URL is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Validate platform
    if (!['amazon', 'flipkart'].includes(platform)) {
      return new Response(
        JSON.stringify({ success: false, error: "Unsupported platform" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    console.log(`Extracting data from ${platform} URL: ${url} using Puppeteer`);
    
    // Launch browser
    console.log("Launching browser");
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
      console.log("Creating new page");
      const page = await browser.newPage();
      
      // Set viewport and user agent
      await page.setViewport({ width: 1280, height: 800 });
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      console.log(`Navigating to: ${url}`);
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      
      console.log("Page loaded, extracting data");
      
      // Extract product data based on platform
      let productData;
      if (platform === 'amazon') {
        productData = await extractAmazonProduct(page);
      } else if (platform === 'flipkart') {
        productData = await extractFlipkartProduct(page);
      }
      
      console.log("Extracted product data:", productData);
      
      return new Response(
        JSON.stringify({ success: true, productData }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } finally {
      // Make sure to close the browser
      await browser.close();
      console.log("Browser closed");
    }
  } catch (error) {
    console.error("Error in product extraction:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error occurred" 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

async function extractAmazonProduct(page) {
  try {
    console.log("Extracting Amazon product data");
    
    // Wait for critical elements to load
    await Promise.race([
      page.waitForSelector('#productTitle', { timeout: 10000 }),
      page.waitForSelector('.a-price-whole', { timeout: 10000 })
    ]).catch(() => console.log("Some elements didn't load, continuing anyway"));
    
    // Extract product name
    const name = await page.evaluate(() => {
      const nameElement = document.querySelector('#productTitle');
      return nameElement ? nameElement.textContent.trim() : null;
    });
    
    // Extract price
    const price = await page.evaluate(() => {
      const priceElement = document.querySelector('.a-price-whole') || 
                          document.querySelector('#priceblock_ourprice') ||
                          document.querySelector('.a-price .a-offscreen');
      return priceElement ? priceElement.textContent.trim() : null;
    });
    
    // Extract image
    const image = await page.evaluate(() => {
      const imgElement = document.querySelector('#landingImage') || 
                         document.querySelector('#imgBlkFront') || 
                         document.querySelector('.a-dynamic-image');
      return imgElement ? imgElement.getAttribute('src') : null;
    });
    
    // Extract description
    const description = await page.evaluate(() => {
      let desc = '';
      const featureBullets = document.querySelector('#feature-bullets');
      if (featureBullets) {
        const bulletPoints = featureBullets.querySelectorAll('li');
        bulletPoints.forEach(bullet => {
          if (bullet.textContent) {
            desc += '• ' + bullet.textContent.trim() + '\n';
          }
        });
      }
      
      if (!desc) {
        const productDesc = document.querySelector('#productDescription');
        if (productDesc) {
          desc = productDesc.textContent.trim();
        }
      }
      return desc || 'No description available';
    });
    
    return { name, price, image, description, platform: 'amazon' };
  } catch (error) {
    console.error("Error extracting Amazon product:", error);
    return { name: "Error extracting product information", price: null, image: null, description: "Failed to extract product details", platform: 'amazon' };
  }
}

async function extractFlipkartProduct(page) {
  try {
    console.log("Extracting Flipkart product data");
    
    // Wait for critical elements to load
    await Promise.race([
      page.waitForSelector('.B_NuCI', { timeout: 10000 }),
      page.waitForSelector('._30jeq3', { timeout: 10000 })
    ]).catch(() => console.log("Some elements didn't load, continuing anyway"));
    
    // Extract product name
    const name = await page.evaluate(() => {
      const nameElement = document.querySelector('.B_NuCI');
      return nameElement ? nameElement.textContent.trim() : null;
    });
    
    // Extract price
    const price = await page.evaluate(() => {
      const priceElement = document.querySelector('._30jeq3');
      return priceElement ? priceElement.textContent.trim() : null;
    });
    
    // Extract image
    const image = await page.evaluate(() => {
      const imgElement = document.querySelector('._396cs4') || document.querySelector('._2r_T1I');
      return imgElement ? imgElement.getAttribute('src') : null;
    });
    
    // Extract description
    const description = await page.evaluate(() => {
      let desc = '';
      const specTable = document.querySelector('._14cfVK');
      if (specTable) {
        const rows = specTable.querySelectorAll('._1s_Smc');
        rows.forEach(row => {
          const label = row.querySelector('._1hKmbr')?.textContent?.trim();
          const value = row.querySelector('._21lJbe')?.textContent?.trim();
          if (label && value) {
            desc += label + ': ' + value + '\n';
          }
        });
      }
      
      if (!desc) {
        const descElement = document.querySelector('._1mXcCf');
        if (descElement) {
          desc = descElement.textContent?.trim() || '';
        }
      }
      return desc || 'No description available';
    });
    
    return { name, price, image, description, platform: 'flipkart' };
  } catch (error) {
    console.error("Error extracting Flipkart product:", error);
    return { name: "Error extracting product information", price: null, image: null, description: "Failed to extract product details", platform: 'flipkart' };
  }
}
