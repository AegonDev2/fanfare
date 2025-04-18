
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    
    if (!url) {
      throw new Error("URL is required");
    }

    console.log(`Extracting data from ${platform || 'unknown'} URL: ${url}, retry attempt: ${retryCount || 0}`);

    // Handle Amazon shortened URLs (amzn.in format)
    let processedUrl = url;
    if (url.includes('amzn.in') && platform === 'amazon') {
      console.log("Detected shortened Amazon URL, will follow redirects");
    }

    // Call Buildship endpoint
    const buildshipUrl = 'https://jspn8s.buildship.run/untitledFlow-c234cebe00fd';
    console.log(`Calling Buildship endpoint: ${buildshipUrl}`);
    
    const response = await fetch(buildshipUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      body: JSON.stringify({ 
        url: processedUrl,
        timestamp: new Date().getTime() // Prevent caching issues
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Buildship request failed with status: ${response.status}`);
      console.error(`Error details: ${errorText}`);
      throw new Error(`Product extraction failed: ${response.status} ${response.statusText || ''}`);
    }

    const extractedData = await response.json();
    console.log("Successfully extracted product data:", extractedData);

    // Transform the data into our expected format
    const productData = {
      name: extractedData.title || "Product Name Not Found",
      price: extractedData.price || "0",
      description: extractedData.description || "No description available",
      image: extractedData.image || "",
      platform: platform || 'unknown'
    };

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
