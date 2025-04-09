
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
    // This function now only updates order status for manual processing and creates notifications
    const requestData = await req.json();
    const { orderId, operation } = requestData;

    if (!orderId) {
      throw new Error("Missing required order information");
    }

    console.log(`Manual order operation: ${operation} for order ID: ${orderId}`);

    // Get current order information
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .select("*, influencer:influencer_id(*)")
      .eq("id", orderId)
      .single();

    if (orderError) {
      throw new Error(`Error retrieving order: ${orderError.message}`);
    }

    // Update order status based on operation
    let newStatus = "pending";
    let message = "Order status updated";

    switch (operation) {
      case "process":
        newStatus = "processing";
        message = "Your order is being processed by our team.";
        break;
      case "complete":
        newStatus = "completed";
        message = "Your order has been processed and shipped!";
        break;
      case "cancel":
        newStatus = "cancelled";
        message = "Your order has been cancelled.";
        break;
      default:
        throw new Error(`Unsupported operation: ${operation}`);
    }

    // Update the order status in the database
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        status: newStatus,
      })
      .eq("id", orderId);

    if (updateError) {
      console.error("Error updating order status:", updateError);
      throw new Error(`Failed to update order status: ${updateError.message}`);
    }

    // Create notification for status update
    const { error: notificationError } = await supabase.from("notifications").insert({
      recipient_id: orderData.influencer_id,
      type: `order_${newStatus}`,
      message: message,
      reference_id: orderId,
    });

    if (notificationError) {
      console.error("Error creating notification:", notificationError);
      // Continue even if notification fails
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Order ${newStatus}`,
        data: {
          orderId: orderId,
          status: newStatus,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Order operation error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        message: "Order operation failed",
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
