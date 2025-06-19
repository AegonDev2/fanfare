
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ProductUrlInput from "@/components/order/ProductUrlInput";
import ProductPreview from "@/components/order/ProductPreview";
import { useProductPreview } from "@/hooks/use-product-preview";
import { useOrderSubmission } from "@/hooks/use-order-submission";
import { InfluencerAddress } from "@/types/order";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useGiftItems } from "@/hooks/useGiftItems";

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
  const giftId = searchParams.get("giftId") || "";
  const [message, setMessage] = useState(searchParams.get("message") || "");
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [autoProcessed, setAutoProcessed] = useState(false);
  const [isGiftFromDatabase, setIsGiftFromDatabase] = useState(false);

  const { getGiftById } = useGiftItems();

  const { 
    productPreview, 
    setProductPreview,
    isFetchingProduct, 
    fetchProgress, 
    handlePreviewProduct,
    error: productPreviewError,
    resetExtractionState,
    websitePreview,
    isGeneratingPreview
  } = useProductPreview();

  const { isLoading, paymentStep, orderError, submitOrder } = useOrderSubmission();

  useEffect(() => {
    if (influencerId) {
      fetchInfluencerAddress();
    } else {
      toast({
        title: "Missing Information",
        description: "No influencer was selected. Please go back and select an influencer.",
        variant: "destructive",
      });
    }
  }, [influencerId]);

  // Check if this is a gift from database and load its data
  useEffect(() => {
    const loadGiftFromDatabase = async () => {
      if (giftId && giftId !== 'custom-wishlist-item') {
        try {
          console.log("Loading gift from database:", giftId);
          const giftData = await getGiftById(giftId);
          
          if (giftData) {
            console.log("Gift data loaded:", giftData);
            setIsGiftFromDatabase(true);
            
            // Create product preview from gift data without calling edge functions
            const preview = {
              name: giftData.name,
              price: giftData.price.toString(),
              priceInr: giftData.price,
              image: giftData.image_url,
              description: giftData.description || "",
              platformFee: 5, // Standard platform fee
              url: giftData.gift_url || giftItem
            };
            
            setProductPreview(preview);
            setAutoProcessed(true);
            
            console.log("Product preview set from database without edge function calls:", preview);
          }
        } catch (error) {
          console.error("Error loading gift from database:", error);
        }
      }
    };

    loadGiftFromDatabase();
  }, [giftId, getGiftById, setProductPreview, giftItem]);

  // If there's a URL in the search params and it's not a gift from database, automatically process it
  useEffect(() => {
    const urlParam = searchParams.get("gift");
    if (urlParam && !autoProcessed && !isFetchingProduct && !productPreview && !isGiftFromDatabase) {
      console.log("Auto-processing product URL from params:", urlParam);
      setAutoProcessed(true);
      handleProcessProduct();
    }
  }, [searchParams, autoProcessed, isFetchingProduct, productPreview, isGiftFromDatabase]);

  const fetchInfluencerAddress = async () => {
    try {
      setIsLoadingAddress(true);
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
    } finally {
      setIsLoadingAddress(false);
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
    
    await submitOrder(giftItem, message, influencerId, productPreview, influencerAddress);
  };

  const handleUrlChange = (newUrl: string) => {
    setGiftItem(newUrl);
    setSearchParams(prev => {
      prev.set("gift", newUrl);
      return prev;
    });
  };

  const handleProcessProduct = () => {
    console.log("Processing product URL:", giftItem);
    handlePreviewProduct(giftItem);
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
      <div className="container mx-auto px-4 py-6 pb-24">
        {renderErrorMessage()}
        
        {/* Only show URL input if this is not a gift from database */}
        {!isGiftFromDatabase && (
          <ProductUrlInput
            giftItem={giftItem}
            onUrlChange={handleUrlChange}
            onPreviewClick={handleProcessProduct}
            isFetchingProduct={isFetchingProduct}
            fetchProgress={fetchProgress}
            isGeneratingPreview={isGeneratingPreview}
          />
        )}

        <ProductPreview
          productPreview={productPreview}
          influencerAddress={influencerAddress}
          message={message}
          onMessageChange={(newMessage) => setMessage(newMessage)}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          paymentStep={paymentStep === 'pending' ? 'processing' : paymentStep}
          giftUrl={giftItem}
          websitePreview={websitePreview}
        />
      </div>
    </div>
  );
};

export default PlaceOrder;
