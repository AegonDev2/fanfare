
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
        .select();

      if (giftRequestError) {
        console.error("Error creating gift request:", giftRequestError);
        throw giftRequestError;
      }

      if (!giftRequest || giftRequest.length === 0) {
        throw new Error("Failed to create gift request");
      }

      console.log("Gift request created:", giftRequest[0]);
      
      // Use Axiom AI to automate the order placement
      try {
        // Collect payment details from the card form (in a real implementation, this would be more secure)
        // This is just a simulation for demonstration purposes
        const paymentDetails = {
          // Note: In a real app, you would NEVER send full card details like this
          // This is just to show the concept - in reality you'd use a secure payment processor
          cardNumber: '************1234', // Masked for security
          cardholderName: 'Fan',
          expiryDate: 'XX/XX', // Masked for security
          securityCode: '***' // Masked for security
        };
        
        const { data: axiomOrderResult, error: axiomOrderError } = await supabase.functions.invoke('axiom-ai', {
          body: { 
            action: 'placeOrder', 
            url: giftItem,
            options: {
              address: influencerAddress, // Sending the hidden influencer address
              paymentDetails: paymentDetails,
              quantity: 1
            }
          }
        });

        if (axiomOrderError || !axiomOrderResult.success) {
          console.error("Warning: Axiom AI order automation failed:", axiomOrderError || axiomOrderResult?.error);
          // Don't throw here - we still want to complete the flow even if automation fails
          // The gift request is still created, it just means manual fulfillment may be needed
        } else {
          console.log("Order successfully automated with Axiom AI:", axiomOrderResult);
          // Update the gift request status to reflect automated order
          await supabase
            .from('gift_requests')
            .update({ status: 'processing', order_id: axiomOrderResult.data.orderId })
            .eq('id', giftRequest[0].id);
        }
      } catch (automationError) {
        console.error("Exception in order automation:", automationError);
        // Don't throw here - we still want to complete the flow even if automation fails
      }

      // Send notification to the influencer
      try {
        const { error: notificationError } = await supabase.functions.invoke('send-notification', {
          body: { 
            type: 'new_gift_request',
            recipientId: influencerId,
            senderId: user.id,
            giftRequestId: giftRequest[0].id,
            message: `You have a new gift request for ${productPreview.name}`
          }
        });

        if (notificationError) {
          console.error("Error sending notification:", notificationError);
          // Don't throw here - we still want to complete the flow even if notification fails
        }
      } catch (notificationError) {
        console.error("Exception sending notification:", notificationError);
        // Don't throw here - we still want to complete the flow even if notification fails
      }

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
