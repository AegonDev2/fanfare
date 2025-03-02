
// @ts-ignore
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.6";
import puppeteer from "https://deno.land/x/puppeteer@16.2.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

interface RequestPayload {
  url: string;
  retryCount?: number;
}

interface ExtractedProduct {
  name: string | null;
  price: string | null;
  image: string | null;
  description: string | null;
}

const extractAmazonProduct = async (page: any): Promise<ExtractedProduct> => {
  try {
    await page.waitForSelector('#productTitle, #title', { timeout: 5000 }).catch(() => null);
    
    const name = await page.evaluate(() => {
      const title = document.querySelector('#productTitle, #title');
      return title ? title.textContent?.trim() : null;
    }).catch(() => null);

    const price = await page.evaluate(() => {
      const selectors = [
        '.a-price .a-offscreen', 
        '#priceblock_ourprice', 
        '#priceblock_dealprice',
        '.apexPriceToPay .a-offscreen'
      ];
      
      for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element && element.textContent) {
          return element.textContent.trim();
        }
      }
      
      return null;
    }).catch(() => null);

    const image = await page.evaluate(() => {
      const img = document.querySelector('#landingImage, #imgBlkFront, .image-stretch-vertical img');
      return img ? img.getAttribute('src') : null;
    }).catch(() => null);

    const description = await page.evaluate(() => {
      const descElement = document.querySelector('#feature-bullets, #productDescription');
      return descElement ? descElement.textContent?.trim().substring(0, 500) : null;
    }).catch(() => null);

    return { name, price, image, description };
  } catch (error) {
    console.error('Error extracting Amazon product:', error);
    return { name: null, price: null, image: null, description: null };
  }
};

const extractFlipkartProduct = async (page: any): Promise<ExtractedProduct> => {
  try {
    await page.waitForSelector('.B_NuCI, ._30jeq3, .CXW8mj img', { timeout: 5000 }).catch(() => null);

    const name = await page.evaluate(() => {
      const title = document.querySelector('.B_NuCI, ._35KyD6');
      return title ? title.textContent?.trim() : null;
    }).catch(() => null);

    const price = await page.evaluate(() => {
      const priceEl = document.querySelector('._30jeq3, ._1vC4OE');
      return priceEl ? priceEl.textContent?.trim() : null;
    }).catch(() => null);

    const image = await page.evaluate(() => {
      const img = document.querySelector('.CXW8mj img, ._396cs4, ._2r_T1I');
      return img ? img.getAttribute('src') : null;
    }).catch(() => null);

    const description = await page.evaluate(() => {
      const descElement = document.querySelector('._1mXcCf, ._3qDDRJ');
      return descElement ? descElement.textContent?.trim().substring(0, 500) : null;
    }).catch(() => null);

    return { name, price, image, description };
  } catch (error) {
    console.error('Error extracting Flipkart product:', error);
    return { name: null, price: null, image: null, description: null };
  }
};

serve(async (req: Request) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    // Parse request
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ success: false, error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload: RequestPayload = await req.json();
    const { url, retryCount = 0 } = payload;

    console.log(`Processing URL: ${url}, Retry count: ${retryCount}`);

    if (!url) {
      return new Response(
        JSON.stringify({ success: false, error: "URL is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Detect platform (Amazon or Flipkart)
    let platform: 'amazon' | 'flipkart' | null = null;
    if (url.includes('amazon')) {
      platform = 'amazon';
    } else if (url.includes('flipkart')) {
      platform = 'flipkart';
    }

    if (!platform) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Unsupported platform. Currently only Amazon and Flipkart are supported." 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Detected platform: ${platform}`);

    // Launch browser
    console.log("Launching browser...");
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();
      
      // Set user agent to avoid detection
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
      );

      // Timeout for navigation (15 seconds)
      const navigationTimeout = 15000;
      
      console.log(`Navigating to URL: ${url}`);
      await page.goto(url, { 
        waitUntil: 'domcontentloaded',
        timeout: navigationTimeout
      });

      // Wait for a bit to let the page load fully
      await page.waitForTimeout(2000);

      console.log("Extracting product data...");
      let productData: ExtractedProduct;

      if (platform === 'amazon') {
        productData = await extractAmazonProduct(page);
      } else {
        productData = await extractFlipkartProduct(page);
      }

      console.log("Extracted product data:", productData);

      // Validate extracted data
      const isDataComplete = productData.name && productData.price;
      
      if (isDataComplete) {
        return new Response(
          JSON.stringify({
            success: true,
            productData,
            platform
          }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      } else {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Failed to extract complete product data",
            partialData: productData,
            platform
          }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    } finally {
      await browser.close();
      console.log("Browser closed");
    }
  } catch (error) {
    console.error("Error processing request:", error);
    
    // Check if it's a timeout error (common for 529 responses)
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const status = errorMessage.includes("timeout") || errorMessage.includes("529") ? 
      529 : 500;
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: `Failed to fetch URL: ${status === 529 ? '529' : errorMessage}`,
        url: payload?.url 
      }),
      {
        status: 200, // Always return 200 to the client even for server errors
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
