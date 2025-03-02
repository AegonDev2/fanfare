
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

  const renderFetchProgressStatus = () => {
    if (!isFetchingProduct) return null;
    
    let statusMessage = "Initializing...";
    let statusIcon = <Loader2 className="h-4 w-4 animate-spin" />;
    
    if (fetchProgress < 30) {
      statusMessage = "Connecting to product page...";
    } else if (fetchProgress < 60) {
      statusMessage = "Extracting product details...";
    } else if (fetchProgress < 90) {
      statusMessage = "Processing information...";
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
            <div className="relative">
              <Input 
                id="productUrl"
                value={giftItem}
                onChange={(e) => handleUrlChange(e.target.value)}
                className={`w-full p-2 border ${!isValid ? 'border-red-500' : 'border-gray-300'} rounded-lg pr-10`}
                placeholder="Paste Amazon or Flipkart product link here..."
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
          
          <div className="mb-4">
            <Alert className="bg-blue-50 border-blue-200">
              <AlertDescription className="text-sm text-blue-700">
                For best results, copy and paste complete product URLs from Amazon or Flipkart. 
                Try this example: 
                <br />
                <span className="text-xs mt-1 font-mono break-all">
                  https://www.flipkart.com/timex-automatic-black-dial-analog-watch-men/p/itm5d039dcaeb0c8?pid=WATGPGR7QCYTFHRG
                </span>
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
