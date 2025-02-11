
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

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
  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Place Order
      </h2>
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="mb-4">
          <Input 
            value={giftItem}
            onChange={(e) => onUrlChange(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg"
            placeholder="Paste product link here..."
          />
        </div>
        <Button
          onClick={onPreviewClick}
          disabled={isFetchingProduct}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          {isFetchingProduct ? "Fetching..." : "Preview Product"}
        </Button>
        
        {isFetchingProduct && (
          <div className="mt-4">
            <Progress value={fetchProgress} className="w-full" />
            <p className="text-sm text-gray-500 mt-2">Fetching product details...</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductUrlInput;
