
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/landing/Header";
import ProductUrlInput from "@/components/order/ProductUrlInput";
import ProductPreview from "@/components/order/ProductPreview";
import { useProductPreview } from "@/hooks/use-product-preview";
import { useOrderSubmission } from "@/hooks/use-order-submission";
import { InfluencerAddress } from "@/types/order";

interface PlaceOrderProps {
  setNavOpen?: (isOpen: boolean) => void;
}

const PlaceOrder = ({ setNavOpen }: PlaceOrderProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const [influencerAddress, setInfluencerAddress] = useState<InfluencerAddress | null>(null);
  const [giftItem, setGiftItem] = useState(searchParams.get("gift") || "");
  const influencerId = searchParams.get("influencer") || "";
  const [message, setMessage] = useState("");

  const { 
    productPreview, 
    isFetchingProduct, 
    fetchProgress, 
    handlePreviewProduct 
  } = useProductPreview();

  const { isLoading, paymentStep, submitOrder } = useOrderSubmission();

  useEffect(() => {
    if (influencerId) {
      fetchInfluencerAddress();
    }
  }, [influencerId]);

  // Still fetch the address for order processing, but we won't display it to the user
  const fetchInfluencerAddress = async () => {
    try {
      const { data: addresses, error } = await supabase
        .from('influencer_addresses')
        .select('*')
        .eq('influencer_id', influencerId)
        .eq('is_primary', true)
        .single();

      if (error) {
        console.error('Error fetching address:', error);
        toast({
          title: "Warning",
          description: "Could not verify shipping address. Please try again later.",
          variant: "destructive",
        });
        return;
      }

      if (!addresses) {
        toast({
          title: "Warning",
          description: "This influencer hasn't set up their shipping address yet.",
          variant: "destructive",
        });
        return;
      }

      // Transform to expected format
      const transformedAddress: InfluencerAddress = {
        id: addresses.id,
        name: addresses.name || addresses.street_address?.split(',')[0] || "Unknown",
        address_line1: addresses.address_line1 || addresses.street_address || "",
        address_line2: addresses.address_line2 || "",
        city: addresses.city,
        state: addresses.state,
        postal_code: addresses.postal_code,
        country: addresses.country || "India",
        phone: addresses.phone || "",
        is_primary: addresses.is_primary,
        influencer_id: addresses.influencer_id,
        created_at: addresses.created_at
      };

      // Store address but don't display it to user
      setInfluencerAddress(transformedAddress);
    } catch (error) {
      console.error('Error in fetchInfluencerAddress:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (influencerAddress) {
      await submitOrder(giftItem, message, influencerId, productPreview, influencerAddress);
    }
  };

  const handleUrlChange = (newUrl: string) => {
    setGiftItem(newUrl);
    setSearchParams(prev => {
      prev.set("gift", newUrl);
      return prev;
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 font-roboto">
      <Header setNavOpen={setNavOpen} />
      <div className="container mx-auto px-4 py-8 pt-20">
        <ProductUrlInput
          giftItem={giftItem}
          onUrlChange={handleUrlChange}
          onPreviewClick={() => handlePreviewProduct(giftItem)}
          isFetchingProduct={isFetchingProduct}
          fetchProgress={fetchProgress}
        />

        <ProductPreview
          productPreview={productPreview}
          influencerAddress={influencerAddress}
          message={message}
          onMessageChange={(newMessage) => setMessage(newMessage)}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          paymentStep={paymentStep}
        />
      </div>
    </div>
  );
};

export default PlaceOrder;
