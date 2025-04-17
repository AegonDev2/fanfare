// @deno-types="https://cdn.skypack.dev/@types/cheerio@0.22.31"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import * as cheerio from "https://esm.sh/cheerio@1.0.0-rc.12";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

console.log("Enhanced product extraction service started");

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Received product extraction request");
    const { url, platform, retryCount } = await req.json();
    const SCRAPING_BEE_API_KEY = Deno.env.get('SCRAPING_BEE_API_KEY');
    
    if (!url) {
      throw new Error("URL is required");
    }

    if (!SCRAPING_BEE_API_KEY) {
      throw new Error("ScrapingBee API key not configured");
    }

    console.log(`Extracting data from ${platform || 'unknown'} URL: ${url}`);
    console.log(`Retry count: ${retryCount || 0}`);

    // Normalize URL to reduce chance of blocking
    const simplifiedUrl = simplifyProductUrl(url);
    const targetUrl = simplifiedUrl || url;
    
    console.log(`Using URL for extraction: ${targetUrl}`);

    // For direct HTML testing without ScrapingBee (faster for development)
    let html;
    try {
      // Try direct fetch first - may work for some sites that don't have strict blocking
      console.log("Trying direct fetch first...");
      const directResponse = await fetch(targetUrl, { 
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        redirect: 'follow'
      });
      
      if (directResponse.ok) {
        html = await directResponse.text();
        console.log(`Successfully fetched HTML directly, size: ${html.length} chars`);
      }
    } catch (directError) {
      console.error("Direct fetch failed, will try ScrapingBee:", directError.message);
    }

    // Fall back to ScrapingBee if direct fetch failed or returned too little content
    if (!html || html.length < 1000 || html.includes('captcha') || html.includes('robot')) {
      console.log("Using ScrapingBee for extraction...");
      
      // Prepare ScrapingBee API URL with appropriate parameters
      const scrapingBeeUrl = new URL('https://app.scrapingbee.com/api/v1');
      scrapingBeeUrl.searchParams.append('api_key', SCRAPING_BEE_API_KEY);
      scrapingBeeUrl.searchParams.append('url', targetUrl);
      scrapingBeeUrl.searchParams.append('render_js', 'false');
      scrapingBeeUrl.searchParams.append('premium_proxy', 'true');
      
      // Add platform-specific parameters
      if (platform === 'amazon') {
        scrapingBeeUrl.searchParams.append('country_code', 'in');
      }

      // Add a random string to avoid caching
      scrapingBeeUrl.searchParams.append('no_cache', new Date().getTime().toString());
      
      console.log('Fetching page with ScrapingBee:', scrapingBeeUrl.toString());
      const response = await fetch(scrapingBeeUrl.toString(), {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`ScrapingBee request failed with status: ${response.status}`);
        console.error(`Error details: ${errorText}`);
        throw new Error(`ScrapingBee request failed: ${response.status} ${response.statusText}`);
      }

      html = await response.text();
      console.log(`ScrapingBee response received, length: ${html.length} chars`);
    }
    
    if (!html || html.length < 1000) {
      console.error("Received empty or very small content", { contentLength: html?.length || 0 });
      throw new Error("Received empty or invalid content");
    }
    
    // Save a small sample of HTML for debugging
    const htmlSample = html.substring(0, 500) + '... (truncated)';
    console.log("HTML sample:", htmlSample);
    
    const $ = cheerio.load(html);
    let productData;
    
    if (url.includes('amazon')) {
      console.log("Extracting Amazon product data");
      productData = extractAmazonProduct($);
    } else if (url.includes('flipkart')) {
      console.log("Extracting Flipkart product data");
      productData = extractFlipkartProduct($);
    } else {
      throw new Error("Unsupported platform");
    }

    if (!productData?.name) {
      throw new Error("Failed to extract product details - could not find product name");
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

function simplifyProductUrl(url: string): string | null {
  try {
    const parsedUrl = new URL(url);
    
    if (parsedUrl.hostname.includes('amazon')) {
      // For Amazon, keep only the domain, path and dp parameter which has the product ID
      const productIdMatch = parsedUrl.pathname.match(/\/dp\/([A-Z0-9]{10})/i);
      if (productIdMatch && productIdMatch[1]) {
        return `https://${parsedUrl.hostname}/dp/${productIdMatch[1]}`;
      }
      
      // If we couldn't extract from path, try from query params
      const asinParam = parsedUrl.searchParams.get('ASIN') || parsedUrl.searchParams.get('asin');
      if (asinParam) {
        return `https://${parsedUrl.hostname}/dp/${asinParam}`;
      }
    } 
    else if (parsedUrl.hostname.includes('flipkart')) {
      // For Flipkart, keep the domain, path and pid parameter
      const pidParam = parsedUrl.searchParams.get('pid');
      if (pidParam && parsedUrl.pathname.includes('/p/')) {
        const mainPath = parsedUrl.pathname.split('?')[0];
        return `https://${parsedUrl.hostname}${mainPath}?pid=${pidParam}`;
      }
    }
    
    return null; // Couldn't simplify, use original URL
  } catch (e) {
    console.error("Error simplifying URL:", e);
    return null; // On error, use original URL
  }
}

function extractAmazonProduct($: cheerio.CheerioAPI) {
  try {
    console.log("Starting Amazon extraction...");
    
    // Product name - try multiple selectors
    let name = '';
    const nameSelectors = [
      '#productTitle', 
      'h1 span.a-size-large', 
      'h1', 
      '.product-title-word-break',
      '.a-size-large.product-title-word-break',
      'span.product-title-word-break'
    ];
    
    for (const selector of nameSelectors) {
      name = $(selector).text().trim();
      if (name) {
        console.log(`Found product name using selector: ${selector}`);
        break;
      }
    }
    
    // Price - handle multiple price formats
    let price = '';
    const priceWhole = $('.a-price-whole').first().text().trim();
    const priceFraction = $('.a-price-fraction').first().text().trim();
    
    if (priceWhole) {
      price = priceWhole + (priceFraction ? '.' + priceFraction : '');
      console.log("Found price using a-price components:", price);
    } else {
      // Try alternative price selectors
      const priceSelectors = [
        '#priceblock_ourprice', 
        '#priceblock_dealprice', 
        '.a-price .a-offscreen', 
        '#price',
        '.a-price-whole',
        '.a-color-price',
        '.a-text-price',
        '.a-section .a-price'
      ];
      
      for (const selector of priceSelectors) {
        const priceElement = $(selector).first();
        if (priceElement.length) {
          price = priceElement.text().trim();
          console.log(`Found price using selector: ${selector}`);
          break;
        }
      }
    }
    
    // Description - try multiple approaches
    let description = '';
    const bulletPoints: string[] = [];
    $('#feature-bullets li').each((_, el) => {
      const text = $(el).text().trim();
      if (text) bulletPoints.push(text);
    });
    
    if (bulletPoints.length > 0) {
      description = bulletPoints.join('\n');
      console.log("Found description from bullet points");
    } else {
      const descriptionSelectors = [
        '#productDescription p',
        '.a-expander-content',
        'meta[name="description"]',
        '#feature-bullets',
        '.a-unordered-list .a-list-item',
        '.product-description'
      ];
      
      for (const selector of descriptionSelectors) {
        if (selector.startsWith('meta')) {
          const metaDesc = $(selector).attr('content');
          if (metaDesc) {
            description = metaDesc;
            console.log(`Found meta description using selector: ${selector}`);
            break;
          }
        } else {
          const desc = $(selector).text().trim();
          if (desc) {
            description = desc;
            console.log(`Found description using selector: ${selector}`);
            break;
          }
        }
      }
      
      if (!description) {
        description = 'No description available';
      }
    }
    
    // Image URL - try multiple selectors
    let image = '';
    const imageSelectors = [
      '#landingImage',
      '.a-dynamic-image',
      'img#main-image',
      'meta[property="og:image"]',
      'img.a-dynamic-image',
      '#imgTagWrapperId img',
      '#imgBlkFront',
      '#main-image-container img'
    ];
    
    for (const selector of imageSelectors) {
      if (selector.startsWith('meta')) {
        image = $(selector).attr('content') || '';
      } else {
        image = $(selector).attr('src') || '';
      }
      
      if (image) {
        console.log(`Found image using selector: ${selector}`);
        break;
      }
    }

    return {
      name,
      price: price.replace(/[^0-9.]/g, ''),  // Clean price to keep only numbers and decimal point
      description,
      image,
      platform: 'amazon'
    };
  } catch (error) {
    console.error("Error in Amazon extraction:", error);
    return {
      name: "Extraction error",
      price: "0",
      description: "Failed to extract product details: " + (error instanceof Error ? error.message : "unknown error"),
      image: "",
      platform: 'amazon'
    };
  }
}

function extractFlipkartProduct($: cheerio.CheerioAPI) {
  try {
    console.log("Starting Flipkart extraction...");
    
    // Product name - try multiple selectors
    let name = '';
    const nameSelectors = [
      '.B_NuCI',
      'h1 span',
      'h1',
      '.G6XhRU',
      '.yhB1nd span',
      'span.B_NuCI'
    ];
    
    for (const selector of nameSelectors) {
      name = $(selector).text().trim();
      if (name) {
        console.log(`Found product name using selector: ${selector}`);
        break;
      }
    }
    
    // Price - try multiple selectors
    let price = '';
    const priceSelectors = [
      '._30jeq3._16Jk6d',
      '._30jeq3',
      'div._16Jk6d',
      '._25b18c',
      '.dyC4hf',
      '.CEmiEU',
      '._30jeq3._1_WHN1'
    ];
    
    for (const selector of priceSelectors) {
      price = $(selector).text().trim();
      if (price) {
        console.log(`Found price using selector: ${selector}`);
        break;
      }
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
      console.log("Found description from bullet points");
    } else {
      const descriptionSelectors = [
        '._1mXcCf',
        '.RmoJUa',
        'div._1AN87F',
        'meta[name="description"]',
        '._1PBCrt',
        '._2o-xpa',
        '#productDescription'
      ];
      
      for (const selector of descriptionSelectors) {
        if (selector.startsWith('meta')) {
          const metaDesc = $(selector).attr('content');
          if (metaDesc) {
            description = metaDesc;
            console.log(`Found description using meta selector: ${selector}`);
            break;
          }
        } else {
          const desc = $(selector).text().trim();
          if (desc) {
            description = desc;
            console.log(`Found description using selector: ${selector}`);
            break;
          }
        }
      }
      
      if (!description) {
        description = 'No description available';
      }
    }
    
    // Image URL - try multiple selectors
    let image = '';
    const imageSelectors = [
      'img._396cs4._2amPTt._3qGmMb',
      '.CXW8mj img',
      '._396cs4',
      'img._396cs4',
      'meta[property="og:image"]',
      'div._3kidJX img',
      '._1BweB8 img',
      '._2r_T1I'
    ];
    
    for (const selector of imageSelectors) {
      if (selector.startsWith('meta')) {
        image = $(selector).attr('content') || '';
      } else {
        image = $(selector).attr('src') || '';
      }
      
      if (image) {
        console.log(`Found image using selector: ${selector}`);
        break;
      }
    }

    return {
      name,
      price,
      description,
      image,
      platform: 'flipkart'
    };
  } catch (error) {
    console.error("Error in Flipkart extraction:", error);
    return {
      name: "Extraction error",
      price: "0",
      description: "Failed to extract product details: " + (error instanceof Error ? error.message : "unknown error"),
      image: "",
      platform: 'flipkart'
    };
  }
}
