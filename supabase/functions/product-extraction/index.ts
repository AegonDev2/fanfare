
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
    
    if (!url) {
      return new Response(
        JSON.stringify({ success: false, error: "URL is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    console.log(`Extracting data from ${platform} URL: ${url}`);
    
    // Launch browser with specific configuration for Deno/Supabase environment
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-software-rasterizer'
      ]
    });
    
    try {
      console.log("Creating new page");
      const page = await browser.newPage();
      
      // Set viewport and user agent
      await page.setViewport({ width: 1280, height: 800 });
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      console.log(`Navigating to: ${url}`);
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      
      let productData;
      if (url.includes('amazon')) {
        productData = await extractAmazonProduct(page);
      } else if (url.includes('flipkart')) {
        productData = await extractFlipkartProduct(page);
      }
      
      console.log("Extracted product data:", productData);
      
      return new Response(
        JSON.stringify({ success: true, productData }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } finally {
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
    
    // Wait for price element
    const priceSelector = 'span.a-price-whole';
    await page.waitForSelector(priceSelector, { timeout: 20000 });
    const price = await page.$eval(priceSelector, el => el.innerText);
    
    // Wait for title element
    const titleSelector = '#productTitle';
    await page.waitForSelector(titleSelector, { timeout: 20000 });
    const name = await page.$eval(titleSelector, el => el.innerText.trim());
    
    // Extract image
    const imageSelector = '#landingImage';
    await page.waitForSelector(imageSelector, { timeout: 20000 });
    const image = await page.$eval(imageSelector, el => el.getAttribute('src'));
    
    // Extract description from feature bullets
    const description = await page.evaluate(() => {
      const bullets = Array.from(document.querySelectorAll('#feature-bullets li span')).map(el => el.textContent.trim());
      return bullets.join('\n');
    });

    return { 
      name, 
      price, 
      image, 
      description: description || 'No description available',
      platform: 'amazon'
    };
  } catch (error) {
    console.error("Error extracting Amazon product:", error);
    throw error;
  }
}

async function extractFlipkartProduct(page) {
  try {
    console.log("Extracting Flipkart product data");
    
    // Wait for price element
    const priceSelector = '._30jeq3';
    await page.waitForSelector(priceSelector, { timeout: 20000 });
    const price = await page.$eval(priceSelector, el => el.innerText.replace('₹', '').trim());
    
    // Wait for title element
    const titleSelector = '.B_NuCI';
    await page.waitForSelector(titleSelector, { timeout: 20000 });
    const name = await page.$eval(titleSelector, el => el.innerText.trim());
    
    // Extract image
    const imageSelector = '._396cs4';
    await page.waitForSelector(imageSelector, { timeout: 20000 });
    const image = await page.$eval(imageSelector, el => el.getAttribute('src'));
    
    // Extract description
    const description = await page.evaluate(() => {
      const specs = Array.from(document.querySelectorAll('._2418kt li')).map(el => el.textContent.trim());
      return specs.join('\n');
    });

    return { 
      name, 
      price, 
      image, 
      description: description || 'No description available',
      platform: 'flipkart'
    };
  } catch (error) {
    console.error("Error extracting Flipkart product:", error);
    throw error;
  }
}
