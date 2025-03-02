
// follow-redirects is a package that automatically follows HTTP redirects
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import * as cheerio from "https://esm.sh/cheerio@1.0.0-rc.12";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

const RETRY_COUNT = 5;
const RETRY_DELAY_MS = 2000;

async function fetchWithRetry(url: string, options: RequestInit = {}, retries = RETRY_COUNT): Promise<Response> {
  try {
    // Add a more realistic user agent
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Cache-Control': 'no-cache',
      ...options.headers,
    };
    
    console.log(`Fetching URL: ${url}`);
    const response = await fetch(url, { ...options, headers });
    
    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response;
  } catch (error) {
    if (retries > 0) {
      console.log(`Retry attempt ${RETRY_COUNT - retries + 1}/${RETRY_COUNT}`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
      return fetchWithRetry(url, options, retries - 1);
    }
    
    throw new Error(`Failed to fetch after ${RETRY_COUNT} attempts: ${error.message}`);
  }
}

// Amazon product data extractor
async function extractAmazonProductData(url: string) {
  const response = await fetchWithRetry(url);
  const html = await response.text();
  const $ = cheerio.load(html);
  
  console.log("Successfully loaded Amazon page");

  // Extract product info
  const name = $('#productTitle').text().trim();
  const priceElement = $('.a-price .a-offscreen').first();
  const priceText = priceElement.text().trim().replace(/[₹,]/g, '');
  const price = parseFloat(priceText) || 0;
  
  // Get description
  const description = $('#feature-bullets .a-list-item')
    .map((_, el) => $(el).text().trim())
    .get()
    .join(' ');
  
  // Get image
  const image = $('#landingImage').attr('src') || 
                $('img#imgBlkFront').attr('src') || 
                $('.a-dynamic-image').first().attr('src') || '';
  
  return {
    name,
    price,
    priceInr: price,
    description: description || "No description available",
    image
  };
}

// Flipkart product data extractor
async function extractFlipkartProductData(url: string, productId: string | null) {
  try {
    let finalUrl = url;
    
    // If we have a product ID but the URL doesn't contain it properly, construct a clean URL
    if (productId && !url.includes(`/p/${productId}`)) {
      finalUrl = `https://www.flipkart.com/product/p/${productId}`;
      console.log(`Using reconstructed Flipkart URL: ${finalUrl}`);
    }
    
    const response = await fetchWithRetry(finalUrl);
    const html = await response.text();
    const $ = cheerio.load(html);
    
    console.log("Successfully loaded Flipkart page");
    
    // Extract product name
    const name = $('.B_NuCI').text().trim() || 
                 $('h1 span').text().trim() || 
                 $('h1').text().trim();
    
    // Extract price
    let priceText = $('._30jeq3._16Jk6d').text().trim().replace(/[₹,]/g, '') || 
                    $('._30jeq3').text().trim().replace(/[₹,]/g, '');
    const price = parseFloat(priceText) || 0;
    
    // Extract description
    let description = '';
    $('._2418kt').each((_, el) => {
      description += $(el).text().trim() + ' ';
    });
    
    if (!description) {
      $('.g2dDAR').each((_, el) => {
        description += $(el).text().trim() + ' ';
      });
    }
    
    // Extract image
    const image = $('._396cs4').attr('src') || 
                  $('.CXW8mj img').attr('src') || 
                  $('img._396cs4').attr('src') || '';

    console.log({
      name,
      price,
      description: description.substring(0, 50) + '...',
      image: image ? 'Image found' : 'No image found'
    });
    
    return {
      name,
      price,
      priceInr: price,
      description: description || "No description available",
      image
    };
  } catch (error) {
    console.error("Error extracting Flipkart data:", error);
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const { url, platform, productId } = await req.json();
    
    if (!url) {
      return new Response(
        JSON.stringify({ error: "URL is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    console.log(`Processing ${platform} product URL: ${url}`);
    let productData;

    // Extract product data based on platform
    if (platform === 'amazon') {
      productData = await extractAmazonProductData(url);
    } else if (platform === 'flipkart') {
      productData = await extractFlipkartProductData(url, productId);
    } else {
      return new Response(
        JSON.stringify({ error: "Unsupported platform" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    console.log("Successfully extracted product data:", productData.name);
    
    return new Response(
      JSON.stringify(productData),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in fetch-product function:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Failed to fetch product details", 
        details: error.message 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 500 
      }
    );
  }
});
