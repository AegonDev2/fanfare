
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ShoppingCart, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  const [isValid, setIsValid] = useState(true);
  const [validationMessage, setValidationMessage] = useState("");
  
  const validateUrl = (url: string) => {
    // Basic validation
    if (!url) {
      setIsValid(true); // Empty is technically valid from a UI perspective
      setValidationMessage("");
      return;
    }
    
    try {
      const parsedUrl = new URL(url);
      const isAmazon = parsedUrl.hostname.includes("amazon");
      const isFlipkart = parsedUrl.hostname.includes("flipkart");
      
      if (!isAmazon && !isFlipkart) {
        setIsValid(false);
        setValidationMessage("Only Amazon and Flipkart URLs are supported");
        return;
      }
      
      setIsValid(true);
      setValidationMessage("");
    } catch (e) {
      setIsValid(false);
      setValidationMessage("Invalid URL format");
    }
  };
  
  const handleUrlChange = (url: string) => {
    onUrlChange(url);
    validateUrl(url);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!giftItem) {
      setIsValid(false);
      setValidationMessage("Please enter a product URL");
      return;
    }
    
    if (!isValid) {
      return;
    }
    
    onPreviewClick();
  };

  const getButtonPrompt = () => {
    if (isFetchingProduct) {
      return (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Fetching...
        </>
      );
    }
    
    return (
      <>
        <ShoppingCart className="h-4 w-4 mr-2" />
        Preview Product
      </>
    );
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
              onChange={(e) => handleUrlChange(e.target.value)}
              className={`w-full p-2 border ${!isValid ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
              placeholder="Paste Amazon or Flipkart product link here..."
              disabled={isFetchingProduct}
            />
            {!isValid && validationMessage && (
              <p className="text-red-500 text-sm mt-1">{validationMessage}</p>
            )}
          </div>
          
          <div className="mb-4">
            <Alert className="bg-blue-50 border-blue-200">
              <AlertDescription className="text-sm text-blue-700">
                For best results, use direct product URLs from Amazon or Flipkart. 
                Example: https://www.flipkart.com/product/p/[product-id]
              </AlertDescription>
            </Alert>
          </div>
          
          <Button
            type="submit"
            disabled={isFetchingProduct || !giftItem || !isValid}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 w-full sm:w-auto"
          >
            {getButtonPrompt()}
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
