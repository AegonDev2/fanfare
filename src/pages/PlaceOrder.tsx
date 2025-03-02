import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/landing/Header";
import ProductUrlInput from "@/components/order/ProductUrlInput";
import ProductPreview from "@/components/order/ProductPreview";
import WebAutomation from "@/components/product/WebAutomation";
import { useProductPreview } from "@/hooks/use-product-preview";
import { useOrderSubmission } from "@/hooks/use-order-submission";
import { InfluencerAddress } from "@/types/order";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingBag, Sparkles } from "lucide-react";

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
  const [extractionMethod, setExtractionMethod] = useState<"standard" | "automation">("standard");

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

      const transformedAddress: InfluencerAddress = {
        id: addresses.id,
        name: addresses.name || "Recipient", 
        street_address: addresses.street_address || "",
        address_line1: addresses.address_line1 || addresses.street_address || "",
        address_line2: addresses.address_line2 || "",
        city: addresses.city,
        state: addresses.state,
        postal_code: addresses.postal_code,
        country: addresses.country || "India",
        phone: addresses.phone || "Not provided",
        is_primary: addresses.is_primary,
        influencer_id: addresses.influencer_id,
        created_at: addresses.created_at
      };

      setInfluencerAddress(transformedAddress);
    } catch (error) {
      console.error('Error in fetchInfluencerAddress:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (influencerAddress) {
      await submitOrder(giftItem, message, influencerId, productPreview, influencerAddress);
    } else {
      toast({
        title: "Error",
        description: "Could not verify shipping address. Please try again later.",
        variant: "destructive",
      });
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
        <Tabs value={extractionMethod} onValueChange={(value) => setExtractionMethod(value as "standard" | "automation")}>
          <TabsList className="mb-6 w-full max-w-md mx-auto">
            <TabsTrigger value="standard" className="flex-1">
              <ShoppingBag className="h-4 w-4 mr-2" />
              Standard Method
            </TabsTrigger>
            <TabsTrigger value="automation" className="flex-1">
              <Sparkles className="h-4 w-4 mr-2" />
              Automated Extraction
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="standard">
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
              paymentStep={paymentStep === 'pending' ? 'processing' : paymentStep}
            />
          </TabsContent>
          
          <TabsContent value="automation">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Advanced Product Extraction
              </h2>
              <p className="text-gray-600 mb-4">
                Use our web automation technology to extract product details directly from any ecommerce site.
                This method doesn't require an API key and works with most popular shopping websites.
              </p>
            </div>
            <WebAutomation />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PlaceOrder;
