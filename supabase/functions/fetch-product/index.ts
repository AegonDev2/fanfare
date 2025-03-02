
// Follow ES module imports
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.4";

// CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Create a Supabase client with the service role
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);

// Main request handler
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    // Get request body
    const requestData = await req.json();
    const { url, platform } = requestData;

    if (!url) {
      throw new Error("Missing required product URL");
    }

    console.log(`Fetching product details for URL: ${url}`);

    // Call our axiom-product-extraction function
    const { data: axiomData, error: axiomError } = await supabase.functions.invoke("axiom-product-extraction", {
      body: { url, platform },
    });

    if (axiomError) {
      console.error("Axiom extraction error:", axiomError);
      throw new Error(`Failed to extract product: ${axiomError.message}`);
    }

    console.log("Successfully extracted product data:", axiomData);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: { 
          productData: axiomData.data.productData 
        } 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Product fetching error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: {
          message: error.message || "An unknown error occurred",
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
