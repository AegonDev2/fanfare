
import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ProductDetails, InfluencerAddress } from "@/types/order";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Gift } from "lucide-react";
import PaymentForm from "@/components/payment/PaymentForm";

interface ProductPreviewProps {
  productPreview: ProductDetails;
  influencerAddress: InfluencerAddress | null;
  message: string;
  onMessageChange: (message: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  paymentStep?: 'initial' | 'processing' | 'complete';
}

const ProductPreview = ({
  productPreview,
  influencerAddress,
  message,
  onMessageChange,
  onSubmit,
  isLoading,
  paymentStep = 'initial',
}: ProductPreviewProps) => {
  const [activeTab, setActiveTab] = useState<string>("product");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === "payment") {
      onSubmit(e);
    } else {
      setActiveTab("payment");
    }
  };

  return (
    <div className="mt-8">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="product" disabled={isLoading}>
            <ShoppingCart className="h-4 w-4 mr-2" />
            Product Details
          </TabsTrigger>
          <TabsTrigger value="payment" disabled={isLoading}>
            <Gift className="h-4 w-4 mr-2" />
            Payment & Message
          </TabsTrigger>
        </TabsList>

        <TabsContent value="product" className="mt-4">
          <div className="bg-white p-6 shadow-md rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <img
                  src={productPreview.image}
                  alt={productPreview.name}
                  className="w-full h-auto rounded-md object-contain"
                  style={{ maxHeight: "300px" }}
                />
              </div>
              <div className="flex flex-col justify-between">
                <div>
                  <h2 className="text-xl font-semibold mb-2">{productPreview.name}</h2>
                  <p className="text-gray-700 mb-4 text-sm">
                    {productPreview.description}
                  </p>
                  <div className="bg-gray-50 p-4 rounded-md mb-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Price:</span>
                      <span className="font-semibold">₹{productPreview.priceInr.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Platform Fee:</span>
                      <span>₹{productPreview.platformFee.toFixed(2)}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between">
                      <span className="text-gray-800 font-semibold">Total:</span>
                      <span className="text-primary font-semibold">
                        ₹{(productPreview.priceInr + productPreview.platformFee).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Shipping address section removed to maintain privacy */}
                
                <div className="bg-gray-50 p-4 rounded-md mb-4">
                  <p className="text-gray-600 text-sm">
                    Your gift will be sent directly to the influencer's verified shipping address.
                    The shipping address is kept private for security reasons.
                  </p>
                </div>

                <Button
                  onClick={() => setActiveTab("payment")}
                  className="w-full mt-4"
                  disabled={isLoading}
                >
                  Proceed to Payment
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="payment" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 shadow-md rounded-lg">
              <h3 className="text-lg font-medium mb-4">Add a Personal Message</h3>
              <Textarea
                placeholder="Write a personal message to the influencer..."
                value={message}
                onChange={(e) => onMessageChange(e.target.value)}
                rows={6}
                className="mb-4"
                disabled={isLoading}
              />
              <Button
                onClick={() => setActiveTab("product")}
                variant="outline"
                className="w-full"
                disabled={isLoading}
              >
                Back to Product Details
              </Button>
            </div>

            <div>
              <PaymentForm
                productPreview={productPreview}
                isProcessing={isLoading}
                paymentStep={paymentStep}
                onSubmit={handleSubmit}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductPreview;
