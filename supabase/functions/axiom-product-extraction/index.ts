
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import puppeteer from 'https://deno.land/x/puppeteer@16.2.0/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Get the Axiom AI API key from Supabase secrets
// This would need to be set through the Supabase console
const AXIOM_API_KEY = Deno.env.get('AXIOM_API_KEY') || '';

interface RequestBody {
  url: string;
  platform?: 'amazon' | 'flipkart';
  retryCount?: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Get the request body
    const requestData = await req.json() as RequestBody;

    if (!requestData.url) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Product URL is required" 
        }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 400 }
      );
    }

    // Detect platform if not provided
    const platform = requestData.platform || detectPlatform(requestData.url);
    
    if (!platform) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Unsupported platform. Currently only Amazon and Flipkart are supported." 
        }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 400 }
      );
    }

    console.log(`Axiom AI: Extracting product data from ${platform} URL: ${requestData.url}`);

    // If using Axiom API (via external API):
    if (AXIOM_API_KEY) {
      // This would call the external Axiom AI API with your API key
      try {
        const axiomResponse = await fetch('https://api.axiom.ai/v1/product-extraction', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${AXIOM_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: requestData.url,
            platform: platform
          })
        });

        if (!axiomResponse.ok) {
          const errorData = await axiomResponse.json();
          console.error('Axiom API error:', errorData);
          throw new Error(errorData.message || 'Failed to extract product data from Axiom API');
        }

        const data = await axiomResponse.json();
        return new Response(
          JSON.stringify({ 
            success: true, 
            productData: data.productData 
          }),
          { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      } catch (error) {
        console.error('Error calling Axiom API:', error);
        // Fall back to puppeteer extraction if API fails
        console.log('Falling back to Puppeteer extraction...');
      }
    }

    // Fallback: Use Puppeteer for extraction if API key is not available or API call failed
    const browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
      const page = await browser.newPage();
      
      // Set a reasonable timeout
      await page.setDefaultNavigationTimeout(30000);
      
      // Set user agent to avoid detection
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36');
      
      console.log(`Navigating to ${requestData.url}`);
      await page.goto(requestData.url, { waitUntil: 'domcontentloaded' });
      
      // Wait for main content to load
      await page.waitForTimeout(2000);

      let productData;
      
      if (platform === 'amazon') {
        productData = await extractAmazonProductData(page);
      } else if (platform === 'flipkart') {
        productData = await extractFlipkartProductData(page);
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          productData 
        }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    } catch (error) {
      console.error(`Error extracting product data: ${error.message}`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Failed to extract product data: ${error.message}` 
        }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
      );
    } finally {
      await browser.close();
    }
  } catch (error) {
    console.error(`Error processing request: ${error.message}`);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: `Server error: ${error.message}` 
      }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
    );
  }
});

// Helper function to detect platform from URL
function detectPlatform(url: string): 'amazon' | 'flipkart' | undefined {
  if (url.includes('amazon')) return 'amazon';
  if (url.includes('flipkart')) return 'flipkart';
  return undefined;
}

// Extract product data from Amazon
async function extractAmazonProductData(page: any) {
  return await page.evaluate(() => {
    const name = document.querySelector('#productTitle')?.textContent?.trim() || null;
    
    // Try different price selectors
    let priceElement = document.querySelector('.a-price .a-offscreen') || 
                       document.querySelector('#priceblock_ourprice') ||
                       document.querySelector('.a-price-whole');
    
    const price = priceElement ? priceElement.textContent.trim() : null;
    
    // Get primary image
    const imageElement = document.querySelector('#landingImage') || 
                         document.querySelector('#imgBlkFront') ||
                         document.querySelector('.a-dynamic-image');
    
    let image = null;
    if (imageElement) {
      image = imageElement.getAttribute('src') || imageElement.getAttribute('data-old-hires');
    }
    
    // Get description
    const description = document.querySelector('#productDescription p')?.textContent?.trim() || 
                        document.querySelector('.a-expander-content p')?.textContent?.trim() ||
                        null;
    
    return {
      name,
      price,
      image,
      description
    };
  });
}

// Extract product data from Flipkart
async function extractFlipkartProductData(page: any) {
  return await page.evaluate(() => {
    const name = document.querySelector('.B_NuCI')?.textContent?.trim() || 
                document.querySelector('h1.yhB1nd')?.textContent?.trim() || null;
    
    const price = document.querySelector('._30jeq3._16Jk6d')?.textContent?.trim() ||
                 document.querySelector('._30jeq3')?.textContent?.trim() || null;
    
    // Get primary image
    const imageElement = document.querySelector('._396cs4') || 
                         document.querySelector('._2amPTt img');
    
    const image = imageElement ? imageElement.getAttribute('src') : null;
    
    // Get description
    const description = document.querySelector('._1mXcCf p')?.textContent?.trim() ||
                        document.querySelector('._1mXcCf div')?.textContent?.trim() ||
                        document.querySelector('._2o-xpa')?.textContent?.trim() || null;
    
    return {
      name,
      price,
      image,
      description
    };
  });
}
