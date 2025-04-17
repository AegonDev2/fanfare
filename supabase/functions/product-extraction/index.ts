
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import * as cheerio from "https://esm.sh/cheerio@1.0.0-rc.12";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

console.log("Enhanced product extraction service with ScrapingBee started");

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, platform } = await req.json();
    const SCRAPING_BEE_API_KEY = Deno.env.get('SCRAPING_BEE_API_KEY');
    
    if (!url) {
      throw new Error("URL is required");
    }

    if (!SCRAPING_BEE_API_KEY) {
      throw new Error("ScrapingBee API key not configured");
    }

    console.log(`Extracting data from ${platform || 'unknown'} URL: ${url}`);

    // Prepare ScrapingBee API URL with appropriate parameters
    const scrapingBeeUrl = new URL('https://app.scrapingbee.com/api/v1');
    scrapingBeeUrl.searchParams.append('api_key', SCRAPING_BEE_API_KEY);
    scrapingBeeUrl.searchParams.append('url', url);
    scrapingBeeUrl.searchParams.append('render_js', 'false');
    scrapingBeeUrl.searchParams.append('premium_proxy', 'true');
    
    // Add platform-specific parameters
    if (platform === 'amazon') {
      scrapingBeeUrl.searchParams.append('country_code', 'in');
    }

    console.log('Fetching page with ScrapingBee...');
    const response = await fetch(scrapingBeeUrl.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error(`ScrapingBee request failed: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    
    if (!html || html.length < 1000) {
      throw new Error("Received empty or invalid content from ScrapingBee");
    }
    
    console.log(`Successfully loaded HTML of length: ${html.length} characters`);
    
    const $ = cheerio.load(html);
    let productData;
    
    if (url.includes('amazon')) {
      productData = extractAmazonProduct($);
    } else if (url.includes('flipkart')) {
      productData = extractFlipkartProduct($);
    } else {
      throw new Error("Unsupported platform");
    }

    if (!productData?.name) {
      throw new Error("Failed to extract product details");
    }

    console.log("Successfully extracted product data:", productData);

    return new Response(
      JSON.stringify({ success: true, productData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in product extraction:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error occurred" 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});

function extractAmazonProduct($: cheerio.CheerioAPI) {
  console.log("Extracting Amazon product data");
  
  // Product name - try multiple selectors
  let name = $('#productTitle').text().trim();
  if (!name) {
    name = $('h1 span.a-size-large').text().trim();
  }
  if (!name) {
    name = $('h1').text().trim();
  }
  
  // Price - handle multiple price formats
  let price = '';
  const priceWhole = $('.a-price-whole').first().text().trim();
  const priceFraction = $('.a-price-fraction').first().text().trim();
  
  if (priceWhole) {
    price = priceWhole + (priceFraction ? '.' + priceFraction : '');
  } else {
    // Try alternative price selectors
    const altPriceElement = $('#priceblock_ourprice, #priceblock_dealprice, .a-price .a-offscreen, #price').first();
    price = altPriceElement.text().trim();
  }
  
  // Description
  let description = '';
  const bulletPoints: string[] = [];
  $('#feature-bullets li').each((_, el) => {
    const text = $(el).text().trim();
    if (text) bulletPoints.push(text);
  });
  
  if (bulletPoints.length > 0) {
    description = bulletPoints.join('\n');
  } else {
    description = $('#productDescription p').text().trim() || 
                 $('.a-expander-content').text().trim() || 
                 $('meta[name="description"]').attr('content') || 
                 'No description available';
  }
  
  // Image URL - try multiple selectors
  let image = $('#landingImage').attr('src');
  if (!image) image = $('.a-dynamic-image').attr('src');
  if (!image) image = $('img#main-image').attr('src');
  if (!image) image = $('meta[property="og:image"]').attr('content');
  if (!image) image = $('img.a-dynamic-image').first().attr('src');

  return {
    name,
    price,
    description,
    image,
    platform: 'amazon'
  };
}

function extractFlipkartProduct($: cheerio.CheerioAPI) {
  console.log("Extracting Flipkart product data");
  
  // Product name - try multiple selectors
  let name = $('.B_NuCI').text().trim();
  if (!name) {
    name = $('h1 span').text().trim();
  }
  if (!name) {
    name = $('h1').text().trim();
  }
  
  // Price - try multiple selectors
  let price = $('._30jeq3._16Jk6d').text().trim();
  if (!price) {
    price = $('._30jeq3').text().trim();
  }
  if (!price) {
    price = $('div._16Jk6d').text().trim();
  }
  
  // Remove currency symbol and convert to number
  price = price.replace(/^₹/, '').trim();
  
  // Description - try multiple approaches
  let description = '';
  const specs: string[] = [];
  
  // Try feature bullet points first
  $('._2418kt li, ._1AN87F').each((_, el) => {
    const text = $(el).text().trim();
    if (text) specs.push(text);
  });
  
  // If no bullet points, try other description elements
  if (specs.length > 0) {
    description = specs.join('\n');
  } else {
    description = $('._1mXcCf, .RmoJUa').text().trim() || 
                 $('div._1AN87F').text().trim() ||
                 $('meta[name="description"]').attr('content') || 
                 'No description available';
  }
  
  // Image URL - try multiple selectors
  let image = $('img._396cs4._2amPTt._3qGmMb').attr('src');
  if (!image) image = $('._396cs4').attr('src');
  if (!image) image = $('img._396cs4').attr('src');
  if (!image) image = $('meta[property="og:image"]').attr('content');
  if (!image) image = $('div._3kidJX img').attr('src');

  return {
    name,
    price,
    description,
    image,
    platform: 'flipkart'
  };
}
