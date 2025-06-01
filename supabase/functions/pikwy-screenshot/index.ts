
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
    
    // Set a longer timeout for the fetch operation (10 seconds)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    try {
      // Try fetching as binary first (more reliable)
      const apiUrl = `https://api.pikwy.com?u=${encodedUrl}&tkn=${PIKWY_API_TOKEN}&fs=${fullScreenParam}`;
      
      console.log(`Making request to Pikwy API for binary image: ${apiUrl}`);
      
      const response = await fetch(apiUrl, { 
        method: "GET",
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      console.log(`Pikwy API binary response status: ${response.status}`);
      
      // Check if the request was successful
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Pikwy API error: ${response.status} - ${errorText}`);
        throw new Error(`Failed to generate preview: ${response.status}`);
      }
      
      // Get the raw image data as ArrayBuffer
      const imageBuffer = await response.arrayBuffer();
      
      if (!imageBuffer || imageBuffer.byteLength === 0) {
        console.error("Failed to get image data");
        throw new Error('Failed to get valid image data');
      }
      
      console.log(`Successfully generated screenshot, binary length: ${imageBuffer.byteLength} bytes`);
      
      // Convert ArrayBuffer to base64
      const base64Image = btoa(
        new Uint8Array(imageBuffer)
          .reduce((data, byte) => data + String.fromCharCode(byte), '')
      );
      
      // Return the image URL as data URL
      return new Response(
        JSON.stringify({ imageUrl: `data:image/jpeg;base64,${base64Image}` }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
      
    } catch (fetchError) {
      // If binary fetch fails, fall back to JSON response with base64
      console.error("Error with binary fetch:", fetchError);
      clearTimeout(timeoutId);
      
      // Set a new timeout for the JSON fetch
      const jsonController = new AbortController();
      const jsonTimeoutId = setTimeout(() => jsonController.abort(), 30000); // 30 second timeout
      
      try {
        const jsonApiUrl = `https://api.pikwy.com?u=${encodedUrl}&tkn=${PIKWY_API_TOKEN}&fs=${fullScreenParam}&rt=json`;
        
        console.log(`Falling back to JSON API: ${jsonApiUrl}`);
        
        const jsonResponse = await fetch(jsonApiUrl, { 
          method: "GET",
          signal: jsonController.signal
        });
        
        clearTimeout(jsonTimeoutId);
        
        console.log(`Pikwy JSON API response status: ${jsonResponse.status}`);
        
        if (!jsonResponse.ok) {
          const errorText = await jsonResponse.text();
          console.error(`Pikwy JSON API error: ${jsonResponse.status} - ${errorText}`);
          throw new Error(`Failed to generate preview: ${jsonResponse.status}`);
        }
        
        // Parse the JSON response which contains base64 encoded image
        const responseData = await jsonResponse.json();
        
        if (!responseData || !responseData.base64) {
          console.error("No image data returned from Pikwy API:", responseData);
          throw new Error('No image data returned from Pikwy API');
        }
        
        // The base64 data from the API
        const base64Image = responseData.base64;
        
        console.log(`JSON method returned base64 data of length: ${base64Image.length}`);
        
        // Return the image URL as data URL
        return new Response(
          JSON.stringify({ imageUrl: `data:image/jpeg;base64,${base64Image}` }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      } catch (jsonError) {
        clearTimeout(jsonTimeoutId);
        console.error("Error with JSON fetch:", jsonError);
        throw jsonError;
      }
    }
  } catch (error) {
    console.error("Error in pikwy-screenshot function:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: String(error)
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
