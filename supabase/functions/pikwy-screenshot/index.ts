
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
    
    // Request JSON response with base64 encoded image for better handling
    const apiUrl = `https://api.pikwy.com?u=${encodedUrl}&tkn=${PIKWY_API_TOKEN}&fs=${fullScreenParam}&rt=json`;
    
    console.log(`Making request to Pikwy API: ${apiUrl}`);
    
    const response = await fetch(apiUrl, { method: "GET" });
    
    console.log(`Pikwy API response status: ${response.status}`);
    
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
    
    // Parse the JSON response which contains base64 encoded image
    const responseData = await response.json();
    
    if (!responseData || !responseData.base64) {
      console.error("Failed to get valid response from Pikwy API", responseData);
      return new Response(
        JSON.stringify({ error: 'Failed to get valid screenshot data' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      );
    }
    
    // The base64 data from the API
    const base64Image = responseData.base64;
    
    if (!base64Image || base64Image.length === 0) {
      console.error("Failed to get base64 image data");
      return new Response(
        JSON.stringify({ error: 'Failed to process image data' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      );
    }
    
    console.log(`Successfully generated screenshot, base64 length: ${base64Image.length}`);
    
    // Return the image URL as data URL
    return new Response(
      JSON.stringify({ imageUrl: `data:image/jpeg;base64,${base64Image}` }),
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
