
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// CORS headers for cross-origin requests
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
    // Get the URL and other parameters from the request
    const { url, fullScreen } = await req.json();
    
    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Use the provided API token for Pikwy
    const PIKWY_API_TOKEN = "c39990741cf427d7baa5750d20bfaefc66c45915a84af5d8";
    
    // Encode the URL
    const encodedUrl = encodeURIComponent(url);
    const fullScreenParam = fullScreen ? "1" : "0";
    
    console.log(`Generating screenshot for URL: ${url}`);
    console.log(`Using encoded URL: ${encodedUrl}`);
    
    // Make the request to Pikwy API
    const response = await fetch(
      `https://api.pikwy.com?u=${encodedUrl}&tkn=${PIKWY_API_TOKEN}&fs=${fullScreenParam}`, 
      { method: "GET" }
    );
    
    // Check if the request was successful
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Pikwy API error: ${response.status} - ${errorText}`);
      return new Response(
        JSON.stringify({ 
          error: `Failed to generate preview: ${response.status}`,
          details: errorText
        }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Get the image URL from the response
    const imageUrl = await response.text();
    console.log(`Successfully generated screenshot: ${imageUrl}`);
    
    // Return the image URL
    return new Response(
      JSON.stringify({ imageUrl }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error("Error in pikwy-screenshot function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
