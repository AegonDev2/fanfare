
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

    console.log(`Extracting data from ${platform || 'unknown'} URL: ${url}`);
    
    // Auto-detect platform if not provided
    const detectedPlatform = platform || detectPlatformFromUrl(url);
    if (!detectedPlatform) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Could not determine platform. Only Amazon and Flipkart are supported." 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Fetch the product page
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1'
      }
    });

    if (!response.ok) {
      console.error(`Failed to fetch page: ${response.status} ${response.statusText}`);
      throw new Error(`Failed to fetch product page: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    
    console.log(`Loaded HTML of length: ${html.length} characters`);
    
    let productData;
    if (detectedPlatform === 'amazon') {
      productData = extractAmazonProduct($, html);
    } else if (detectedPlatform === 'flipkart') {
      productData = extractFlipkartProduct($);
    }
    
    // Validate that we got at least the name of the product
    if (!productData || !productData.name) {
      console.error("Extraction failed: Product name could not be found");
      throw new Error("Failed to extract product details. Please try a different URL or product.");
    }
    
    console.log("Successfully extracted product data:", productData);
    
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

function detectPlatformFromUrl(url: string): 'amazon' | 'flipkart' | undefined {
  if (url.includes('amazon')) return 'amazon';
  if (url.includes('flipkart')) return 'flipkart';
  return undefined;
}

function extractAmazonProduct($: cheerio.CheerioAPI, html: string) {
  try {
    console.log("Extracting Amazon product data");
    
    // Try multiple selectors for product name
    let name = $('#productTitle').text().trim();
    
    // If main selector fails, try alternative selectors
    if (!name) {
      name = $('#title').text().trim();
    }
    
    if (!name) {
      // Try to find the product name in the page metadata
      const metaTitle = $('meta[name="title"]').attr('content');
      if (metaTitle) {
        name = metaTitle.replace(/Amazon\.in:.*?:/, '').trim();
      }
    }
    
    if (!name) {
      // Try to extract from the HTML document title
      name = $('title').text().replace(/: Amazon\.in:.*$/, '').trim();
    }

    console.log("Extracted product name:", name || "Not found");
    
    // Extract price with multiple fallbacks
    let price = '';
    // Try the common price selectors
    price = $('.a-price-whole').first().text();
    if (!price) price = $('#priceblock_ourprice').text().trim();
    if (!price) price = $('#priceblock_dealprice').text().trim();
    if (!price) price = $('.a-price .a-offscreen').first().text().trim();
    if (!price) {
      // Try to find any element with "price" in the class or ID
      $('[class*="price"], [id*="price"]').each((i, el) => {
        const text = $(el).text().trim();
        if (text && text.match(/[\d,]+(\.\d{2})?/)) {
          price = text;
          return false; // break the each loop
        }
      });
    }
    
    price = price.replace(/[^\d.,]/g, ''); // Remove currency symbols, keep only numbers and decimal
    console.log("Extracted price:", price || "Not found");
    
    // Extract image with multiple fallbacks
    let image = $('#landingImage').attr('src') || 
                $('#imgBlkFront').attr('src') ||
                $('.a-dynamic-image').attr('src');
                
    if (!image) {
      // Try to find any image element with product in data attributes
      $('img[data-old-hires], img[data-a-dynamic-image]').each((i, el) => {
        const src = $(el).attr('src') || $(el).attr('data-old-hires') || $(el).attr('data-a-dynamic-image');
        if (src) {
          image = src;
          return false; // break the each loop
        }
      });
    }
    
    console.log("Extracted image URL:", image || "Not found");
    
    // Extract description from multiple sources
    let description = '';
    
    // Try featured bullets first
    const bullets = [];
    $('#feature-bullets li span').each((i, el) => {
      bullets.push($(el).text().trim());
    });
    
    if (bullets.length > 0) {
      description = bullets.join('\n');
    } else {
      // Try product description
      description = $('#productDescription').text().trim();
      
      // Try product overview
      if (!description) {
        description = $('#productOverview_feature_div').text().trim();
      }
      
      // Try any div with "description" in the ID
      if (!description) {
        $('[id*="description"], [class*="description"]').each((i, el) => {
          const text = $(el).text().trim();
          if (text && text.length > 20) { // Minimum length to avoid empty or useless descriptions
            description = text;
            return false; // break the each loop
          }
        });
      }
    }
    
    console.log("Description extracted:", description ? "Yes (length: " + description.length + ")" : "No");

    return {
      name,
      price,
      image,
      description: description || 'No description available',
      platform: 'amazon'
    };
  } catch (error) {
    console.error("Error extracting Amazon product:", error);
    throw new Error("Failed to extract Amazon product details: " + (error instanceof Error ? error.message : "Unknown error"));
  }
}

function extractFlipkartProduct($: cheerio.CheerioAPI) {
  try {
    console.log("Extracting Flipkart product data");
    
    // Extract product name
    const name = $('.B_NuCI').text().trim() || $('h1 span').text().trim();
    console.log("Extracted product name:", name || "Not found");
    
    // Extract price
    let price = $('._30jeq3').text().trim().replace('₹', '');
    if (!price) {
      // Try alternative selectors
      $('._25b18c, ._3I9_wc').each((i, el) => {
        const text = $(el).text().trim();
        if (text && text.includes('₹')) {
          price = text.replace('₹', '');
          return false; // break the each loop
        }
      });
    }
    console.log("Extracted price:", price || "Not found");
    
    // Extract image
    const image = $('._396cs4').attr('src') || $('img._2r_T1I').attr('src');
    console.log("Extracted image URL:", image || "Not found");
    
    // Extract description
    const specs = [];
    $('._2418kt li, ._1AN87F').each((i, el) => {
      specs.push($(el).text().trim());
    });
    
    let description = specs.join('\n');
    if (!description) {
      description = $('._1mXcCf').text().trim();
    }
    
    if (!description) {
      // Try to find any div with "description" or "about" in the class
      $('[class*="description"], [class*="about"]').each((i, el) => {
        const text = $(el).text().trim();
        if (text && text.length > 20) {
          description = text;
          return false;
        }
      });
    }
    
    console.log("Description extracted:", description ? "Yes (length: " + description.length + ")" : "No");

    return {
      name,
      price,
      image,
      description: description || 'No description available',
      platform: 'flipkart'
    };
  } catch (error) {
    console.error("Error extracting Flipkart product:", error);
    throw new Error("Failed to extract Flipkart product details: " + (error instanceof Error ? error.message : "Unknown error"));
  }
}
