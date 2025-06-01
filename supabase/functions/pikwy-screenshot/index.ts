
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
    
    // Set a longer timeout for the fetch operation (45 seconds)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000);
    
    try {
      // Always use the binary fetch method for better reliability
      const apiUrl = `https://api.pikwy.com?u=${encodedUrl}&tkn=${PIKWY_API_TOKEN}&fs=${fullScreenParam}&w=1200&h=800`;
      
      console.log(`Making request to Pikwy API: ${apiUrl}`);
      
      const response = await fetch(apiUrl, { 
        method: "GET",
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      clearTimeout(timeoutId);
      
      console.log(`Pikwy API response status: ${response.status}`);
      console.log(`Response headers:`, Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Pikwy API error: ${response.status} - ${errorText}`);
        throw new Error(`Failed to generate preview: ${response.status}`);
      }
      
      // Get the raw image data as ArrayBuffer
      const imageBuffer = await response.arrayBuffer();
      
      if (!imageBuffer || imageBuffer.byteLength === 0) {
        console.error("Failed to get image data or empty response");
        throw new Error('Failed to get valid image data');
      }
      
      console.log(`Successfully generated screenshot, binary length: ${imageBuffer.byteLength} bytes`);
      
      // Check if the response is actually an image by checking the first few bytes
      const uint8Array = new Uint8Array(imageBuffer);
      const firstBytes = Array.from(uint8Array.slice(0, 8)).map(b => b.toString(16).padStart(2, '0')).join('');
      console.log(`First 8 bytes as hex: ${firstBytes}`);
      
      // Check for common image signatures
      const isPNG = uint8Array[0] === 0x89 && uint8Array[1] === 0x50 && uint8Array[2] === 0x4E && uint8Array[3] === 0x47;
      const isJPEG = uint8Array[0] === 0xFF && uint8Array[1] === 0xD8;
      const isGIF = uint8Array[0] === 0x47 && uint8Array[1] === 0x49 && uint8Array[2] === 0x46;
      
      if (!isPNG && !isJPEG && !isGIF) {
        console.error("Response doesn't appear to be a valid image");
        // Try to decode as text to see what we got
        const textResponse = new TextDecoder().decode(uint8Array.slice(0, Math.min(200, uint8Array.length)));
        console.error("Response as text:", textResponse);
        throw new Error('Invalid image data received from Pikwy API');
      }
      
      // Convert ArrayBuffer to base64 efficiently
      let binary = '';
      const chunkSize = 8192;
      
      for (let i = 0; i < uint8Array.length; i += chunkSize) {
        const chunk = uint8Array.slice(i, i + chunkSize);
        binary += String.fromCharCode.apply(null, Array.from(chunk));
      }
      
      const base64Image = btoa(binary);
      
      console.log(`Converted to base64, length: ${base64Image.length}`);
      
      // Determine content type based on image format
      let contentType = 'image/jpeg';
      if (isPNG) contentType = 'image/png';
      else if (isGIF) contentType = 'image/gif';
      
      // Return the image URL as data URL
      return new Response(
        JSON.stringify({ 
          imageUrl: `data:${contentType};base64,${base64Image}`,
          contentType: contentType,
          size: imageBuffer.byteLength
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
      
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error("Error with fetch operation:", fetchError);
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
