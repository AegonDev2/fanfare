
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

console.log("Buildship product extraction service started");

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

    console.log(`Processing extraction request for URL: ${url}`);
    
    const buildshipUrl = 'https://jspn8s.buildship.run/untitledFlow-c234cebe00fd';
    
    const response = await fetch(buildshipUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      body: JSON.stringify({ 
        url,
        timestamp: new Date().getTime(),
        retryCount: retryCount || 0
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Buildship request failed with status: ${response.status}`);
      throw new Error(`Product extraction failed: ${response.status}`);
    }

    const extractedData = await response.json();
    console.log("Successfully extracted product data:", extractedData);

    // Transform to simplified format
    const productData = {
      name: extractedData.title || "Product Title Not Found",
      price: extractedData.price || "0",
      platform: platform || 'unknown'
    };

    // Store in Supabase table
    const { data: insertedData, error: insertError } = await supabase
      .from('product_preview_data')
      .insert([{
        url: url,
        title: productData.name,
        price: parseFloat(productData.price) || 0,
        platform: productData.platform
      }])
      .select()
      .single();

    if (insertError) {
      console.error("Error storing product data:", insertError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        productData,
        source: "buildship",
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
