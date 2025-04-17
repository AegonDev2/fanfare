
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const { url, platform } = await req.json();
    
    // Validate inputs
    if (!url) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "URL is required" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    if (!['amazon', 'flipkart'].includes(platform)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Unsupported platform" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    console.log(`Processing extraction request for ${platform} URL: ${url}`);

    // Since we're simplifying, let's use mock data for now
    // In a real implementation, this would be replaced with actual web scraping logic
    let productData;
    
    if (platform === 'amazon') {
      productData = mockAmazonProduct(url);
    } else {
      productData = mockFlipkartProduct(url);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        productData 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in axiom-product-extraction:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error occurred" 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

// Mock data generators for demonstration
function mockAmazonProduct(url: string) {
  const randomId = Math.floor(Math.random() * 10000);
  return {
    name: `Amazon Product ${randomId}`,
    price: `₹${(Math.random() * 5000 + 500).toFixed(2)}`,
    image: "https://m.media-amazon.com/images/I/71D9ImsvEtL._UY500_.jpg",
    description: "This is a mock Amazon product description for demonstration. In production, this would be extracted from the actual product page.",
    platform: 'amazon'
  };
}

function mockFlipkartProduct(url: string) {
  const randomId = Math.floor(Math.random() * 10000);
  return {
    name: `Flipkart Product ${randomId}`,
    price: `₹${(Math.random() * 5000 + 500).toFixed(2)}`,
    image: "https://rukminim2.flixcart.com/image/450/500/xif0q/watch/z/1/h/1-elegant-waterproof-quartz-analog-wrist-watch-with-stainless-original-imagqmhgzm8jxfzt.jpeg",
    description: "This is a mock Flipkart product description for demonstration. In production, this would be extracted from the actual product page.",
    platform: 'flipkart'
  };
}
