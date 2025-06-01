
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
    
    // Set a longer timeout for the fetch operation (30 seconds)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    try {
      // Try fetching as JSON first for better quality
      const jsonApiUrl = `https://api.pikwy.com?u=${encodedUrl}&tkn=${PIKWY_API_TOKEN}&fs=${fullScreenParam}&rt=json`;
      
      console.log(`Making request to Pikwy JSON API: ${jsonApiUrl}`);
      
      const jsonResponse = await fetch(jsonApiUrl, { 
        method: "GET",
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      console.log(`Pikwy JSON API response status: ${jsonResponse.status}`);
      
      if (jsonResponse.ok) {
        // Parse the JSON response which contains base64 encoded image
        const responseData = await jsonResponse.json();
        
        if (responseData && responseData.base64) {
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
        }
      }
      
      // If JSON method fails, fall back to binary fetch
      console.log("JSON method failed, falling back to binary fetch");
      
      const binaryController = new AbortController();
      const binaryTimeoutId = setTimeout(() => binaryController.abort(), 30000);
      
      try {
        const apiUrl = `https://api.pikwy.com?u=${encodedUrl}&tkn=${PIKWY_API_TOKEN}&fs=${fullScreenParam}`;
        
        console.log(`Making request to Pikwy API for binary image: ${apiUrl}`);
        
        const response = await fetch(apiUrl, { 
          method: "GET",
          signal: binaryController.signal
        });
        
        clearTimeout(binaryTimeoutId);
        
        console.log(`Pikwy API binary response status: ${response.status}`);
        
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
        
        // Convert ArrayBuffer to base64 with proper handling
        const uint8Array = new Uint8Array(imageBuffer);
        let binary = '';
        const chunkSize = 8192;
        
        for (let i = 0; i < uint8Array.length; i += chunkSize) {
          const chunk = uint8Array.slice(i, i + chunkSize);
          binary += String.fromCharCode.apply(null, Array.from(chunk));
        }
        
        const base64Image = btoa(binary);
        
        console.log(`Converted to base64, length: ${base64Image.length}`);
        
        // Return the image URL as data URL
        return new Response(
          JSON.stringify({ imageUrl: `data:image/jpeg;base64,${base64Image}` }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
        
      } catch (binaryError) {
        clearTimeout(binaryTimeoutId);
        console.error("Error with binary fetch:", binaryError);
        throw binaryError;
      }
      
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error("Error with fetch operations:", fetchError);
      throw fetchError;
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
