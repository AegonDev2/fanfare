
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ExternalLink, AlertTriangle, RefreshCw } from "lucide-react";
import { ProductDetails } from "@/types/order";
import { useProductPreview } from "@/hooks/use-product-preview";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

interface ExtractedProduct {
  name: string | null;
  price: string | null;
  image: string | null;
  description: string | null;
}

interface WebAutomationProps {
  onProductExtracted?: (productData: ProductDetails) => void;
}

export const WebAutomation = ({ onProductExtracted }: WebAutomationProps) => {
  const { toast } = useToast();
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [productData, setProductData] = useState<ExtractedProduct | null>(null);
  const [extractionProgress, setExtractionProgress] = useState(0);
  const { productPreview, setProductPreview, error: productPreviewError, retryCount, resetExtractionState } = useProductPreview();

  // Periodically update progress during extraction
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isLoading) {
      setExtractionProgress(10); // Initial progress
      
      interval = setInterval(() => {
        setExtractionProgress(prev => {
          // Slowly increase progress up to 90% while we wait
          // The last 10% will be set when we receive data
          if (prev < 90) {
            return prev + 5;
          }
          return prev;
        });
      }, 1000);
    } else {
      // Reset progress when not loading
      setExtractionProgress(0);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoading]);

  const detectPlatform = (url: string): 'amazon' | 'flipkart' | undefined => {
    if (url.includes('amazon')) return 'amazon';
    if (url.includes('flipkart')) return 'flipkart';
    return undefined;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) {
      toast({
        title: "URL Required",
        description: "Please enter a product URL to extract data",
        variant: "destructive",
      });
      return;
    }

    // Validate URL
    try {
      new URL(url);
    } catch (e) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid product URL",
        variant: "destructive",
      });
      return;
    }

    // Check if URL is from supported platform
    const platform = detectPlatform(url);
    if (!platform) {
      toast({
        title: "Unsupported Platform",
        description: "Currently only Amazon and Flipkart URLs are supported",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setProductData(null);
    
    try {
      console.log("Calling Axiom AI extraction service with URL:", url);
      
      // Notify user about extraction process
      toast({
        title: "Starting Extraction",
        description: "Using Axiom AI to extract product details. This may take up to 20 seconds...",
      });
      
      // Call the Supabase edge function with improved error handling
      const { data, error } = await supabase.functions.invoke("axiom-product-extraction", {
        body: { 
          url, 
          retryCount,
          platform
        },
      });

      if (error) {
        console.error("Extraction service error:", error);
        throw new Error(error.message || "Failed to call extraction service");
      }

      console.log("Extraction result:", data);

      if (data && data.success && data.productData) {
        setExtractionProgress(100);
        setProductData(data.productData);
        
        // Convert extracted data to ProductDetails format for the product preview
        if (data.productData.name) {
          const priceString = data.productData.price || "0";
          const priceNumber = parseFloat(priceString.replace(/[^\d.]/g, "")) || 0;
          
          const newProductDetails: ProductDetails = {
            name: data.productData.name,
            description: data.productData.description || "No description available",
            price: priceNumber,
            priceInr: priceNumber,
            platformFee: 5.00,
            image: data.productData.image || "https://placehold.co/600x400?text=No+Image",
            platform: platform,
            id: url,
          };
          
          // Update the global product preview state
          setProductPreview(newProductDetails);
          
          // Call the onProductExtracted callback if provided
          if (onProductExtracted) {
            onProductExtracted(newProductDetails);
          }
          
          toast({
            title: "Data Extracted",
            description: "Successfully extracted product information",
          });
        } else {
          throw new Error("Product data incomplete");
        }
      } else if (data && !data.success) {
        throw new Error(data.error || "Failed to extract product data");
      } else {
        throw new Error("Invalid response format from extraction service");
      }
    } catch (error) {
      console.error("Error in product extraction:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      
      // Show different toast based on error type
      if (errorMessage.includes("429") || errorMessage.includes("rate limit")) {
        toast({
          title: "Service Limit Reached",
          description: "The extraction service is temporarily unavailable due to rate limiting. Please try again later.",
          variant: "destructive",
        });
      } else if (errorMessage.includes("blocked") || errorMessage.includes("403")) {
        toast({
          title: "Service Blocked",
          description: "The extraction service is being blocked by the website. Please try a different product URL.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Extraction Failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
      
      // Don't set fake data, leave product as null
      setProductData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    resetExtractionState();
    handleSubmit(new Event('submit') as any);
  };

  // Function to render current extraction status
  const renderExtractionStatus = () => {
    if (!isLoading) return null;
    
    let statusMessage = "Connecting to Axiom AI...";
    
    if (extractionProgress > 10) statusMessage = "Analyzing product URL...";
    if (extractionProgress > 30) statusMessage = "Extracting product details...";
    if (extractionProgress > 50) statusMessage = "Processing data...";
    if (extractionProgress > 70) statusMessage = "Validating information...";
    if (extractionProgress > 90) statusMessage = "Finalizing...";
    
    return (
      <div className="mt-2 text-sm text-gray-600">
        {statusMessage}
      </div>
    );
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Product Extraction with Axiom AI</CardTitle>
        <CardDescription>
          Extract product details using our advanced AI service
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col space-y-2">
            <label htmlFor="url" className="text-sm font-medium">
              Product URL
            </label>
            <div className="flex space-x-2">
              <Input
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.amazon.com/product-page or https://www.flipkart.com/product-page"
                className="flex-1"
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Extracting...
                  </>
                ) : (
                  "Extract Data"
                )}
              </Button>
            </div>
            {productPreviewError && (
              <div className="mt-2">
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  <AlertDescription className="text-sm">{productPreviewError}</AlertDescription>
                </Alert>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRetry}
                  className="mt-2"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry Extraction
                </Button>
              </div>
            )}
          </div>
          
          <Alert className="bg-blue-50 border-blue-200">
            <AlertDescription className="text-sm text-blue-700">
              Try this example: 
              <span className="text-xs mt-1 block font-mono break-all">
                https://www.flipkart.com/timex-automatic-black-dial-analog-watch-men/p/itm5d039dcaeb0c8?pid=WATGPGR7QCYTFHRG
              </span>
            </AlertDescription>
          </Alert>
        </form>

        {isLoading && (
          <div className="mt-6">
            <Progress value={extractionProgress} className="h-2" />
            <div className="flex justify-between mt-1">
              <div className="text-center">
                <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                {renderExtractionStatus()}
              </div>
              <p className="text-sm font-medium">{extractionProgress}%</p>
            </div>
          </div>
        )}

        {productData && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Extracted Product Information</h3>
            <Separator className="my-2" />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              {productData.image && (
                <div className="md:col-span-1">
                  <img 
                    src={productData.image} 
                    alt={productData.name || "Product"} 
                    className="w-full h-auto object-contain rounded-md"
                    style={{ maxHeight: "200px" }}
                  />
                </div>
              )}
              
              <div className={`${productData.image ? 'md:col-span-2' : 'md:col-span-3'} space-y-3`}>
                {productData.name && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Product Name</h4>
                    <p className="text-lg font-semibold">{productData.name}</p>
                  </div>
                )}
                
                {productData.price && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Price</h4>
                    <p className="text-xl font-bold text-primary">{productData.price}</p>
                  </div>
                )}
                
                {productData.description && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Description</h4>
                    <p className="text-sm text-gray-700">{productData.description}</p>
                  </div>
                )}
                
                <div className="pt-4">
                  <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline inline-flex items-center text-sm">
                    <ExternalLink className="h-4 w-4 mr-1" />
                    View original product page
                  </a>
                </div>
              </div>
            </div>
            
            {productData.name && (
              <div className="mt-6">
                <Button 
                  onClick={() => {
                    if (onProductExtracted && productPreview) {
                      onProductExtracted(productPreview);
                    }
                    toast({
                      title: "Product Selected",
                      description: "The product has been added to your order",
                    });
                  }} 
                  className="w-full"
                >
                  Use This Product
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WebAutomation;
