
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { ProductDetails, InfluencerAddress } from "@/types/order";

export const useOrderSubmission = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

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

      // Create a gift request
      const { error: giftRequestError } = await supabase
        .from('gift_requests')
        .insert({
          sender_id: user.id,
          influencer_id: influencerId,
          product_url: giftItem,
          product_title: productPreview.name,
          product_price: productPreview.priceInr,
          message: message,
          status: 'pending'
        });

      if (giftRequestError) throw giftRequestError;

      toast({
        title: "Gift request sent successfully",
        description: "Your request has been sent to the influencer. The amount will be refunded if the request is rejected.",
      });
      
      navigate("/");
    } catch (error) {
      console.error("Error submitting gift request:", error);
      toast({
        title: "Error",
        description: "Failed to submit gift request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    submitOrder
  };
};
