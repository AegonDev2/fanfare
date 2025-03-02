
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
// Use a newer version of deno_dom that exists
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts"; // Add XHR support

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData = await req.json().catch(() => {
      throw new Error("Invalid JSON in request body");
    });
    
    const { url } = requestData;
    
    if (!url) {
      throw new Error("URL is required");
    }

    console.log("Processing URL:", url);

    // Attempt to fetch the webpage
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    }).catch(error => {
      console.error("Fetch error:", error);
      throw new Error(`Failed to fetch URL: ${error.message || error}`);
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, "text/html");
    
    if (!doc) {
      throw new Error("Failed to parse HTML");
    }

    console.log("Successfully parsed HTML");

    // Extract product information
    let productName = null;
    let productPrice = null;
    let productImage = null;
    let productDescription = null;

    // Check if it's Amazon
    if (url.includes('amazon')) {
      productName = doc.querySelector('#productTitle')?.textContent?.trim();
      productPrice = doc.querySelector('.a-price .a-offscreen')?.textContent?.trim();
      productImage = doc.querySelector('#landingImage')?.getAttribute('src');
      productDescription = doc.querySelector('#productDescription')?.textContent?.trim();

      // Alternative selectors
      if (!productName) productName = doc.querySelector('h1.a-size-large')?.textContent?.trim();
      if (!productPrice) productPrice = doc.querySelector('span.a-price span.a-offscreen')?.textContent?.trim();
      if (!productImage) productImage = doc.querySelector('img#landingImage, img#imgBlkFront')?.getAttribute('src');
      if (!productDescription) productDescription = doc.querySelector('div#feature-bullets')?.textContent?.trim();
    } 
    // Check if it's Flipkart
    else if (url.includes('flipkart')) {
      productName = doc.querySelector('.B_NuCI')?.textContent?.trim();
      productPrice = doc.querySelector('._30jeq3._16Jk6d')?.textContent?.trim();
      productImage = doc.querySelector('._396cs4')?.getAttribute('src');
      productDescription = doc.querySelector('._1mXcCf')?.textContent?.trim();

      // Alternative selectors
      if (!productName) productName = doc.querySelector('h1 span')?.textContent?.trim();
      if (!productPrice) productPrice = doc.querySelector('div._30jeq3')?.textContent?.trim();
      if (!productImage) {
        const imgElement = doc.querySelector('img._396cs4._2amPTt._3qGmMb');
        if (imgElement) {
          productImage = imgElement.getAttribute('src');
        }
      }
      if (!productDescription) productDescription = doc.querySelector('div._1mXcCf.RmoJUa')?.textContent?.trim();
    }
    
    console.log("Extracted data:", { productName, productPrice, productImage, productDescription });

    // Return extracted data
    return new Response(
      JSON.stringify({
        success: true,
        productData: {
          name: productName,
          price: productPrice,
          image: productImage,
          description: productDescription
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error("Error in axiom-ai function:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "An unknown error occurred"
      }),
      {
        status: 200, // Return 200 even for errors to avoid CORS issues
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
