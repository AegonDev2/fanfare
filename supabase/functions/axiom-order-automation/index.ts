
// Follow ES module imports
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.4";

// CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Create a Supabase client with service role
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);

// Get the Axiom API key from environment
const axiomApiKey = Deno.env.get("AXIOM_API_KEY");

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
    const { orderId, productUrl, shippingAddress, platform } = requestData;

    if (!orderId || !productUrl || !shippingAddress) {
      throw new Error("Missing required order information");
    }

    console.log(`Starting order automation for order ID: ${orderId}`);
    console.log(`Product URL: ${productUrl}`);
    console.log(`Platform: ${platform || "Unknown"}`);

    if (!axiomApiKey) {
      console.error("AXIOM_API_KEY not set in environment variables");
      throw new Error("Axiom API key not configured");
    }

    // Determine which ecommerce platform we're working with
    const detectedPlatform = platform || 
      (productUrl.includes('amazon') ? 'amazon' : 
      productUrl.includes('flipkart') ? 'flipkart' : null);

    if (!detectedPlatform) {
      throw new Error("Unsupported ecommerce platform. Only Amazon and Flipkart are currently supported.");
    }

    // Format shipping address for the Axiom API
    const formattedAddress = {
      name: shippingAddress.name,
      line1: shippingAddress.address_line1,
      line2: shippingAddress.address_line2 || "",
      city: shippingAddress.city,
      state: shippingAddress.state,
      postal_code: shippingAddress.postal_code,
      country: shippingAddress.country || "India",
      phone: shippingAddress.phone,
    };

    // Call the Axiom AI API to place the order
    const axiomResponse = await fetch("https://api.axiom.ai/v1/order/place", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${axiomApiKey}`,
        "X-API-Version": "2023-09",
      },
      body: JSON.stringify({
        orderId: orderId,
        productUrl: productUrl,
        platform: detectedPlatform,
        shippingAddress: formattedAddress,
        paymentMethod: "cod", // Cash on delivery as default
        requestSource: "supabase-edge",
      }),
    });

    if (!axiomResponse.ok) {
      const errorData = await axiomResponse.json();
      console.error("Axiom API error:", errorData);
      throw new Error(`Axiom API error: ${errorData.message || "Unknown error"}`);
    }

    const axiomData = await axiomResponse.json();
    console.log("Axiom order placement succeeded:", axiomData);

    // Update the order status in the database
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        status: "processing",
        // Add tracking information if available from Axiom
        tracking_id: axiomData.tracking_id || null,
        delivery_estimate: axiomData.estimated_delivery || null,
      })
      .eq("id", orderId);

    if (updateError) {
      console.error("Error updating order status:", updateError);
      throw new Error(`Failed to update order status: ${updateError.message}`);
    }

    // Create notification for order processing
    await supabase.from("notifications").insert({
      recipient_id: (await supabase.from("orders").select("influencer_id").eq("id", orderId).single()).data?.influencer_id,
      type: "order_processing",
      message: `Your order for ${axiomData.product_name || "an item"} is being processed.`,
      reference_id: orderId,
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Order automation initiated successfully",
        data: {
          orderId: orderId,
          axionJobId: axiomData.job_id || null,
          estimatedDelivery: axiomData.estimated_delivery || null,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Order automation error:", error);

    // Attempt to record the error in the database
    if (req.body) {
      try {
        const { orderId } = await req.json();
        if (orderId) {
          await supabase
            .from("orders")
            .update({
              status: "automation_failed",
              notes: `Automation failed: ${error.message}`,
            })
            .eq("id", orderId);
        }
      } catch (dbError) {
        console.error("Failed to update order with error:", dbError);
      }
    }

    return new Response(
      JSON.stringify({
        success: false,
        message: "Order automation failed",
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
