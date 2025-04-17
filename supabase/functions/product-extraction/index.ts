
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
    console.log("Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Processing extraction request");
    const { url, platform, retryCount = 0 } = await req.json();
    
    if (!url) {
      return new Response(
        JSON.stringify({ success: false, error: "URL is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    console.log(`Extracting data from ${platform || 'unknown'} URL: ${url} (Retry count: ${retryCount})`);
    
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

    // Use proxy service for better extraction reliability
    const html = await fetchProductPageWithProxy(url, detectedPlatform, retryCount);
    
    if (!html || html.length < 1000) {
      throw new Error("Failed to fetch complete product page or received empty content");
    }
    
    console.log(`Successfully loaded HTML of length: ${html.length} characters`);
    
    const $ = cheerio.load(html);
    console.log("HTML loaded into cheerio");
    
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

async function fetchProductPageWithProxy(url: string, platform: string, retryCount = 0) {
  console.log(`Using enhanced fetch method for ${platform} (retry: ${retryCount})`);
  
  // Rotate between multiple strategies based on retry count
  const strategy = retryCount % 3;
  
  // We'll try different approaches based on retry count
  if (strategy === 0) {
    return await fetchWithDirectRequest(url);
  } else if (strategy === 1) {
    return await fetchWithSimulatedBrowser(url);
  } else {
    return await fetchWithRotatingProxies(url);
  }
}

async function fetchWithDirectRequest(url: string) {
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Safari/605.1.15',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:90.0) Gecko/20100101 Firefox/90.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:90.0) Gecko/20100101 Firefox/90.0'
  ];
  
  const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
  
  console.log("Using direct request with user agent:", randomUserAgent);
  
  const response = await fetch(url, {
    headers: {
      'User-Agent': randomUserAgent,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Upgrade-Insecure-Requests': '1',
      'DNT': '1'
    },
    redirect: 'follow'
  });

  if (!response.ok) {
    console.error(`Direct request failed: ${response.status} ${response.statusText}`);
    throw new Error(`Failed to fetch product page: ${response.status} ${response.statusText}`);
  }

  return await response.text();
}

async function fetchWithSimulatedBrowser(url: string) {
  console.log("Using simulated browser technique");
  
  // Add browser-like cookies and headers
  const cookieJar = 'session-id=123; session-token=abc; ubid-main=135-7951369-8723425;';
  
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Referer': 'https://www.google.com/',
      'Cookie': cookieJar,
      'Sec-Ch-Ua': '" Not A;Brand";v="99", "Chromium";v="96", "Google Chrome";v="96"',
      'Sec-Ch-Ua-Mobile': '?0',
      'Sec-Ch-Ua-Platform': '"Windows"',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'cross-site',
      'Sec-Fetch-User': '?1',
      'Upgrade-Insecure-Requests': '1',
      'Cache-Control': 'max-age=0'
    },
    redirect: 'follow'
  });

  if (!response.ok) {
    console.error(`Simulated browser request failed: ${response.status} ${response.statusText}`);
    throw new Error(`Failed to fetch product page: ${response.status} ${response.statusText}`);
  }

  return await response.text();
}

async function fetchWithRotatingProxies(url: string) {
  console.log("Using public API fallback technique");
  
  // We'll use a public API as a fallback to get product data
  // This is a free/public API for demonstration - in production you'd use a paid service
  try {
    // A basic implementation using an imaginary public HTML retrieval service
    // Note: This is conceptual; in production you'd use a proper service
    const encodedUrl = encodeURIComponent(url);
    const apiUrl = `https://api.allorigins.win/raw?url=${encodedUrl}`;
    
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`API proxy returned ${response.status}`);
    }
    
    return await response.text();
  } catch (err) {
    console.error("Public API proxy failed:", err);
    
    // Last resort: direct fetch with minimal headers
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
      }
    });
    
    return await response.text();
  }
}

function detectPlatformFromUrl(url: string): 'amazon' | 'flipkart' | undefined {
  if (url.includes('amazon')) return 'amazon';
  if (url.includes('flipkart')) return 'flipkart';
  return undefined;
}

function extractAmazonProduct($: cheerio.CheerioAPI, html: string) {
  try {
    console.log("Extracting Amazon product data");
    
    // Product name using multiple selectors with fallbacks
    let name = $('#productTitle').text().trim();
    
    if (!name) {
      name = $('#title').text().trim();
    }
    
    if (!name) {
      const metaTitle = $('meta[name="title"]').attr('content');
      if (metaTitle) {
        name = metaTitle.replace(/Amazon\.in:.*?:/, '').trim();
      }
    }
    
    if (!name) {
      name = $('title').text().replace(/: Amazon\.in:.*$/, '').trim();
    }
    
    if (!name) {
      // Try to find name in JSON-LD
      const jsonLdScripts = $('script[type="application/ld+json"]');
      jsonLdScripts.each((i, el) => {
        try {
          const scriptContent = $(el).html();
          if (scriptContent) {
            const jsonData = JSON.parse(scriptContent);
            if (jsonData.name) {
              name = jsonData.name;
              return false; // break the loop
            }
          }
        } catch (e) {
          // Ignore JSON parsing errors and continue
        }
      });
    }
    
    console.log("Product name extracted:", name || "Not found");
    
    // Price using specific selector as requested
    let price = $('span.a-price-whole').first().text().trim();
    
    if (!price) {
      // Fallbacks for price
      price = $('#priceblock_ourprice').text().trim();
      if (!price) price = $('#priceblock_dealprice').text().trim();
      if (!price) price = $('.a-price .a-offscreen').first().text().trim();
      
      // Try to extract price from JSON-LD
      if (!price) {
        const jsonLdScripts = $('script[type="application/ld+json"]');
        jsonLdScripts.each((i, el) => {
          try {
            const scriptContent = $(el).html();
            if (scriptContent) {
              const jsonData = JSON.parse(scriptContent);
              if (jsonData.offers && jsonData.offers.price) {
                price = jsonData.offers.price.toString();
                return false; // break the loop
              }
            }
          } catch (e) {
            // Ignore JSON parsing errors and continue
          }
        });
      }
    }
    
    // Clean price
    price = price.replace(/[^\d.,]/g, '').trim();
    console.log("Price extracted:", price || "Not found");
    
    // Image extraction with enhanced fallbacks
    let image = $('#landingImage').attr('src');
    if (!image) image = $('#imgBlkFront').attr('src');
    if (!image) image = $('.a-dynamic-image').attr('src');
    
    if (!image) {
      // Look for image URLs in the scripts
      const scripts = $('script').map((i, el) => $(el).html()).get();
      for (const script of scripts) {
        if (script && script.includes('imageGalleryData')) {
          const match = script.match(/"large":"(https:\/\/[^"]+)"/);
          if (match && match[1]) {
            image = match[1];
            break;
          }
        }
      }
      
      // Try data-old-hires which often contains the image URL
      if (!image) {
        image = $('img[data-old-hires]').attr('data-old-hires');
      }
      
      // Check meta property og:image
      if (!image) {
        image = $('meta[property="og:image"]').attr('content');
      }
    }
    
    console.log("Image URL extracted:", image || "Not found");
    
    // Using product title for description as requested
    let description = $('#productTitle').text().trim();
    
    if (!description) {
      // Try to get a better description even though title was requested
      const bullets = [];
      $('#feature-bullets li span').each((i, el) => {
        bullets.push($(el).text().trim());
      });
      
      if (bullets.length > 0) {
        description = bullets.join('\n');
      }
    }
    
    console.log("Description extracted:", description ? "Yes" : "No");

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
    console.log("Extracting Flipkart product data with enhanced selectors");
    
    // Enhanced name extraction
    let name = $('.B_NuCI').text().trim();
    if (!name) name = $('h1 span').text().trim();
    if (!name) name = $('meta[name="description"]').attr('content')?.split('|')[0]?.trim();
    if (!name) name = $('title').text().split('|')[0].trim();
    console.log("Product name extracted:", name || "Not found");
    
    // Enhanced price extraction
    let price = $('._30jeq3._16Jk6d').text().trim().replace('₹', '');
    if (!price) price = $('._30jeq3').text().trim().replace('₹', '');
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
    
    // Extract price from microdata if available
    if (!price) {
      try {
        $('script[type="application/ld+json"]').each((i, el) => {
          const scriptContent = $(el).html();
          if (scriptContent) {
            const jsonData = JSON.parse(scriptContent);
            if (jsonData.offers && jsonData.offers.price) {
              price = jsonData.offers.price.toString();
              return false; // break the loop
            }
          }
        });
      } catch (e) {
        // Ignore JSON parsing errors
      }
    }
    
    console.log("Price extracted:", price || "Not found");
    
    // Enhanced image extraction
    let image = $('img._396cs4._2amPTt._3qGmMb').attr('src');
    if (!image) image = $('._396cs4').attr('src');
    if (!image) image = $('img._2r_T1I').attr('src');
    if (!image) image = $('meta[property="og:image"]').attr('content');
    console.log("Image URL extracted:", image || "Not found");
    
    // Enhanced description extraction
    const specs = [];
    $('._2418kt li, ._1AN87F').each((i, el) => {
      specs.push($(el).text().trim());
    });
    
    let description = specs.join('\n');
    if (!description) {
      description = $('._1mXcCf').text().trim();
    }
    
    if (!description) {
      // Look for any div with description or about in the class
      $('[class*="description"], [class*="about"], [class*="product-description"]').each((i, el) => {
        const text = $(el).text().trim();
        if (text && text.length > 20) {
          description = text;
          return false;
        }
      });
    }
    
    // Try to extract it from meta tags if still not found
    if (!description) {
      description = $('meta[name="description"]').attr('content') || '';
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
