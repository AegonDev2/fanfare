
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function fetchWithRetry(url: string, maxRetries = 5) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt} to fetch URL: ${url}`);
      
      const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1'
      };

      // Always add Flipkart-specific headers
      Object.assign(headers, {
        'Referer': 'https://www.flipkart.com/',
        'Origin': 'https://www.flipkart.com',
        'Host': 'www.flipkart.com'
      });

      // For Flipkart redirect URLs, first get the final URL
      if (url.includes('dl.flipkart.com')) {
        console.log('Following Flipkart redirect URL...');
        try {
          const redirectResponse = await fetch(url, {
            headers,
            redirect: 'follow',
            method: 'HEAD' // Use HEAD request for redirect following
          });
          url = redirectResponse.url;
          console.log('Resolved to final URL:', url);
        } catch (redirectError) {
          console.error('Error following redirect:', redirectError);
          // Continue with the original URL if redirect fails
        }
      }

      // Now fetch the actual product page
      const response = await fetch(url, {
        headers,
        redirect: 'follow'
      });

      console.log(`Response status: ${response.status}`);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const html = await response.text();
      console.log('Successfully fetched HTML content, length:', html.length);

      if (html.length < 100) {
        console.error('Received suspiciously short HTML:', html);
        throw new Error('Invalid HTML content received');
      }

      return html;
    } catch (error) {
      console.error(`Attempt ${attempt} failed with error:`, error);
      lastError = error;

      if (attempt < maxRetries) {
        // Exponential backoff with jitter
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000) + Math.random() * 1000;
        console.log(`Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw new Error(`Failed to fetch after ${maxRetries} attempts: ${lastError?.message}`);
}

async function extractProductDetails(html: string) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  if (!doc) {
    throw new Error('Failed to parse HTML document');
  }

  // Improved selectors for Flipkart products
  const title = doc.querySelector('h1 span')?.textContent?.trim() 
    || doc.querySelector('h1')?.textContent?.trim()
    || doc.querySelector('._31qSD5')?.textContent?.trim()
    || doc.querySelector('._35KyD6')?.textContent?.trim()
    || doc.querySelector('title')?.textContent?.split('-')[0]?.trim()
    || '';
  
  console.log('Extracted title:', title);

  if (!title) {
    throw new Error('Could not extract product title');
  }

  const description = doc.querySelector('._1mXcCf.RmoJUa')?.textContent?.trim()
    || doc.querySelector('._1mXcCf')?.textContent?.trim()
    || doc.querySelector('meta[name="description"]')?.getAttribute('content')
    || '';
  
  console.log('Extracted description:', description);

  const imageSelectors = [
    '._396cs4._2amPTt._3qGmMb',
    '._396cs4 img',
    '._396cs4',
    '._2r_T1I',
    '.CXW8mj img',
    'meta[property="og:image"]'
  ];

  let image = '';
  for (const selector of imageSelectors) {
    const element = doc.querySelector(selector);
    if (element) {
      image = element.getAttribute('src') || element.getAttribute('content') || '';
      if (image) {
        console.log(`Found image using selector: ${selector}`);
        break;
      }
    }
  }

  console.log('Extracted image URL:', image);

  let discountedPrice = 0;
  let originalPrice = 0;

  const discountedPriceElement = doc.querySelector('._30jeq3._16Jk6d')
    || doc.querySelector('._30jeq3')
    || doc.querySelector('.CEmiEU');

  const originalPriceElement = doc.querySelector('._3I9_wc._2p6lqe')
    || doc.querySelector('._3I9_wc')
    || doc.querySelector('._2p6lqe');

  if (discountedPriceElement) {
    const priceText = discountedPriceElement.textContent.replace(/[^0-9.]/g, '');
    discountedPrice = parseFloat(priceText);
    console.log('Extracted discounted price:', discountedPrice);
  }

  if (originalPriceElement) {
    const priceText = originalPriceElement.textContent.replace(/[^0-9.]/g, '');
    originalPrice = parseFloat(priceText);
    console.log('Extracted original price:', originalPrice);
  }

  const finalPrice = discountedPrice || originalPrice;
  if (!finalPrice) {
    throw new Error('Could not extract price information');
  }

  return {
    name: title,
    description: description.slice(0, 200) + (description.length > 200 ? '...' : ''),
    price: finalPrice,
    priceInr: finalPrice,
    image: image || "https://storage.googleapis.com/a1aa/image/tSbIqbP_qJMzV8bfuyM7gaSttRX2Pi5K-jl57IlWP44.jpg",
    originalPrice: originalPrice || finalPrice,
    hasDiscount: discountedPrice > 0 && originalPrice > discountedPrice
  };
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    console.log('Received request for URL:', url);
    
    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    try {
      new URL(url);
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid URL format' }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const html = await fetchWithRetry(url);
    const productDetails = await extractProductDetails(html);
    
    return new Response(
      JSON.stringify(productDetails),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in serve function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch product details',
        details: error.message 
      }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
})
