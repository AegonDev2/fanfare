import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { ProductDetails } from "@/types/order";
import { useProductPreview } from "@/hooks/use-product-preview";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ProductUrlForm } from "./automation/ProductUrlForm";
import { ExtractionProgress } from "./automation/ExtractionProgress";
import { ExtractedProductInfo } from "./automation/ExtractedProductInfo";
import { ExtractedProduct } from "./types/product";
import { Button } from "@/components/ui/button";

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

  // Progress updating effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isLoading) {
      setExtractionProgress(10);
      interval = setInterval(() => {
        setExtractionProgress(prev => prev < 90 ? prev + 5 : prev);
      }, 1000);
    } else {
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

  const handleSubmit = async (submittedUrl: string) => {
    setUrl(submittedUrl);
    if (!submittedUrl) {
      toast({
        title: "URL Required",
        description: "Please enter a product URL to extract data",
        variant: "destructive",
      });
      return;
    }

    try {
      new URL(submittedUrl);
    } catch (e) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid product URL",
        variant: "destructive",
      });
      return;
    }

    const platform = detectPlatform(submittedUrl);
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
      console.log("Calling Axiom AI extraction service with URL:", submittedUrl);
      
      toast({
        title: "Starting Extraction",
        description: "Using Axiom AI to extract product details. This may take up to 20 seconds...",
      });
      
      const { data, error } = await supabase.functions.invoke("axiom-product-extraction", {
        body: { url: submittedUrl, retryCount, platform },
      });

      if (error) throw new Error(error.message || "Failed to call extraction service");

      console.log("Extraction result:", data);

      if (data?.success && data?.productData) {
        setExtractionProgress(100);
        setProductData(data.productData);
        
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
            id: submittedUrl,
          };
          
          setProductPreview(newProductDetails);
          
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
      } else {
        throw new Error(data?.error || "Failed to extract product data");
      }
    } catch (error) {
      console.error("Error in product extraction:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      
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
      
      setProductData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusMessage = () => {
    if (!isLoading) return "";
    
    if (extractionProgress <= 10) return "Connecting to Axiom AI...";
    if (extractionProgress <= 30) return "Analyzing product URL...";
    if (extractionProgress <= 50) return "Extracting product details...";
    if (extractionProgress <= 70) return "Processing data...";
    if (extractionProgress <= 90) return "Validating information...";
    return "Finalizing...";
  };

  const handleRetry = () => {
    resetExtractionState();
    handleSubmit(url);
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
        <ProductUrlForm onSubmit={handleSubmit} isLoading={isLoading} />

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

        {isLoading && (
          <ExtractionProgress 
            progress={extractionProgress}
            statusMessage={getStatusMessage()}
          />
        )}

        {productData && (
          <ExtractedProductInfo 
            productData={productData}
            url={url}
            onUseProduct={(product) => {
              if (onProductExtracted) {
                onProductExtracted(product);
              }
            }}
            productPreview={productPreview}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default WebAutomation;
