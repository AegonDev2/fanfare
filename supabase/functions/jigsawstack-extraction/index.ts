
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

console.log("Jigsawstack product extraction service started");

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 204, 
      headers: corsHeaders 
    });
  }

  try {
    const { url } = await req.json();
    
    if (!url) {
      throw new Error("URL is required");
    }

    console.log(`Starting Jigsawstack extraction for URL: ${url}`);
    
    const apiKey = Deno.env.get("JIGSAWSTACK_API_KEY");
    if (!apiKey) {
      throw new Error("Jigsawstack API key not configured");
    }

    // Make request to Jigsawstack API
    const response = await fetch("https://api.jigsawstack.com/v1/scrape", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        url,
        // Request specific elements based on common e-commerce selectors
        selectors: {
          title: [
            'h1', // Common product title selector
            'meta[property="og:title"]', // OpenGraph title
            'meta[name="title"]' // Meta title
          ],
          price: [
            'meta[property="product:price:amount"]',
            'meta[property="og:price:amount"]',
            '.price',
            '[data-price]'
          ],
          image: [
            'meta[property="og:image"]',
            'meta[property="product:image"]',
            'img[id*="product"]',
            'img[class*="product"]'
          ],
          description: [
            'meta[property="og:description"]',
            'meta[name="description"]',
            '[class*="description"]',
            '[id*="description"]'
          ]
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Jigsawstack API error: ${response.status}`);
      console.error(`Error details: ${errorText}`);
      throw new Error(`Extraction failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Raw scraped data:", data);

    // Transform the data into our application's format
    const extractedProduct = {
      name: data.data?.title?.[0] || "Product Title Not Found",
      price: data.data?.price?.[0]?.replace(/[^0-9.]/g, '') || "0",
      image: data.data?.image?.[0] || "",
      description: data.data?.description?.[0] || "No description available"
    };

    console.log("Transformed product data:", extractedProduct);

    return new Response(
      JSON.stringify({
        success: true,
        productData: extractedProduct,
        source: "jigsawstack",
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200
      }
    );

  } catch (error) {
    console.error('Extraction error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 400
      }
    );
  }
});
