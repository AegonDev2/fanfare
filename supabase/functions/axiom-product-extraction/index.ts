
// Follow ES module imports
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

// CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
    // Get Axiom API key from environment
    const axiomApiKey = Deno.env.get("AXIOM_API_KEY");
    if (!axiomApiKey) {
      console.error("AXIOM_API_KEY not set in environment variables");
      throw new Error("Axiom API key not configured");
    }

    // Get request body
    const requestData = await req.json();
    const { url, platform } = requestData;

    if (!url) {
      throw new Error("Missing required product URL");
    }

    console.log(`Starting product extraction for URL: ${url}`);

    // Determine which ecommerce platform we're working with
    const detectedPlatform = platform || 
      (url.includes('amazon') ? 'amazon' : 
      url.includes('flipkart') ? 'flipkart' : null);

    if (!detectedPlatform) {
      throw new Error("Unsupported ecommerce platform. Only Amazon and Flipkart are currently supported.");
    }

    // Call the Axiom AI API to extract product details
    const axiomResponse = await fetch("https://api.axiom.ai/v1/product/extract", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${axiomApiKey}`,
        "X-API-Version": "2023-09",
      },
      body: JSON.stringify({
        productUrl: url,
        platform: detectedPlatform,
        fields: ["name", "price", "description", "image", "availability", "specifications"],
        requestSource: "supabase-edge",
      }),
    });

    if (!axiomResponse.ok) {
      const errorData = await axiomResponse.json();
      console.error("Axiom API error:", errorData);
      throw new Error(`Axiom API error: ${errorData.message || "Unknown error"}`);
    }

    const axiomData = await axiomResponse.json();
    console.log("Axiom product extraction succeeded:", axiomData);

    // Format the response for the frontend
    const productData = {
      name: axiomData.name || "Unknown Product",
      price: parseFloat(axiomData.price?.replace(/[^\d.]/g, "") || "0"),
      description: axiomData.description || "",
      image: axiomData.image || "",
      availability: axiomData.availability || true,
      specifications: axiomData.specifications || {},
      platform: detectedPlatform,
    };

    return new Response(
      JSON.stringify({
        success: true,
        message: "Product extracted successfully",
        data: {
          productData,
          axiomJobId: axiomData.job_id || null,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Product extraction error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        message: "Product extraction failed",
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
