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
import { ShoppingBag, Sparkles, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PlaceOrderProps {
  setNavOpen?: (isOpen: boolean) => void;
}

interface SupabaseAddress {
  id: string;
  influencer_id: string;
  street_address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  created_at: string;
  is_primary: boolean;
  name?: string;
  address_line1?: string;
  address_line2?: string;
  phone?: string;
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
    setProductPreview,
    isFetchingProduct, 
    fetchProgress, 
    handlePreviewProduct,
    error: productPreviewError
  } = useProductPreview();

  const { isLoading, paymentStep, orderError, submitOrder } = useOrderSubmission();

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

      const supabaseAddress = addresses as SupabaseAddress;
      
      const transformedAddress: InfluencerAddress = {
        id: supabaseAddress.id,
        name: supabaseAddress.name || "Recipient", 
        street_address: supabaseAddress.street_address || "",
        address_line1: supabaseAddress.address_line1 || supabaseAddress.street_address || "",
        address_line2: supabaseAddress.address_line2 || "",
        city: supabaseAddress.city,
        state: supabaseAddress.state,
        postal_code: supabaseAddress.postal_code,
        country: supabaseAddress.country || "India",
        phone: supabaseAddress.phone || "Not provided",
        is_primary: supabaseAddress.is_primary,
        influencer_id: supabaseAddress.influencer_id,
        created_at: supabaseAddress.created_at
      };

      setInfluencerAddress(transformedAddress);
    } catch (error) {
      console.error('Error in fetchInfluencerAddress:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!influencerAddress) {
      toast({
        title: "Error",
        description: "Could not verify shipping address. Please try again later.",
        variant: "destructive",
      });
      return;
    }
    
    if (!productPreview || productPreview.name === DEFAULT_PRODUCT.name) {
      toast({
        title: "Error",
        description: "Please select a valid product before proceeding.",
        variant: "destructive",
      });
      return;
    }
    
    await submitOrder(giftItem, message, influencerId, productPreview, influencerAddress);
  };

  const handleUrlChange = (newUrl: string) => {
    setGiftItem(newUrl);
    setSearchParams(prev => {
      prev.set("gift", newUrl);
      return prev;
    });
  };

  const DEFAULT_PRODUCT = {
    name: "Enter a product URL to preview",
    description: "Product details will appear here once you enter a valid URL.",
    price: 0,
    priceInr: 0,
    platformFee: 5.00,
    image: "https://storage.googleapis.com/a1aa/image/tSbIqbP_qJMzV8bfuyM7gaSttRX2Pi5K-jl57IlWP44.jpg"
  };

  const renderErrorMessage = () => {
    const error = productPreviewError || orderError;
    if (!error) return null;
    
    return (
      <Alert className="mb-6 border-red-200 bg-red-50">
        <AlertCircle className="h-4 w-4 text-red-500" />
        <AlertDescription className="text-red-600">
          {error}
        </AlertDescription>
      </Alert>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 font-roboto">
      <Header setNavOpen={setNavOpen} />
      <div className="container mx-auto px-4 py-8 pt-20">
        {renderErrorMessage()}
        
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
                This method works with most popular shopping websites.
              </p>
            </div>
            <WebAutomation />
            
            {productPreview && productPreview.name !== DEFAULT_PRODUCT.name && (
              <div className="mt-8">
                <ProductPreview
                  productPreview={productPreview}
                  influencerAddress={influencerAddress}
                  message={message}
                  onMessageChange={(newMessage) => setMessage(newMessage)}
                  onSubmit={handleSubmit}
                  isLoading={isLoading}
                  paymentStep={paymentStep === 'pending' ? 'processing' : paymentStep}
                />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PlaceOrder;
