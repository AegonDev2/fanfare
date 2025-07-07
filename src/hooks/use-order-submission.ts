
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ProductDetails, InfluencerAddress } from "@/types/order";
import { useUser } from "@/hooks/useUser";
import { useNavigate } from "react-router-dom";
import { useWallet } from "@/hooks/use-wallet";

export function useOrderSubmission() {
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'initial' | 'processing' | 'complete'>('initial');
  const [orderError, setOrderError] = useState<string | null>(null);
  const { user } = useUser();
  const { wallet, checkWalletBalance } = useWallet();
  const { toast } = useToast();
  const navigate = useNavigate();

  const submitOrder = async (
    giftUrl: string,
    message: string,
    influencerId: string,
    productPreview: ProductDetails | null,
    influencerAddress: InfluencerAddress
  ) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to place an order",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }

    if (!productPreview) {
      setOrderError("Product preview is required");
      return;
    }

    console.log("Submitting order with product preview:", productPreview);

    setIsLoading(true);
    setPaymentStep('processing');
    setOrderError(null);

    try {
      // Use the correct price from productPreview
      const productPrice = productPreview.priceInr || 0;
      const platformFee = productPreview.platformFee || 5.00;
      const totalAmount = productPrice + platformFee;

      console.log("Order amounts:", { productPrice, platformFee, totalAmount });

      // Check wallet balance (but don't block order if insufficient)
      const hasSufficientBalance = wallet ? wallet.balance >= totalAmount : false;
      console.log("Wallet balance check:", { 
        walletBalance: wallet?.balance, 
        totalAmount, 
        hasSufficientBalance 
      });

      const { data: order, error } = await supabase
        .from('orders_under_process')
        .insert({
          user_id: user.id,
          influencer_id: influencerId,
          product_url: giftUrl,
          product_title: productPreview.name,
          product_price: productPrice,
          platform_fee: platformFee,
          total_amount: totalAmount,
          message: message,
          shipping_address: {
            name: influencerAddress.name,
            street_address: influencerAddress.street_address,
            city: influencerAddress.city,
            state: influencerAddress.state,
            postal_code: influencerAddress.postal_code,
            country: influencerAddress.country,
            phone: influencerAddress.phone
          }
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating order:", error);
        throw error;
      }

      console.log("Order created successfully:", order);
      
      setPaymentStep('complete');
      
      toast({
        title: "Order Submitted Successfully",
        description: "Your order has been submitted for admin review. Payment will be processed after approval.",
      });

      // Navigate to success page with order ID
      setTimeout(() => {
        navigate('/order-success', { state: { orderId: order.id } });
      }, 2000);

    } catch (error: any) {
      console.error("Error submitting order:", error);
      setOrderError(error.message || "Failed to submit order");
      setPaymentStep('initial');
      
      toast({
        title: "Order Failed",
        description: error.message || "Failed to submit your order. Please try again.",
        variant: "destructive"
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
}
