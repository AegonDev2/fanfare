
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function fetchProductDetails(url: string) {
  try {
    console.log('Attempting to fetch URL:', url);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      console.error('Failed to fetch URL:', url, 'Status:', response.status);
      throw new Error(`Failed to fetch URL: ${response.status}`);
    }

    console.log('Successfully fetched URL, getting text content');
    const html = await response.text();
    console.log('HTML content length:', html.length);

    const doc = new DOMParser().parseFromString(html, 'text/html');
    
    if (!doc) {
      console.error('Failed to parse HTML document');
      throw new Error('Failed to parse HTML');
    }

    console.log('Successfully parsed HTML document');

    // Enhanced metadata extraction
    const title = doc.querySelector('title')?.textContent || '';
    console.log('Extracted title:', title);

    const description = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    console.log('Extracted description:', description);
    
    // Try multiple image sources with logging
    const images = [
      doc.querySelector('meta[property="og:image"]')?.getAttribute('content'),
      doc.querySelector('meta[property="product:image"]')?.getAttribute('content'),
      doc.querySelector('meta[property="twitter:image"]')?.getAttribute('content'),
      ...Array.from(doc.querySelectorAll('img[src*="product"]')).map(img => img.getAttribute('src')),
      ...Array.from(doc.querySelectorAll('img.product-image')).map(img => img.getAttribute('src')),
    ].filter(Boolean);
    
    console.log('Found images:', images);
    const image = images[0] || '';

    // Enhanced price extraction with discount handling
    const priceElements = doc.querySelectorAll('[class*="price"], [id*="price"], [class*="cost"], .discount, .sale-price');
    console.log('Found price elements:', priceElements.length);

    let originalPrice = 0;
    let discountedPrice = 0;

    priceElements.forEach((element, index) => {
      const text = element.textContent || '';
      console.log(`Price element ${index} text:`, text);
      
      const priceMatch = text.match(/[\$₹]?\s*(\d+(?:,\d+)*(?:\.\d{2})?)/);
      if (priceMatch) {
        const price = parseFloat(priceMatch[1].replace(/,/g, ''));
        console.log(`Matched price value:`, price);
        
        if (element.className.includes('original') || element.className.includes('mrp')) {
          originalPrice = price;
        } else if (element.className.includes('discount') || element.className.includes('sale')) {
          discountedPrice = price;
        } else if (!originalPrice && !discountedPrice) {
          originalPrice = price;
        }
      }
    });

    console.log('Final price values:', { originalPrice, discountedPrice });

    // Use discounted price if available, otherwise use original price
    const finalPrice = discountedPrice || originalPrice;
    if (!finalPrice) {
      console.error('No valid price found');
      throw new Error('Could not extract price information');
    }

    // Extract specifications
    const specs: string[] = [];
    const specElements = doc.querySelectorAll('[class*="specification"], [class*="specs"], [class*="details"], [class*="features"]');
    specElements.forEach(element => {
      const text = element.textContent?.trim();
      if (text && text.length < 100) {
        specs.push(text);
      }
    });
    console.log('Extracted specifications:', specs);

    // Create a summarized description
    const summaryParts = [description];
    if (specs.length > 0) {
      summaryParts.push("Specifications: " + specs.slice(0, 3).join(", "));
    }
    const summarizedDescription = summaryParts.join("\n").slice(0, 200) + "...";

    const productDetails = {
      name: title.split('|')[0].trim(),
      description: summarizedDescription,
      price: finalPrice,
      priceInr: finalPrice * 83, // Approximate INR conversion
      image: image || "https://storage.googleapis.com/a1aa/image/tSbIqbP_qJMzV8bfuyM7gaSttRX2Pi5K-jl57IlWP44.jpg",
      originalPrice: originalPrice * 83, // Convert to INR
      hasDiscount: discountedPrice > 0,
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
    console.log('Sending response:', productDetails);
    
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
