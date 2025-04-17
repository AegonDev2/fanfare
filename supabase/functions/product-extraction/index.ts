
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import * as cheerio from "https://esm.sh/cheerio@1.0.0-rc.12";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

console.log("Enhanced product extraction service with ScrapingBee started");

serve(async (req) => {
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
    const response = await fetch(scrapingBeeUrl.toString());
    
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
  
  // Product name
  let name = $('#productTitle').text().trim();
  if (!name) {
    name = $('h1 span').text().trim();
  }
  
  // Price - handle multiple price formats
  let price = '';
  const priceElement = $('.a-price-whole').first();
  if (priceElement.length) {
    price = priceElement.text().trim();
  } else {
    const altPriceElement = $('#priceblock_ourprice, #priceblock_dealprice, .a-price .a-offscreen').first();
    price = altPriceElement.text().trim();
  }
  
  // Description
  let description = '';
  const bulletPoints: string[] = [];
  $('#feature-bullets li').each((_, el) => {
    bulletPoints.push($(el).text().trim());
  });
  description = bulletPoints.join('\n');
  
  if (!description) {
    description = $('#productDescription').text().trim();
  }
  
  // Image URL
  let image = $('#landingImage').attr('src');
  if (!image) {
    image = $('.a-dynamic-image').attr('src');
  }
  if (!image) {
    image = $('meta[property="og:image"]').attr('content');
  }

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
  
  // Product name
  let name = $('.B_NuCI').text().trim();
  if (!name) {
    name = $('h1 span').text().trim();
  }
  
  // Price
  let price = $('._30jeq3._16Jk6d').text().trim();
  if (!price) {
    price = $('._30jeq3').text().trim();
  }
  
  // Remove currency symbol and convert to number
  price = price.replace(/^₹/, '').trim();
  
  // Description
  let description = '';
  const specs: string[] = [];
  $('._2418kt li, ._1AN87F').each((_, el) => {
    specs.push($(el).text().trim());
  });
  description = specs.join('\n');
  
  if (!description) {
    description = $('._1mXcCf').text().trim();
  }
  
  // Image URL
  let image = $('img._396cs4._2amPTt._3qGmMb').attr('src');
  if (!image) {
    image = $('._396cs4').attr('src');
  }
  if (!image) {
    image = $('meta[property="og:image"]').attr('content');
  }

  return {
    name,
    price,
    description,
    image,
    platform: 'flipkart'
  };
}
