
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
    
    // Make the request to Pikwy API with rt=json to get JSON response with base64 encoded image
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
    
    // Parse the JSON response
    const jsonResponse = await response.json();
    
    // Extract the base64 image data
    const base64Image = jsonResponse.image;
    
    if (!base64Image) {
      console.error("No image data returned from Pikwy API:", jsonResponse);
      return new Response(
        JSON.stringify({ error: 'No image data returned from Pikwy API', details: jsonResponse }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      );
    }
    
    // Return the image URL (which is now a base64 data URL)
    console.log("Successfully generated screenshot, base64 data length:", base64Image.length);
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
