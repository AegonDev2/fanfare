
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function fetchWithRetry(url: string, maxRetries = 3) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt} to fetch URL: ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Connection': 'keep-alive',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Upgrade-Insecure-Requests': '1'
        },
        redirect: 'follow'
      });

      if (response.ok) {
        return response;
      }

      console.error(`Attempt ${attempt} failed with status: ${response.status}`);
      lastError = new Error(`Failed to fetch URL: ${response.status}`);
      
      // Only retry on specific status codes
      if (response.status !== 429 && response.status !== 503 && response.status !== 529) {
        throw lastError;
      }
    } catch (error) {
      console.error(`Attempt ${attempt} error:`, error);
      lastError = error;
    }

    // Wait before retrying (exponential backoff)
    if (attempt < maxRetries) {
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

async function fetchProductDetails(url: string) {
  try {
    console.log('Starting to fetch product details for URL:', url);
    
    // Handle redirect URLs (like Flipkart's dl.flipkart.com links)
    if (url.includes('dl.flipkart.com')) {
      console.log('Detected Flipkart short URL, following redirect...');
    }

    const response = await fetchWithRetry(url);
    const html = await response.text();
    console.log('Successfully fetched HTML content, length:', html.length);
    
    if (html.length < 100) {
      console.error('Received suspiciously short HTML content:', html);
      throw new Error('Invalid HTML content received');
    }

    const doc = new DOMParser().parseFromString(html, 'text/html');
    if (!doc) {
      throw new Error('Failed to parse HTML document');
    }

    // Extract title with fallbacks
    const title = doc.querySelector('title')?.textContent 
      || doc.querySelector('meta[property="og:title"]')?.getAttribute('content')
      || doc.querySelector('h1')?.textContent
      || '';
    console.log('Extracted title:', title);

    if (!title) {
      throw new Error('Could not extract product title');
    }

    // Extract description with multiple fallbacks
    const description = doc.querySelector('meta[name="description"]')?.getAttribute('content') 
      || doc.querySelector('meta[property="og:description"]')?.getAttribute('content')
      || doc.querySelector('.product-description')?.textContent
      || doc.querySelector('._1mXcCf')?.textContent // Flipkart specific
      || '';
    console.log('Extracted description:', description);

    // Enhanced image extraction
    const possibleImageSelectors = [
      'meta[property="og:image"]',
      'meta[property="product:image"]',
      'meta[property="twitter:image"]',
      '._396cs4', // Flipkart specific
      '.product-image-container img'
    ];

    let image = '';
    for (const selector of possibleImageSelectors) {
      const element = doc.querySelector(selector);
      if (element) {
        image = element.getAttribute('content') || element.getAttribute('src') || '';
        if (image) break;
      }
    }
    console.log('Extracted image URL:', image);

    // Price extraction with specific Flipkart selectors
    let originalPrice = 0;
    let discountedPrice = 0;

    // Flipkart specific price selectors
    const discountedPriceElement = doc.querySelector('._30jeq3');
    const originalPriceElement = doc.querySelector('._3I9_wc');

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

    // If no specific price elements found, try generic selectors
    if (!discountedPrice && !originalPrice) {
      const priceElements = doc.querySelectorAll('[class*="price"], [class*="cost"]');
      priceElements.forEach(element => {
        const priceText = element.textContent.replace(/[^0-9.]/g, '');
        const price = parseFloat(priceText);
        if (price > 0) {
          if (!originalPrice) originalPrice = price;
          else if (price < originalPrice) discountedPrice = price;
        }
      });
    }

    const finalPrice = discountedPrice || originalPrice;
    if (!finalPrice) {
      throw new Error('Could not extract price information');
    }

    const productDetails = {
      name: title.split('|')[0].trim(),
      description: description.slice(0, 200) + (description.length > 200 ? '...' : ''),
      price: finalPrice,
      priceInr: finalPrice,
      image: image || "https://storage.googleapis.com/a1aa/image/tSbIqbP_qJMzV8bfuyM7gaSttRX2Pi5K-jl57IlWP44.jpg",
      originalPrice: originalPrice || finalPrice,
      hasDiscount: discountedPrice > 0
    };

    console.log('Successfully extracted product details:', productDetails);
    return productDetails;

  } catch (error) {
    console.error('Error in fetchProductDetails:', error);
    throw error;
  }
}

serve(async (req) => {
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

    const productDetails = await fetchProductDetails(url);
    
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
