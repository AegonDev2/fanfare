
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ProductDetails, InfluencerAddress } from "@/types/order";

export type PaymentStep = 'initial' | 'pending' | 'complete';

export const useOrderSubmission = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStep, setPaymentStep] = useState<PaymentStep>('initial');
  const [orderError, setOrderError] = useState<string | null>(null);

  const submitOrder = async (
    giftItem: string,
    message: string,
    influencerId: string,
    productDetails: ProductDetails,
    influencerAddress: InfluencerAddress
  ) => {
    if (!giftItem || !influencerId) {
      toast({
        title: "Error",
        description: "Missing required information",
        variant: "destructive",
      });
      setOrderError("Missing gift item URL or influencer ID");
      return;
    }

    // Validate product details
    if (!productDetails || !productDetails.name || productDetails.priceInr <= 0) {
      toast({
        title: "Error",
        description: "Invalid product details. Please try again with a different product URL.",
        variant: "destructive",
      });
      setOrderError("Invalid product details");
      return;
    }

    setIsLoading(true);
    setPaymentStep('pending');
    setOrderError(null);

    try {
      console.log("Submitting order with product details:", productDetails);
      
      // Create order in database with shipping address information directly in the orders table
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          influencer_id: influencerId,
          product_url: giftItem,
          product_title: productDetails.name,
          product_price: productDetails.priceInr,
          platform_fee: productDetails.platformFee,
          total_amount: productDetails.priceInr + productDetails.platformFee,
          message: message,
          status: "pending",
          shipping_address: {
            name: influencerAddress.name, 
            address_line1: influencerAddress.address_line1,
            address_line2: influencerAddress.address_line2 || "",
            city: influencerAddress.city,
            state: influencerAddress.state,
            postal_code: influencerAddress.postal_code,
            country: influencerAddress.country || "India",
            phone: influencerAddress.phone
          }
        })
        .select()
        .single();

      if (orderError) {
        console.error("Database order creation error:", orderError);
        throw new Error(orderError.message);
      }

      console.log("Order created successfully:", order);

      // Update order status after payment
      const { error: updateError } = await supabase
        .from('orders')
        .update({ status: "accepted" })
        .eq('id', order.id);

      if (updateError) {
        console.error("Order status update error:", updateError);
        throw new Error(updateError.message);
      }

      setPaymentStep('complete');
      
      toast({
        title: "Order Placed Successfully",
        description: "Your gift order has been placed and will be delivered soon!",
      });

      // Create notification for the influencer about the new order
      await supabase.from("notifications").insert({
        recipient_id: influencerId,
        type: "new_order",
        message: `Someone has purchased a gift for you! Check your gift requests.`,
        reference_id: order.id,
      });

      // Redirect to success page or show success message
      setTimeout(() => {
        window.location.href = `/order-success?id=${order.id}`;
      }, 2000);

    } catch (error) {
      console.error("Order submission error:", error);
      setPaymentStep('initial');
      setOrderError(error instanceof Error ? error.message : "An unknown error occurred");
      
      toast({
        title: "Order Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to detect platform from URL
  const detectPlatform = (url: string): 'amazon' | 'flipkart' | undefined => {
    if (url.includes('amazon')) return 'amazon';
    if (url.includes('flipkart')) return 'flipkart';
    return undefined;
  };

  return {
    isLoading,
    paymentStep,
    orderError,
    submitOrder
  };
};
