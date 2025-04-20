import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ShoppingCart, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
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
    if (!url) {
      setIsValid(true);
      setValidationMessage("");
      return;
    }
    
    try {
      new URL(url);
      setIsValid(true);
      setValidationMessage("");
    } catch (e) {
      setIsValid(false);
      setValidationMessage("Please enter a valid URL");
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
          Fetching Product...
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

  const renderFetchProgressStatus = () => {
    if (!isFetchingProduct) return null;
    
    let statusMessage = "Initializing...";
    let statusIcon = <Loader2 className="h-4 w-4 animate-spin" />;
    
    if (fetchProgress < 20) {
      statusMessage = "Connecting to product page...";
    } else if (fetchProgress < 40) {
      statusMessage = "Loading product data...";
    } else if (fetchProgress < 60) {
      statusMessage = "Extracting product details...";
    } else if (fetchProgress < 80) {
      statusMessage = "Processing information...";
    } else if (fetchProgress < 95) {
      statusMessage = "Almost there...";
    } else {
      statusMessage = "Finalizing...";
      statusIcon = <CheckCircle2 className="h-4 w-4 text-green-500" />;
    }
    
    return (
      <div className="flex items-center mt-2">
        {statusIcon}
        <span className="ml-2 text-sm text-gray-600">{statusMessage}</span>
      </div>
    );
  };

  const recommendations = [
    "https://www.flipkart.com/fastrack-optimus-pro-1-43-amoled-display-aod-466x466-functional-crown-bt-calling-smartwatch/p/itma4744c9053b72?pid=SMWGV3ZY9YJYEYEC",
    "https://amzn.in/d/2pPwjuQ",
    "https://www.myntra.com/watches/fastrack/fastrack-unisex-black-digital-watch-38045pp02/14599416/buy"
  ];

  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Place Order
      </h2>
      <div className="bg-white p-4 rounded-lg shadow-md">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="productUrl" className="block text-sm font-medium text-gray-700 mb-1">
              Product URL
            </label>
            <div className="relative">
              <Input 
                id="productUrl"
                value={giftItem}
                onChange={(e) => handleUrlChange(e.target.value)}
                className={`w-full p-2 border ${!isValid ? 'border-red-500' : 'border-gray-300'} rounded-lg pr-10`}
                placeholder="Paste any product URL here..."
                disabled={isFetchingProduct}
              />
              {!isValid && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                </div>
              )}
            </div>
            {!isValid && validationMessage && (
              <p className="text-red-500 text-sm mt-1">{validationMessage}</p>
            )}
          </div>
          
          <div className="mb-6">
            <Alert className="bg-blue-50 border-blue-200">
              <AlertDescription className="text-sm text-blue-700">
                <span className="font-bold">Tips for best results:</span>
                <ul className="mt-1 ml-4 list-disc">
                  <li>Use complete product URLs for best results</li>
                  <li>Make sure the URL includes the product ID or reference</li>
                  <li>Try one of our example URLs for testing</li>
                </ul>
                <div className="mt-2">
                  <p className="font-semibold text-xs">Recommended test URLs:</p>
                  <div className="mt-1 flex flex-col gap-1">
                    {recommendations.map((url, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleUrlChange(url)}
                        className="text-xs px-2 py-1 bg-white hover:bg-blue-50 border border-blue-100 rounded truncate text-left"
                        disabled={isFetchingProduct}
                      >
                        {url.length > 60 ? url.substring(0, 60) + '...' : url}
                      </button>
                    ))}
                  </div>
                </div>
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
              <div className="flex justify-between mt-1">
                <p className="text-sm text-gray-500">Fetching product details...</p>
                <p className="text-sm font-medium">{fetchProgress}%</p>
              </div>
              {renderFetchProgressStatus()}
            </div>
          )}
        </form>
      </div>
    </section>
  );
};

export default ProductUrlInput;
