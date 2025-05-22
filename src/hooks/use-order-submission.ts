
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ProductDetails, InfluencerAddress } from "@/types/order";
import { sendNotification, sendAdminNotification } from "@/utils/notifications";

export const useOrderSubmission = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [paymentStep, setPaymentStep] = useState<'initial' | 'pending' | 'complete'>('initial');
  const { toast } = useToast();

  const submitOrder = async (
    gift_url: string,
    message: string,
    influencer_id: string,
    product_preview: ProductDetails | null,
    shipping_address: InfluencerAddress
  ) => {
    try {
      setIsLoading(true);
      setPaymentStep("pending");
      setOrderError(null);

      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("You must be logged in to place an order");
      }

      console.log("Submitting order with product preview:", product_preview);

      const price = product_preview?.priceInr || 0;
      const platform_fee = product_preview?.platformFee || 5;
      const total_amount = price + platform_fee;

      // Convert InfluencerAddress to a JSON-compatible format (as required by Supabase)
      const shipping_address_json = { ...shipping_address } as unknown as Record<string, any>;

      // Create the order directly in orders_under_process
      const orderData = {
        user_id: user.id,
        influencer_id,
        product_url: gift_url,
        product_title: product_preview?.name || "Custom Gift",
        product_price: price, 
        platform_fee,
        total_amount,
        message,
        shipping_address: shipping_address_json
      };

      // Insert the order into orders_under_process
      const { data: orderResult, error: orderError } = await supabase
        .from("orders_under_process")
        .insert(orderData)
        .select()
        .single();

      if (orderError) {
        console.error("Error creating order:", orderError);
        throw orderError;
      }

      console.log("Order created successfully:", orderResult);

      // Create the gift request in gift_requests table as well for backwards compatibility
      const gift_request_data = {
        product_url: gift_url,
        product_title: product_preview?.name || "Custom Gift",
        product_price: price, 
        product_image_url: product_preview?.image || null,
        website_preview_url: product_preview?.image && typeof product_preview?.image === 'string' && product_preview?.image.startsWith("data:") ? product_preview?.image : null,
        message,
        influencer_id,
        sender_id: user.id,
        status: "pending" as "pending" | "accepted" | "rejected" | "under process" | "completed",
        total_amount
      };

      const { data: giftRequest, error: createError } = await supabase
        .from("gift_requests")
        .insert(gift_request_data)
        .select()
        .single();

      if (createError) {
        console.error("Error creating gift request:", createError);
        // Do not throw, just log as this is for backwards compatibility
      } else {
        console.log("Gift request created successfully:", giftRequest);
      }

      // Get screenshot or image URL for notifications
      const screenshotUrl = product_preview?.image || null;

      // Send notification to influencer with screenshot
      await sendNotification(
        influencer_id,
        "new_gift_request",
        "You have received a new gift request.",
        orderResult.id,
        user.id,
        screenshotUrl
      );

      // Send notification to admin with screenshot
      await sendAdminNotification(
        "new_gift_request_admin",
        `New gift request from ${user.email} to influencer ID: ${influencer_id}`,
        orderResult.id,
        user.id,
        screenshotUrl
      );

      setPaymentStep("complete");

      // Show success message
      toast({
        title: "Success!",
        description: "Your gift request has been submitted successfully.",
      });

      return orderResult.id;
    } catch (error) {
      console.error("Error submitting order:", error);
      setOrderError(error instanceof Error ? error.message : "An error occurred during checkout");
      setPaymentStep("initial");
      
      // Show error message
      toast({
        title: "Error placing order",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
      
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    orderError,
    paymentStep,
    submitOrder,
  };
};
