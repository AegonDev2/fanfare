
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function fetchWithRetry(url: string, maxRetries = 5) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`Attempt ${attempt} to fetch URL: ${url}`);
    
    try {
      // Create a more browser-like request with varying headers
      const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'document',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-site': 'none',
        'sec-fetch-user': '?1',
        'upgrade-insecure-requests': '1'
      };

      // Add specific headers based on the domain
      if (url.includes('amazon')) {
        Object.assign(headers, {
          'Referer': 'https://www.amazon.in/',
          'Origin': 'https://www.amazon.in'
        });
      } else if (url.includes('flipkart')) {
        Object.assign(headers, {
          'Referer': 'https://www.flipkart.com/',
          'Origin': 'https://www.flipkart.com'
        });
      }

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

function extractAmazonProduct(doc: Document) {
  console.log("Extracting Amazon product details");
  
  // Title extraction - Amazon has various selectors
  const titleSelectors = [
    '#productTitle',
    '#title',
    '.product-title-word-break',
    '.a-size-large.product-title-word-break'
  ];
  
  let title = '';
  for (const selector of titleSelectors) {
    const element = doc.querySelector(selector);
    if (element) {
      title = element.textContent.trim();
      if (title) break;
    }
  }
  
  if (!title) {
    title = doc.querySelector('title')?.textContent?.split(':')[0]?.trim() || '';
  }
  
  console.log("Extracted title:", title);
  
  // Description extraction
  const descriptionSelectors = [
    '#productDescription',
    '#feature-bullets',
    '.a-expander-content',
    'meta[name="description"]'
  ];
  
  let description = '';
  for (const selector of descriptionSelectors) {
    const element = doc.querySelector(selector);
    if (element) {
      if (selector === 'meta[name="description"]') {
        description = element.getAttribute('content') || '';
      } else {
        description = element.textContent.trim();
      }
      if (description) break;
    }
  }
  
  console.log("Extracted description:", description);
  
  // Price extraction
  const priceSelectors = [
    '.a-price-whole',
    '.a-price .a-offscreen',
    '#priceblock_ourprice',
    '#priceblock_dealprice',
    '.a-size-medium.a-color-price',
    'span[class*="price"]'
  ];
  
  let price = 0;
  for (const selector of priceSelectors) {
    const element = doc.querySelector(selector);
    if (element) {
      const priceText = element.textContent.replace(/[^0-9,.]/g, '').replace(',', '');
      price = parseFloat(priceText);
      if (!isNaN(price)) break;
    }
  }
  
  console.log("Extracted price:", price);
  
  // Image extraction
  const imageSelectors = [
    '#landingImage',
    '#imgBlkFront',
    '.a-dynamic-image',
    'img[data-old-hires]',
    'img.a-dynamic-image'
  ];
  
  let image = '';
  for (const selector of imageSelectors) {
    const element = doc.querySelector(selector);
    if (element) {
      image = element.getAttribute('src') || element.getAttribute('data-old-hires') || '';
      if (image) break;
    }
  }
  
  if (!image) {
    const metaImage = doc.querySelector('meta[property="og:image"]');
    if (metaImage) {
      image = metaImage.getAttribute('content') || '';
    }
  }
  
  console.log("Extracted image URL:", image);
  
  return {
    name: title,
    description: description.slice(0, 200) + (description.length > 200 ? '...' : ''),
    price: price,
    priceInr: price,
    image: image || "https://storage.googleapis.com/a1aa/image/tSbIqbP_qJMzV8bfuyM7gaSttRX2Pi5K-jl57IlWP44.jpg"
  };
}

function extractFlipkartProduct(doc: Document) {
  console.log("Extracting Flipkart product details");
  
  // Title extraction
  const titleSelectors = [
    'h1 span',
    'h1',
    '._35KyD6',
    '._31qSD5',
    '.B_NuCI'
  ];
  
  let title = '';
  for (const selector of titleSelectors) {
    const element = doc.querySelector(selector);
    if (element) {
      title = element.textContent.trim();
      if (title) break;
    }
  }
  
  if (!title) {
    title = doc.querySelector('title')?.textContent?.split('-')[0]?.trim() || '';
  }
  
  console.log("Extracted title:", title);
  
  // Description extraction
  const descriptionSelectors = [
    '._1mXcCf.RmoJUa',
    '._1mXcCf',
    '._2o-xpa',
    'meta[name="description"]'
  ];
  
  let description = '';
  for (const selector of descriptionSelectors) {
    const element = doc.querySelector(selector);
    if (element) {
      if (selector === 'meta[name="description"]') {
        description = element.getAttribute('content') || '';
      } else {
        description = element.textContent.trim();
      }
      if (description) break;
    }
  }
  
  console.log("Extracted description:", description);
  
  // Price extraction
  const priceSelectors = [
    '._30jeq3._16Jk6d',
    '._30jeq3',
    '.CEmiEU',
    '.dyC4hf'
  ];
  
  let price = 0;
  for (const selector of priceSelectors) {
    const element = doc.querySelector(selector);
    if (element) {
      const priceText = element.textContent.replace(/[^0-9.]/g, '');
      price = parseFloat(priceText);
      if (!isNaN(price)) break;
    }
  }
  
  console.log("Extracted price:", price);
  
  // Image extraction
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
      if (selector === 'meta[property="og:image"]') {
        image = element.getAttribute('content') || '';
      } else {
        image = element.getAttribute('src') || '';
      }
      if (image) break;
    }
  }
  
  console.log("Extracted image URL:", image);
  
  return {
    name: title,
    description: description.slice(0, 200) + (description.length > 200 ? '...' : ''),
    price: price,
    priceInr: price,
    image: image || "https://storage.googleapis.com/a1aa/image/tSbIqbP_qJMzV8bfuyM7gaSttRX2Pi5K-jl57IlWP44.jpg"
  };
}

async function extractProductDetails(html: string, url: string) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  if (!doc) {
    throw new Error('Failed to parse HTML document');
  }

  console.log("HTML parsed successfully, extracting product details");
  
  let productDetails;
  if (url.includes('amazon')) {
    productDetails = extractAmazonProduct(doc);
  } else if (url.includes('flipkart')) {
    productDetails = extractFlipkartProduct(doc);
  } else {
    // Generic extraction as fallback
    const title = doc.querySelector('h1')?.textContent?.trim() 
      || doc.querySelector('title')?.textContent?.split('|')[0]?.trim()
      || '';
    
    const description = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    
    const image = doc.querySelector('meta[property="og:image"]')?.getAttribute('content') || '';
    
    productDetails = {
      name: title,
      description: description.slice(0, 200) + (description.length > 200 ? '...' : ''),
      price: 0,
      priceInr: 0,
      image: image || "https://storage.googleapis.com/a1aa/image/tSbIqbP_qJMzV8bfuyM7gaSttRX2Pi5K-jl57IlWP44.jpg"
    };
  }
  
  if (!productDetails.name || productDetails.name.length < 3) {
    throw new Error('Failed to extract product name');
  }

  return productDetails;
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

    console.log("Starting to fetch product page");
    const html = await fetchWithRetry(url);
    console.log("HTML fetched successfully, proceeding to extract details");
    
    const productDetails = await extractProductDetails(html, url);
    console.log("Product details extracted successfully:", productDetails);
    
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
