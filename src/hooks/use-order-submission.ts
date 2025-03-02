
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ProductDetails, InfluencerAddress } from "@/types/order";

export type PaymentStep = 'initial' | 'pending' | 'complete';

export const useOrderSubmission = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStep, setPaymentStep] = useState<PaymentStep>('initial');

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
      return;
    }

    setIsLoading(true);
    setPaymentStep('pending');

    try {
      // Create order in database
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          influencer_id: influencerId,
          product_url: giftItem,
          product_name: productDetails.name,
          product_price: productDetails.priceInr,
          platform_fee: productDetails.platformFee,
          total_amount: productDetails.priceInr + productDetails.platformFee,
          message: message,
          status: "pending",
          product_image: productDetails.image,
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
        throw new Error(orderError.message);
      }

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update order status after payment
      const { error: updateError } = await supabase
        .from('orders')
        .update({ status: "accepted" })
        .eq('id', order.id);

      if (updateError) {
        throw new Error(updateError.message);
      }

      setPaymentStep('complete');
      
      toast({
        title: "Order Placed Successfully",
        description: "Your gift order has been placed and will be delivered soon!",
      });

      // Redirect to success page or show success message
      setTimeout(() => {
        window.location.href = `/order-success?id=${order.id}`;
      }, 2000);

    } catch (error) {
      console.error("Order submission error:", error);
      setPaymentStep('initial');
      toast({
        title: "Order Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    paymentStep,
    submitOrder
  };
};
