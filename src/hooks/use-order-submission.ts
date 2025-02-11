
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
          description: "Please log in to place an order",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      // First store product details
      const { data: productData, error: productError } = await supabase
        .from('products')
        .insert({
          url: giftItem,
          name: productPreview.name,
          description: productPreview.description,
          price: productPreview.priceInr,
          image_url: productPreview.image
        })
        .select()
        .single();

      if (productError) throw productError;

      // Place order on ecommerce platform
      const { data: ecommerceResult, error: ecommerceError } = await supabase.functions.invoke(
        'place-ecommerce-order',
        {
          body: {
            platform: productPreview.platform || 'amazon',
            productUrl: giftItem,
            addressId: influencerAddress.id,
            quantity: 1
          }
        }
      );

      if (ecommerceError) throw ecommerceError;

      // Store order in our database
      const { error: orderError } = await supabase.from("orders").insert({
        user_id: user.id,
        influencer_id: influencerId,
        product_id: productData.id,
        product_url: giftItem,
        product_title: productPreview.name,
        product_price: productPreview.priceInr,
        platform_fee: productPreview.platformFee * 83,
        total_amount: productPreview.priceInr + (productPreview.platformFee * 83),
        message: message,
        status: "pending",
        shipping_address_id: influencerAddress.id
      });

      if (orderError) throw orderError;

      toast({
        title: "Order placed successfully",
        description: "Your order has been submitted",
      });
      
      navigate("/");
    } catch (error) {
      console.error("Error placing order:", error);
      toast({
        title: "Error",
        description: "Failed to place order. Please try again.",
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
