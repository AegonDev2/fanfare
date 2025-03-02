
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ShoppingCart } from "lucide-react";

interface ProductUrlInputProps {
  giftItem: string;
  onUrlChange: (url: string) => void;
  onPreviewClick: () => void;
  isFetchingProduct: boolean;
  fetchProgress: number;
}

const ProductUrlInput = ({
  giftItem,
  onUrlChange,
  onPreviewClick,
  isFetchingProduct,
  fetchProgress
}: ProductUrlInputProps) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onPreviewClick();
  };

  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Place Order
      </h2>
      <div className="bg-white p-4 rounded-lg shadow-md">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="productUrl" className="block text-sm font-medium text-gray-700 mb-1">
              Product URL from Amazon or Flipkart
            </label>
            <Input 
              id="productUrl"
              value={giftItem}
              onChange={(e) => onUrlChange(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg"
              placeholder="Paste Amazon or Flipkart product link here..."
              disabled={isFetchingProduct}
            />
          </div>
          <Button
            type="submit"
            onClick={onPreviewClick}
            disabled={isFetchingProduct || !giftItem}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 w-full sm:w-auto"
          >
            {isFetchingProduct ? (
              "Fetching..."
            ) : (
              <>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Preview Product
              </>
            )}
          </Button>
          
          {isFetchingProduct && (
            <div className="mt-4">
              <Progress value={fetchProgress} className="w-full h-2" />
              <p className="text-sm text-gray-500 mt-2">Fetching product details... {fetchProgress}%</p>
            </div>
          )}
        </form>
      </div>
    </section>
  );
};

export default ProductUrlInput;
