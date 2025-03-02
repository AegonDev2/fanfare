
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import puppeteer from "https://deno.land/x/puppeteer@16.2.0/mod.ts";

// CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Handle Amazon product extraction
async function extractAmazonProduct(page: any) {
  try {
    // Wait for essential product elements to load
    await page.waitForSelector('#productTitle', { timeout: 10000 }).catch(() => null);
    
    console.log("Extracting Amazon product data...");
    
    // Extract product details using page.evaluate
    const productData = await page.evaluate(() => {
      // Product title
      const titleElement = document.querySelector('#productTitle');
      const title = titleElement ? titleElement.textContent?.trim() : null;
      
      // Price - Amazon has multiple price selectors
      const priceSelectors = [
        '.a-price .a-offscreen', 
        '#priceblock_ourprice', 
        '#priceblock_dealprice',
        '.a-price-whole',
        '#corePrice_desktop .a-price .a-offscreen'
      ];
      
      let price = null;
      for (const selector of priceSelectors) {
        const priceElement = document.querySelector(selector);
        if (priceElement) {
          price = priceElement.textContent?.trim();
          break;
        }
      }
      
      // Image - try multiple selectors
      const imageSelectors = [
        '#landingImage', 
        '#imgBlkFront', 
        '#main-image',
        '#imgTagWrapperId img'
      ];
      
      let imageUrl = null;
      for (const selector of imageSelectors) {
        const imgElement = document.querySelector(selector) as HTMLImageElement;
        if (imgElement && imgElement.src) {
          imageUrl = imgElement.src;
          break;
        }
      }
      
      // Description
      const descriptionElement = document.querySelector('#feature-bullets, #productDescription');
      let description = descriptionElement ? descriptionElement.textContent?.trim() : null;
      
      // Trim description if it's too long
      if (description && description.length > 500) {
        description = description.substring(0, 500) + '...';
      }
      
      return {
        name: title,
        price: price,
        image: imageUrl,
        description: description
      };
    });
    
    console.log("Extracted Amazon product data:", productData);
    return productData;
  } catch (error) {
    console.error("Error extracting Amazon product:", error);
    throw new Error("Failed to extract Amazon product details");
  }
}

// Handle Flipkart product extraction
async function extractFlipkartProduct(page: any) {
  try {
    // Wait for essential product elements to load
    await page.waitForSelector('.B_NuCI', { timeout: 10000 }).catch(() => null);
    
    console.log("Extracting Flipkart product data...");
    
    // Extract product details
    const productData = await page.evaluate(() => {
      // Product title
      const titleElement = document.querySelector('.B_NuCI');
      const title = titleElement ? titleElement.textContent?.trim() : null;
      
      // Price
      const priceElement = document.querySelector('._30jeq3._16Jk6d');
      const price = priceElement ? priceElement.textContent?.trim() : null;
      
      // Image
      const imageElement = document.querySelector('._396cs4') as HTMLImageElement;
      const imageUrl = imageElement ? imageElement.src : null;
      
      // Description - try multiple selectors
      const descriptionSelectors = [
        '._1mXcCf.RmoJUa', 
        '._1AN87F',
        '._1Y4Vhm._4FO7b6'
      ];
      
      let description = null;
      for (const selector of descriptionSelectors) {
        const descElement = document.querySelector(selector);
        if (descElement) {
          description = descElement.textContent?.trim();
          break;
        }
      }
      
      // If no description found, try to get specs
      if (!description) {
        const specs = document.querySelectorAll('._2418kt');
        if (specs.length > 0) {
          const specTexts = [];
          for (let i = 0; i < Math.min(specs.length, 5); i++) {
            specTexts.push(specs[i].textContent?.trim());
          }
          description = specTexts.join('\n');
        }
      }
      
      // Trim description if it's too long
      if (description && description.length > 500) {
        description = description.substring(0, 500) + '...';
      }
      
      return {
        name: title,
        price: price,
        image: imageUrl,
        description: description
      };
    });
    
    console.log("Extracted Flipkart product data:", productData);
    return productData;
  } catch (error) {
    console.error("Error extracting Flipkart product:", error);
    throw new Error("Failed to extract Flipkart product details");
  }
}

// Main serve function
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }
  
  // Only accept POST requests
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  
  try {
    // Parse the request body
    const requestData = await req.json();
    const { url, retryCount = 0, platform } = requestData;
    
    console.log(`Processing product extraction request for URL: ${url}`);
    console.log(`Platform identified: ${platform}`);
    console.log(`Retry count: ${retryCount}`);
    
    if (!url) {
      throw new Error("URL is required");
    }
    
    // Validate URL format
    try {
      new URL(url);
    } catch (e) {
      throw new Error("Invalid URL format");
    }
    
    console.log("Launching headless browser...");
    
    // Launch Puppeteer browser with specific arguments to avoid detection
    const browser = await puppeteer.launch({
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1280,720',
        '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36'
      ],
      headless: true,
      timeout: 30000
    });
    
    try {
      const page = await browser.newPage();
      
      // Set extra HTTP headers to mimic a real browser
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Fetch-User': '?1',
        'sec-ch-ua': '"Google Chrome";v="102", " Not;A Brand";v="99", "Chromium";v="102"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"'
      });
      
      // Set viewport
      await page.setViewport({ width: 1280, height: 720 });
      
      // Enable JavaScript
      await page.setJavaScriptEnabled(true);
      
      console.log(`Navigating to URL: ${url}`);
      
      // Navigate to the URL with timeout
      const response = await page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: 20000
      });
      
      // Check response status
      if (!response) {
        throw new Error("Failed to load page. No response received.");
      }
      
      const status = response.status();
      console.log(`Response status: ${status}`);
      
      if (status >= 400) {
        throw new Error(`Page returned error status: ${status}`);
      }
      
      // Wait for the page to be fully loaded
      await page.waitForTimeout(2000);
      
      // Extract product data based on platform
      let productData;
      if (platform === 'amazon') {
        productData = await extractAmazonProduct(page);
      } else if (platform === 'flipkart') {
        productData = await extractFlipkartProduct(page);
      } else {
        throw new Error("Unsupported platform");
      }
      
      // Validate extracted data
      if (!productData.name) {
        throw new Error("Failed to extract product name");
      }
      
      return new Response(
        JSON.stringify({
          success: true,
          productData,
          message: "Successfully extracted product details"
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } finally {
      // Always close the browser to clean up resources
      await browser.close();
      console.log("Browser closed");
    }
  } catch (error) {
    console.error("Error in axiom-ai function:", error);
    
    // Return a structured error response
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "An unexpected error occurred",
        errorDetails: error.toString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
