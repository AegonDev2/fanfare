
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

    let order;
    let message;

    switch (operation) {
      case "process":
        // Move order from under_process to accepted
        const { data: processResult, error: processError } = await supabase.rpc(
          'move_order_to_accepted',
          { order_id: orderId }
        );
        
        if (processError) {
          throw new Error(`Error processing order: ${processError.message}`);
        }

        // Get current order information from accepted table
        const { data: acceptedOrder, error: orderError } = await supabase
          .from("orders_accepted")
          .select("*, influencer:influencer_id(*)")
          .eq("id", orderId)
          .single();

        if (orderError) {
          throw new Error(`Error retrieving order: ${orderError.message}`);
        }

        order = acceptedOrder;
        message = "Your order is being processed by our team.";
        break;

      case "complete":
        // Get delivery estimate (7 days from now)
        const deliveryEstimate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        // Move order from accepted to completed
        const { data: completeResult, error: completeError } = await supabase.rpc(
          'move_order_to_completed',
          { 
            order_id: orderId,
            p_delivery_estimate: deliveryEstimate 
          }
        );
        
        if (completeError) {
          throw new Error(`Error completing order: ${completeError.message}`);
        }

        // Get current order information from completed table
        const { data: completedOrder, error: completedOrderError } = await supabase
          .from("orders_completed")
          .select("*, influencer:influencer_id(*)")
          .eq("id", orderId)
          .single();

        if (completedOrderError) {
          throw new Error(`Error retrieving completed order: ${completedOrderError.message}`);
        }

        order = completedOrder;
        message = "Your order has been processed and shipped!";
        break;

      default:
        throw new Error(`Unsupported operation: ${operation}`);
    }

    // Create notification for user if available
    if (order.user_id) {
      const { error: notificationError } = await supabase.from("notifications").insert({
        recipient_id: order.user_id,
        type: `order_${operation === "process" ? "processing" : "completed"}`,
        message: message,
        reference_id: orderId,
      });

      if (notificationError) {
        console.error("Error creating notification:", notificationError);
        // Continue even if notification fails
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Order ${operation === "process" ? "processing" : "completed"}`,
        data: {
          orderId: orderId,
          status: operation === "process" ? "accepted" : "completed",
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
