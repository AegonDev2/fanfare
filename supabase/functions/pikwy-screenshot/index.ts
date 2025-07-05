
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
    
    // Set a longer timeout for the fetch operation (90 seconds)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log('Request timeout reached, aborting...');
      controller.abort();
    }, 90000); // 90 seconds timeout
    
    try {
      // Use JSON API format as specified in the documentation
      const jsonApiUrl = `https://api.pikwy.com?u=${encodedUrl}&tkn=${PIKWY_API_TOKEN}&fs=${fullScreenParam}&rt=json&f=jpg&w=1280&h=1024`;
      
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
      
      // Check if the response contains an error code (according to Pikwy docs)
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
      
      // For JSON response type, Pikwy returns base64 image data along with metadata
      // The response structure is: { date: "timestamp", body: "base64_image_data" }
      let base64Image = null;
      
      // Check different possible response formats from Pikwy
      if (responseData.body && typeof responseData.body === 'string') {
        // Format: { date: "...", body: "base64_data" }
        base64Image = responseData.body;
        console.log(`Found base64 image in 'body' field, length: ${base64Image.length} characters`);
      } else if (responseData.base64 && typeof responseData.base64 === 'string') {
        // Format: { date: "...", base64: "base64_data" }
        base64Image = responseData.base64;
        console.log(`Found base64 image in 'base64' field, length: ${base64Image.length} characters`);
      } else if (typeof responseData === 'string' && responseData.length > 1000) {
        // Sometimes the entire response is just the base64 string
        base64Image = responseData;
        console.log(`Response is direct base64 string, length: ${base64Image.length} characters`);
      }
      
      if (!base64Image) {
        console.error("No valid base64 image data found in response:", Object.keys(responseData));
        throw new Error('No valid image data returned from Pikwy API');
      }
      
      // Validate that the base64 data is actually a valid image
      // Valid JPEG base64 should start with /9j/ and be substantial in length
      if (base64Image.length < 1000) {
        console.error(`Base64 data too short (${base64Image.length} chars), likely an error response`);
        throw new Error('Received invalid image data - data too short');
      }
      
      // Check if it starts with valid image header in base64
      if (!base64Image.startsWith('/9j/') && !base64Image.startsWith('iVBOR') && !base64Image.startsWith('UklGR')) {
        console.error('Base64 data does not start with valid image header, first 20 chars:', base64Image.substring(0, 20));
        throw new Error('Invalid image format received');
      }
      
      // Try to validate the base64 format
      try {
        // This will throw if the base64 is invalid
        atob(base64Image.substring(0, 100));
      } catch (e) {
        console.error('Invalid base64 format:', e);
        throw new Error('Invalid base64 image data format');
      }
      
      console.log('Successfully generated screenshot, base64 length:', base64Image.length, 'characters');
      
      // Return the image URL as data URL
      return new Response(
        JSON.stringify({ 
          imageUrl: `data:image/jpeg;base64,${base64Image}`,
          success: true 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
      
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error("Error with Pikwy API request:", fetchError);
      
      // If it's an abort error, handle it specifically
      if (fetchError.name === 'AbortError') {
        console.warn('Screenshot generation timed out after 90 seconds');
        return new Response(
          JSON.stringify({ 
            error: 'Screenshot generation timed out',
            success: false,
            timeout: true
          }),
          { 
            status: 408, // Request Timeout
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
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
