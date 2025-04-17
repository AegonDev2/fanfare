
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

console.log("Buildship product extraction service started");

serve(async (req) => {
  // Handle CORS preflight requests
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

    console.log(`Processing extraction request for URL: ${url}, platform: ${platform || 'unknown'}, retry: ${retryCount || 0}`);

    // Call Buildship endpoint
    const buildshipUrl = 'https://jspn8s.buildship.run/untitledFlow-c234cebe00fd';
    console.log(`Calling Buildship endpoint: ${buildshipUrl}`);
    
    const fetchOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      body: JSON.stringify({ 
        url,
        timestamp: new Date().getTime(), // Prevent caching issues
        retryCount: retryCount || 0
      })
    };

    console.log("Fetch options:", JSON.stringify(fetchOptions));
    
    let response;
    try {
      console.log("Starting fetch request to Buildship...");
      response = await fetch(buildshipUrl, fetchOptions);
      console.log(`Buildship response status: ${response.status}`);
    } catch (fetchError) {
      console.error("Fetch error:", fetchError);
      throw new Error(`Network error when calling Buildship: ${fetchError.message}`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Buildship request failed with status: ${response.status}`);
      console.error(`Error details: ${errorText}`);
      throw new Error(`Product extraction failed: ${response.status} ${response.statusText}`);
    }

    let extractedData;
    try {
      extractedData = await response.json();
      console.log("Successfully extracted product data:", JSON.stringify(extractedData));
    } catch (parseError) {
      console.error("Error parsing JSON response:", parseError);
      throw new Error(`Failed to parse Buildship response: ${parseError.message}`);
    }

    // Transform the data into our expected format
    const productData = {
      name: extractedData.title || "Product Name Not Found",
      price: extractedData.price || "0",
      description: extractedData.description || "No description available",
      image: extractedData.image || "",
      platform: platform || 'unknown'
    };

    return new Response(
      JSON.stringify({ 
        success: true, 
        productData,
        source: "buildship",
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
