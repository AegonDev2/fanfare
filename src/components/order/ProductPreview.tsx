
import { ProductDetails, InfluencerAddress } from "@/types/order";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ProductPreviewProps {
  productPreview: ProductDetails;
  influencerAddress: InfluencerAddress | null;
  message: string;
  onMessageChange: (message: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

const ProductPreview = ({
  productPreview,
  influencerAddress,
  message,
  onMessageChange,
  onSubmit,
  isLoading
}: ProductPreviewProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Order Summary
      </h2>
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-1/3">
            <img
              src={productPreview.image}
              alt={productPreview.name}
              className="w-full h-64 object-contain rounded-lg"
            />
          </div>
          <div className="md:ml-6 mt-4 md:mt-0 md:w-2/3">
            <h3 className="text-lg font-semibold text-gray-800">
              {productPreview.name}
            </h3>
            <div className="mt-2 text-gray-600 whitespace-pre-line">
              {productPreview.description}
            </div>
            <div className="mt-4 space-y-2">
              {productPreview.hasDiscount && productPreview.originalPrice && (
                <p className="text-gray-500 line-through">
                  Original Price: {formatPrice(productPreview.originalPrice)}
                </p>
              )}
              <p className="text-gray-800 font-semibold">
                Price: {formatPrice(productPreview.priceInr)}
              </p>
              <p className="text-gray-600">
                Platform Fee: {formatPrice(productPreview.platformFee * 83)}
              </p>
              <p className="text-lg text-gray-800 font-bold mt-2">
                Total: {formatPrice(productPreview.priceInr + (productPreview.platformFee * 83))}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                * Amount will be deducted immediately and refunded if the request is rejected
              </p>
            </div>

            {influencerAddress && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-sm text-gray-700">Shipping Address</h4>
                <p className="text-sm text-gray-600">Verified ✓</p>
              </div>
            )}

            {!influencerAddress && (
              <div className="mt-4 p-3 bg-red-50 rounded-lg">
                <p className="text-sm text-red-600">
                  Shipping address not available. The influencer needs to set up their address.
                </p>
              </div>
            )}
          </div>
        </div>
        
        <form onSubmit={onSubmit} className="mt-6">
          <div className="mt-4">
            <label className="block text-gray-700 font-semibold mb-2" htmlFor="message">
              Custom Message
            </label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => onMessageChange(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg"
              placeholder="Write a custom message for the influencer..."
              rows={4}
            />
          </div>
          
          <Button
            type="submit"
            disabled={isLoading || !influencerAddress}
            className="mt-4 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
          >
            {isLoading ? "Sending Request..." : "Send Gift Request"}
          </Button>
        </form>
      </div>
    </section>
  );
};

export default ProductPreview;
