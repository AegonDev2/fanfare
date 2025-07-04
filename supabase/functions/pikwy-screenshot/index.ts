
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
      // Try JSON API first as it's more reliable for error handling
      const jsonApiUrl = `https://api.pikwy.com?u=${encodedUrl}&tkn=${PIKWY_API_TOKEN}&fs=${fullScreenParam}&rt=json`;
      
      console.log(`Making request to Pikwy JSON API: ${jsonApiUrl}`);
      
      const response = await fetch(jsonApiUrl, { 
        method: "GET",
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      clearTimeout(timeoutId);
      
      console.log(`Pikwy API response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Pikwy API HTTP error: ${response.status} - ${errorText}`);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      // Parse the JSON response
      const responseData = await response.json();
      console.log(`Pikwy API response data:`, responseData);
      
      // Check if the response contains an error
      if (responseData.code && responseData.code !== 200) {
        console.error(`Pikwy API returned error code: ${responseData.code}, message: ${responseData.mesg || responseData.message}`);
        
        // Handle different error codes
        if (responseData.code === 9090) {
          throw new Error('Access denied - API token may be invalid or expired');
        } else if (responseData.code === 9091) {
          throw new Error('URL is not accessible or invalid');
        } else {
          throw new Error(`Pikwy API error: ${responseData.mesg || responseData.message || 'Unknown error'}`);
        }
      }
      
      // Check if we have valid base64 image data
      if (!responseData.base64 || typeof responseData.base64 !== 'string') {
        console.error("No valid base64 image data in response:", responseData);
        throw new Error('No valid image data returned from Pikwy API');
      }
      
      const base64Image = responseData.base64;
      console.log(`Successfully received base64 image data, length: ${base64Image.length} characters`);
      
      // Validate that the base64 data is actually an image (should be much longer than error messages)
      if (base64Image.length < 100) {
        console.error(`Base64 data too short (${base64Image.length} chars), likely an error response`);
        throw new Error('Received invalid image data - data too short');
      }
      
      // Return the image URL as data URL
      return new Response(
        JSON.stringify({ imageUrl: `data:image/jpeg;base64,${base64Image}` }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
      
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error("Error with Pikwy API request:", fetchError);
      
      // If it's an abort error, handle it specifically
      if (fetchError.name === 'AbortError') {
        throw new Error('Screenshot generation timed out - URL may be too slow to load');
      }
      
      throw fetchError;
    }
  } catch (error) {
    console.error("Error in pikwy-screenshot function:", error);
    
    // Return a more detailed error response
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorDetails = String(error);
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: errorDetails,
        success: false
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
