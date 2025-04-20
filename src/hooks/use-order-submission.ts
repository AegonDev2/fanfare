
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ProductDetails, InfluencerAddress } from "@/types/order";
import { useWallet } from "@/hooks/use-wallet";

export type PaymentStep = 'initial' | 'pending' | 'complete';

export const useOrderSubmission = () => {
  const { toast } = useToast();
  const { checkWalletBalance } = useWallet();
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
      
      const totalAmount = productDetails.priceInr + productDetails.platformFee;
      
      // Instead of charging immediately, just check if user has enough balance
      const hasEnoughBalance = await checkWalletBalance(totalAmount);
      
      if (!hasEnoughBalance) {
        setPaymentStep('initial');
        toast({
          title: "Insufficient wallet balance",
          description: `Your order total is ₹${totalAmount.toFixed(2)}. Please top up your wallet.`,
          variant: "destructive",
        });
        
        // Redirect to wallet page after a delay
        setTimeout(() => {
          window.location.href = "/wallet";
        }, 2000);
        
        return;
      }
      
      // Create gift request without charging the wallet yet
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
