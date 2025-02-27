
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { ProductDetails, InfluencerAddress } from "@/types/order";

export const useOrderSubmission = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'initial' | 'processing' | 'complete'>('initial');
  const { toast } = useToast();
  const navigate = useNavigate();

  const processPayment = async (amount: number): Promise<boolean> => {
    // This would be replaced with actual payment gateway integration
    // For now, we'll simulate payment processing
    setPaymentStep('processing');
    
    return new Promise((resolve) => {
      setTimeout(() => {
        setPaymentStep('complete');
        resolve(true);
      }, 2000);
    });
  };

  const submitOrder = async (
    giftItem: string,
    message: string,
    influencerId: string,
    productPreview: ProductDetails,
    influencerAddress: InfluencerAddress
  ) => {
    setIsLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to place a gift request",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      // Process payment first
      const totalAmount = productPreview.priceInr + productPreview.platformFee;
      const paymentSuccessful = await processPayment(totalAmount);
      
      if (!paymentSuccessful) {
        toast({
          title: "Payment failed",
          description: "There was an issue processing your payment. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Create a gift request
      const { data: giftRequest, error: giftRequestError } = await supabase
        .from('gift_requests')
        .insert({
          sender_id: user.id,
          influencer_id: influencerId,
          product_url: giftItem,
          product_title: productPreview.name,
          product_price: productPreview.priceInr,
          message: message,
          status: 'pending'
        })
        .select()
        .single();

      if (giftRequestError) throw giftRequestError;

      // Send notification to the influencer (in real app, this would trigger a notification)
      await supabase.functions.invoke('send-notification', {
        body: { 
          type: 'new_gift_request',
          recipientId: influencerId,
          senderId: user.id,
          giftRequestId: giftRequest.id,
          message: `You have a new gift request for ${productPreview.name}`
        }
      });

      toast({
        title: "Gift request sent successfully",
        description: "Your request has been sent to the influencer. You'll be notified when they respond.",
      });
      
      navigate("/gift-requests");
    } catch (error) {
      console.error("Error submitting gift request:", error);
      toast({
        title: "Error",
        description: "Failed to submit gift request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setPaymentStep('initial');
    }
  };

  return {
    isLoading,
    paymentStep,
    submitOrder
  };
};
