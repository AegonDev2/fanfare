
import React, { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ProductDetails, InfluencerAddress } from "@/types/order";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Gift, CheckCircle2, Wallet, AlertCircle, Link as LinkIcon, Image } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ImageViewer from "@/components/common/ImageViewer";

interface ProductPreviewProps {
  productPreview: ProductDetails | null;
  influencerAddress: InfluencerAddress | null;
  message: string;
  onMessageChange: (message: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  paymentStep?: 'initial' | 'processing' | 'complete';
  giftUrl?: string;
  websitePreview?: string | null;
}

const ProductPreview = ({
  productPreview,
  influencerAddress,
  message,
  onMessageChange,
  onSubmit,
  isLoading,
  paymentStep = 'initial',
  giftUrl = '',
  websitePreview = null
}: ProductPreviewProps) => {
  const isPreviewAvailable = productPreview && productPreview.name !== "Enter a product URL to preview";
  const hasProcessedUrl = isPreviewAvailable || giftUrl.trim() !== '';

  // Only show tabs if product preview is available AND user has processed product
  const [activeTab, setActiveTab] = useState<string>(isPreviewAvailable ? "product" : "message");

  // Track if product has been processed
  const [productProcessed, setProductProcessed] = useState<boolean>(isPreviewAvailable);

  // Update when product preview changes
  useEffect(() => {
    if (isPreviewAvailable) {
      setProductProcessed(true);
    }
  }, [isPreviewAvailable]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === "message" || !isPreviewAvailable) {
      onSubmit(e);
    } else {
      setActiveTab("message");
    }
  };

  if (paymentStep === 'complete') {
    return <div className="bg-white p-6 shadow-md rounded-lg mt-8 max-w-md mx-auto">
        <div className="flex flex-col items-center text-center">
          <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
          <h3 className="text-lg font-semibold">Request Submitted</h3>
          <p className="text-sm text-gray-500 mt-2">
            Your gift request has been submitted successfully. The influencer will be notified.
          </p>
        </div>
      </div>;
  }

  // Don't show anything until product has been processed
  if (!hasProcessedUrl) {
    return null;
  }

  // Calculate total even when no valid preview exists
  const defaultPrice = 0;
  const defaultPlatformFee = 5.00;
  const productPrice = isPreviewAvailable ? productPreview.priceInr : defaultPrice;
  const platformFee = isPreviewAvailable ? productPreview.platformFee : defaultPlatformFee;
  const totalAmount = productPrice + platformFee;

  // Website preview component with improved image handling
  const WebsitePreviewComponent = () => {
    console.log("Rendering website preview with:", websitePreview ? "image data available" : "no image data");
    
    return <div className="mb-4 border rounded-md overflow-hidden">
      <div className="bg-gray-100 p-2 border-b flex justify-between items-center">
        <div className="flex items-center">
          <Image className="h-4 w-4 mr-2 text-gray-500" />
          <span className="text-sm font-medium text-gray-600">Website Preview</span>
        </div>
        {giftUrl && (
          <a
            href={giftUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-500 hover:text-blue-700 flex items-center"
          >
            View Site <LinkIcon className="h-3 w-3 ml-1" />
          </a>
        )}
      </div>
      
      <div className="aspect-video relative bg-gray-50">
        {websitePreview && websitePreview.startsWith('data:image/') ? (
          <ImageViewer 
            imageUrl={websitePreview} 
            alt="Website preview" 
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-gray-400">
              {websitePreview ? 'Invalid preview data' : 'Preview not available'}
            </p>
          </div>
        )}
      </div>
    </div>;
  };

  // Simplified view when no product preview is available
  if (!isPreviewAvailable) {
    return <div className="mt-8">
        <div className="bg-white p-6 shadow-md rounded-lg">
          <h3 className="text-lg font-medium mb-4">Gift Request</h3>
          
          <Alert className="mb-6 bg-amber-50 border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <AlertDescription className="text-amber-800">
              You're sending a gift using only the provided URL. The influencer will review this request before accepting.
            </AlertDescription>
          </Alert>
          
          <WebsitePreviewComponent />
          
          <div className="bg-gray-50 p-4 rounded-md mb-4">
            <h4 className="font-medium mb-2 flex items-center">
              <LinkIcon className="h-4 w-4 mr-2 text-funky-purple" />
              Product URL
            </h4>
            <p className="text-sm text-gray-600 break-all">{giftUrl}</p>
          </div>
          
          <div className="mb-6">
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
              Add a Personal Message
            </label>
            <Textarea id="message" placeholder="Write a personal message to the influencer..." value={message} onChange={e => onMessageChange(e.target.value)} rows={6} disabled={isLoading} className="mb-4 bg-slate-50" />
          </div>
          
          <div className="p-4 rounded-md mb-6 bg-stone-900">
            <div className="flex items-center mb-4">
              <Wallet className="h-5 w-5 mr-2 text-primary" />
              <span className="font-semibold">Payment Summary</span>
            </div>
            
            <div className="flex justify-between mb-2 text-sm">
              <span>Platform Fee</span>
              <span>₹{platformFee.toFixed(2)}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between font-semibold">
              <span>Total Amount</span>
              <span>₹{platformFee.toFixed(2)}</span>
            </div>
          </div>
          
          <Button onClick={handleSubmit} className="w-full bg-gradient-to-r from-funky-purple to-funky-pink hover:from-funky-pink hover:to-funky-purple transition-all" disabled={isLoading}>
            {isLoading ? "Processing..." : "Submit Gift Request"}
          </Button>
        </div>
      </div>;
  }

  // Original tabbed view for when product preview is available
  return <div className="mt-8">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="product" disabled={isLoading}>
            <ShoppingCart className="h-4 w-4 mr-2" />
            Product Details
          </TabsTrigger>
          <TabsTrigger value="message" disabled={isLoading}>
            <Gift className="h-4 w-4 mr-2" />
            Gift Message
          </TabsTrigger>
        </TabsList>

        <TabsContent value="product" className="mt-4">
          <div className="bg-white p-6 shadow-md rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                {isPreviewAvailable && productPreview?.image && !productPreview.image.startsWith("https://placehold.co") ? (
                  <ImageViewer 
                    imageUrl={productPreview.image} 
                    alt={productPreview.name} 
                  />
                ) : (
                  <WebsitePreviewComponent />
                )}
              </div>
              <div className="flex flex-col justify-between">
                <div>
                  <h2 className="text-xl font-semibold mb-4">{productPreview?.name}</h2>
                  
                  <div className="p-4 rounded-md mb-4 bg-slate-50">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Price:</span>
                      <span className="font-semibold text-neutral-950">₹{productPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Platform Fee:</span>
                      <span className="text-zinc-950">₹{platformFee.toFixed(2)}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between">
                      <span className="text-gray-800 font-semibold">Total:</span>
                      <span className="font-semibold text-zinc-950">
                        ₹{totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-md mb-4">
                  <p className="text-gray-600 text-sm">
                    Your gift will be sent directly to the influencer's verified shipping address.
                    The shipping address is kept private for security reasons.
                  </p>
                </div>

                <Button onClick={() => setActiveTab("message")} className="w-full mt-4" disabled={isLoading}>
                  Next: Add a Message
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="message" className="mt-4">
          <div className="bg-white p-6 shadow-md rounded-lg">
            <h3 className="text-lg font-medium mb-4 text-slate-950">Add a Personal Message</h3>
            <Textarea placeholder="Write a personal message to the influencer..." value={message} onChange={e => onMessageChange(e.target.value)} rows={6} disabled={isLoading} className="mb-6 bg-slate-50" />
            
            <div className="p-4 rounded-md mb-6 bg-stone-900">
              <div className="flex items-center mb-4">
                <Wallet className="h-5 w-5 mr-2 text-primary" />
                <span className="font-semibold">Payment via Wallet</span>
              </div>
              
              <div className="flex justify-between mb-2 text-sm">
                <span>Subtotal</span>
                <span>₹{productPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2 text-sm">
                <span>Platform Fee</span>
                <span>₹{platformFee.toFixed(2)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-semibold">
                <span>Total Amount</span>
                <span>₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={() => setActiveTab("product")} variant="outline" className="w-full sm:w-1/2" disabled={isLoading}>
                Back to Product Details
              </Button>
              <Button onClick={handleSubmit} className="w-full sm:w-1/2" disabled={isLoading}>
                {isLoading ? "Processing..." : "Submit Gift Request"}
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>;
};

export default ProductPreview;
