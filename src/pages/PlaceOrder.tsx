
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Gift, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/hooks/useUser';
import ProductUrlInput from '@/components/order/ProductUrlInput';
import ProductPreview from '@/components/order/ProductPreview';
import GiftMessage from '@/components/gift-selection/GiftMessage';
import InfluencerSelector from '@/components/gift-selection/InfluencerSelector';
import PaymentForm from '@/components/payment/PaymentForm';
import { useProductPreview } from '@/hooks/use-product-preview';
import { useOrderSubmission } from '@/hooks/use-order-submission';
import { useInfluencerProfile } from '@/hooks/useInfluencerProfile';
import { ProductDetails, InfluencerAddress } from '@/types/order';
import FloatingHeader from '@/components/ui/floating-header';
import Navbar from '@/components/navigation/Navbar';

export default function PlaceOrder() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useUser();
  const { toast } = useToast();
  const [navOpen, setNavOpen] = useState(false);
  
  const [selectedInfluencerId, setSelectedInfluencerId] = useState<string | null>(
    searchParams.get('influencer')
  );
  const [giftUrl, setGiftUrl] = useState(searchParams.get('gift') || '');
  const [message, setMessage] = useState(searchParams.get('message') || '');
  const [currentStep, setCurrentStep] = useState<'select' | 'preview' | 'payment'>('select');

  const { 
    productPreview, 
    setProductPreview, 
    isFetchingProduct, 
    fetchProgress, 
    isGeneratingPreview, 
    fetchProductPreview 
  } = useProductPreview();
  const { isLoading, paymentStep, orderError, submitOrder } = useOrderSubmission();
  const { influencer } = useInfluencerProfile(selectedInfluencerId || '');

  // Handle pre-filled data from GiftSelection or ShopView
  useEffect(() => {
    const giftName = searchParams.get('giftName');
    const giftPrice = searchParams.get('giftPrice');
    const giftImage = searchParams.get('giftImage');
    const giftId = searchParams.get('giftId');
    
    if (giftName && giftPrice && giftImage && (giftUrl || giftId)) {
      // Create ProductDetails from the provided data (shop product)
      const prefilledProduct: ProductDetails = {
        name: decodeURIComponent(giftName),
        price: `₹${giftPrice}`,
        priceInr: parseFloat(giftPrice),
        image: decodeURIComponent(giftImage),
        description: 'Selected gift item from shop',
        platformFee: 5.00
      };
      
      setProductPreview(prefilledProduct);
      setCurrentStep('preview');
    }
  }, [searchParams, giftUrl, setProductPreview]);

  useEffect(() => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to place an order",
        variant: "destructive"
      });
      navigate('/auth');
    }
  }, [user, navigate, toast]);

  const handleUrlSubmit = async () => {
    if (!giftUrl.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a product URL",
        variant: "destructive"
      });
      return;
    }

    try {
      await fetchProductPreview(giftUrl);
      setCurrentStep('preview');
    } catch (error) {
      console.error('Error fetching product preview:', error);
      toast({
        title: "Error",
        description: "Failed to fetch product details. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleProceedToPayment = () => {
    if (!selectedInfluencerId) {
      toast({
        title: "Influencer Required",
        description: "Please select an influencer",
        variant: "destructive"
      });
      return;
    }

    if (!productPreview) {
      toast({
        title: "Product Required",
        description: "Please add a product first",
        variant: "destructive"
      });
      return;
    }

    setCurrentStep('payment');
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedInfluencerId || !productPreview || !influencer) {
      toast({
        title: "Missing Information",
        description: "Please ensure all required fields are filled",
        variant: "destructive"
      });
      return;
    }

    // Create influencer address from profile
    const influencerAddress: InfluencerAddress = {
      id: crypto.randomUUID(),
      name: influencer.name,
      street_address: "123 Default Street",
      city: "Default City",
      state: "Default State", 
      postal_code: "000000",
      country: "India",
      phone: "1234567890",
      is_primary: true,
      influencer_id: selectedInfluencerId,
      created_at: new Date().toISOString()
    };

    // Use the actual gift URL if available, otherwise use a placeholder
    const orderUrl = giftUrl || searchParams.get('gift') || 'shop-product';

    await submitOrder(
      orderUrl,
      message,
      selectedInfluencerId,
      productPreview,
      influencerAddress
    );
  };

  if (paymentStep === 'complete') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <Gift className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Order Placed Successfully!</h2>
            <p className="text-gray-600 mb-4">
              Your gift order has been submitted and is being processed.
            </p>
            <Button onClick={() => navigate('/home')} className="w-full">
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if this is a shop product (has giftName, giftPrice, giftImage)
  const isShopProduct = searchParams.get('giftName') && searchParams.get('giftPrice') && searchParams.get('giftImage');

  return (
    <>
      <FloatingHeader setNavOpen={setNavOpen} />
      <Navbar isOpen={navOpen} setIsOpen={setNavOpen} />
      
      <div className="min-h-screen bg-background p-4 pt-20">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="text-funky-purple hover:bg-funky-purple/10"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-funky-purple to-funky-pink bg-clip-text text-transparent">
              Place Gift Order
            </h1>
          </div>

          {orderError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{orderError}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Order Details */}
            <div className="space-y-6">
              {/* Step 1: Product URL - Only show if not a shop product */}
              {!isShopProduct && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Gift className="mr-2 h-5 w-5" />
                      <span>Product Details</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ProductUrlInput
                      giftItem={giftUrl}
                      onUrlChange={setGiftUrl}
                      onPreviewClick={handleUrlSubmit}
                      isFetchingProduct={isFetchingProduct}
                      fetchProgress={fetchProgress}
                      isGeneratingPreview={isGeneratingPreview}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Step 2: Product Preview */}
              {productPreview && currentStep !== 'select' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Product Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ProductPreview 
                      productPreview={productPreview}
                      influencerAddress={null}
                      message={message}
                      onMessageChange={setMessage}
                      onSubmit={handleOrderSubmit}
                      isLoading={isLoading}
                      paymentStep={paymentStep}
                      giftUrl={giftUrl}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Step 3: Influencer Selection */}
              {currentStep !== 'select' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="mr-2 h-5 w-5" />
                      <span>Select Influencer</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <InfluencerSelector
                      onSelect={setSelectedInfluencerId}
                      selectedInfluencerId={selectedInfluencerId}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Step 4: Gift Message */}
              {currentStep !== 'select' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Gift Message</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <GiftMessage
                      onChange={setMessage}
                      defaultValue={message}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Proceed Button */}
              {currentStep === 'preview' && (
                <Button
                  onClick={handleProceedToPayment}
                  className="w-full bg-funky-purple hover:bg-funky-purple/90"
                  disabled={!selectedInfluencerId || !productPreview}
                >
                  Proceed to Payment
                </Button>
              )}
            </div>

            {/* Right Column - Payment */}
            {currentStep === 'payment' && productPreview && (
              <div className="lg:sticky lg:top-6">
                <PaymentForm
                  productPreview={productPreview}
                  isProcessing={isLoading}
                  paymentStep={paymentStep}
                  onSubmit={handleOrderSubmit}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
