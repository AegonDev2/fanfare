
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import * as cheerio from "https://esm.sh/cheerio@1.0.0-rc.12";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

console.log("Product extraction service started");

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
    
    // Fetch the product page
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch product page: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    
    let productData;
    if (url.includes('amazon')) {
      productData = extractAmazonProduct($);
    } else if (url.includes('flipkart')) {
      productData = extractFlipkartProduct($);
    }
    
    console.log("Extracted product data:", productData);
    
    return new Response(
      JSON.stringify({ success: true, productData }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
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

function extractAmazonProduct($) {
  try {
    console.log("Extracting Amazon product data");
    
    // Extract product name
    const name = $('#productTitle').text().trim();
    
    // Extract price
    let price = $('.a-price-whole').first().text();
    const priceFraction = $('.a-price-fraction').first().text();
    if (price && priceFraction) {
      price = `${price}${priceFraction}`;
    }
    
    // Extract image
    const image = $('#landingImage').attr('src') || $('#imgBlkFront').attr('src');
    
    // Extract description from feature bullets
    const bullets = [];
    $('#feature-bullets li span').each((i, el) => {
      bullets.push($(el).text().trim());
    });
    const description = bullets.join('\n');

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

function extractFlipkartProduct($) {
  try {
    console.log("Extracting Flipkart product data");
    
    // Extract product name
    const name = $('.B_NuCI').text().trim() || $('h1 span').text().trim();
    
    // Extract price
    let price = $('._30jeq3').text().trim().replace('₹', '');
    
    // Extract image
    const image = $('._396cs4').attr('src') || $('img._2r_T1I').attr('src');
    
    // Extract description
    const specs = [];
    $('._2418kt li, ._1AN87F').each((i, el) => {
      specs.push($(el).text().trim());
    });
    const description = specs.join('\n') || $('._1mXcCf').text().trim();

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
