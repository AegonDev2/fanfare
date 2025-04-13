
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
      
      // Get the current authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("You must be logged in to place an order");
      }
      
      // Check wallet balance first using direct query (TypeScript workaround)
      const { data: walletData, error: walletError } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', user.id)
        .single();
      
      if (walletError) {
        throw new Error("Failed to check wallet balance. Please try again.");
      }
      
      const totalAmount = productDetails.priceInr + productDetails.platformFee;
      const walletBalance = walletData ? walletData.balance : 0;
      
      // If wallet doesn't exist or has insufficient balance
      if (!walletData || walletBalance < totalAmount) {
        setPaymentStep('initial');
        toast({
          title: "Insufficient wallet balance",
          description: `Your order total is ₹${totalAmount.toFixed(2)} but your wallet balance is ₹${walletBalance.toFixed(2) || '0.00'}. Please top up your wallet.`,
          variant: "destructive",
        });
        
        // Redirect to wallet page after a delay
        setTimeout(() => {
          window.location.href = "/wallet";
        }, 2000);
        
        return;
      }
      
      // Create gift request instead of direct order
      const { data: giftRequest, error: giftRequestError } = await supabase
        .from('gift_requests')
        .insert({
          influencer_id: influencerId,
          sender_id: user.id,
          product_url: giftItem,
          product_title: productDetails.name,
          product_price: productDetails.priceInr,
          message: message,
          status: "pending"
        })
        .select()
        .single();

      if (giftRequestError) {
        console.error("Database gift request creation error:", giftRequestError);
        throw new Error(giftRequestError.message);
      }

      console.log("Gift request created successfully:", giftRequest);
      
      setPaymentStep('complete');
      
      toast({
        title: "Gift Request Submitted",
        description: "Your gift request has been submitted to the influencer for approval.",
      });

      // Create notification for the influencer about the new gift request
      await supabase.from("notifications").insert({
        recipient_id: influencerId,
        sender_id: user.id,
        type: "new_gift_request",
        message: `Someone wants to send you a gift! Check your gift requests.`,
        reference_id: giftRequest.id,
      });

      // Redirect to success page after a delay
      setTimeout(() => {
        window.location.href = `/gift-requests`;
      }, 2000);

    } catch (error) {
      console.error("Order submission error:", error);
      setPaymentStep('initial');
      setOrderError(error instanceof Error ? error.message : "An unknown error occurred");
      
      toast({
        title: "Request Failed",
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
    orderError,
    submitOrder
  };
};
