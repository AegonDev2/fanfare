
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

console.log("Jigsawstack product extraction service started");

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 204, 
      headers: corsHeaders 
    });
  }

  try {
    console.log("Received product extraction request");
    const requestData = await req.json();
    const { url, platform, retryCount } = requestData;
    
    if (!url) {
      throw new Error("URL is required");
    }

    console.log(`Processing extraction request for URL: ${url}, platform: ${platform || 'unknown'}`);
    
    // Get API key from environment
    const apiKey = Deno.env.get("JIGSAWSTACK_API_KEY");
    if (!apiKey) {
      throw new Error("Jigsawstack API key not configured");
    }

    // Prepare the scraping request
    const jigsawstackUrl = "https://api.jigsawstack.com/v1/scrape";
    const response = await fetch(jigsawstackUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        url: url,
        // Specific selectors for different platforms
        selectors: platform === 'amazon' ? {
          title: '#productTitle',
          price: '.a-price .a-offscreen',
          image: '#landingImage',
          description: '#feature-bullets .a-list-item'
        } : {
          // Flipkart selectors
          title: '.B_NuCI',
          price: '._30jeq3',
          image: '._396cs4',
          description: '._1mXcCf'
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Jigsawstack request failed with status: ${response.status}`);
      console.error(`Error details: ${errorText}`);
      throw new Error(`Product extraction failed: ${response.status} ${response.statusText || ''}`);
    }

    const scrapedData = await response.json();
    console.log("Successfully extracted product data:", scrapedData);

    // Transform to our standard format
    const productData = {
      name: scrapedData.data?.title || "Product Title Not Found",
      price: scrapedData.data?.price?.replace(/[^0-9.]/g, '') || "0",
      platform: platform || 'unknown',
      image: scrapedData.data?.image || "",
      description: scrapedData.data?.description || "No description available"
    };

    return new Response(
      JSON.stringify({ 
        success: true, 
        productData,
        source: "jigsawstack",
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error in product extraction:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error occurred",
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
