
import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { ProductDetails } from "@/types/order";
import { supabase } from "@/integrations/supabase/client";
import { ExtractedProduct } from "@/components/product/types/product";

const DEFAULT_PRODUCT: ProductDetails = {
  name: "Enter a product URL to preview",
  price: 0,
  priceInr: 0,
  platformFee: 5.00,
  image: "https://placehold.co/600x400?text=No+Image",
  id: ""
};

export const useProductPreview = () => {
  const { toast } = useToast();
  const [productPreview, setProductPreview] = useState<ProductDetails>(DEFAULT_PRODUCT);
  const [isFetchingProduct, setIsFetchingProduct] = useState(false);
  const [fetchProgress, setFetchProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const resetExtractionState = useCallback(() => {
    setError(null);
    setRetryCount(prev => prev + 1);
  }, []);

  const handlePreviewProduct = useCallback(async (url: string) => {
    if (!url) {
      toast({
        title: "URL Required",
        description: "Please enter a product URL",
        variant: "destructive",
      });
      return;
    }

    try {
      new URL(url);
    } catch (e) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL",
        variant: "destructive",
      });
      setError("Invalid URL format");
      return;
    }

    const platform = detectPlatform(url);
    if (!platform) {
      toast({
        title: "Unsupported Platform",
        description: "Currently only Amazon and Flipkart URLs are supported",
        variant: "destructive",
      });
      setError("Unsupported platform. Only Amazon and Flipkart are supported.");
      return;
    }

    setIsFetchingProduct(true);
    setFetchProgress(10);
    setError(null);

    try {
      const progressInterval = setInterval(() => {
        setFetchProgress(prev => {
          const increment = Math.floor(Math.random() * 5) + 2;
          const newValue = Math.min(prev + increment, 85);
          return newValue >= 85 ? 85 : newValue;
        });
      }, 800);

      const { data, error: functionError } = await supabase.functions.invoke("buildship-extraction", {
        body: { 
          url: url, 
          platform: platform,
          retryCount,
          timestamp: new Date().getTime()
        }
      });

      clearInterval(progressInterval);
      setFetchProgress(95);

      if (functionError) {
        throw new Error(functionError.message || "Failed to extract product details");
      }

      if (!data?.productData) {
        throw new Error("No product data returned");
      }

      console.log("Extraction result:", data);

      const extractedProduct = data.productData as ExtractedProduct;
      
      if (extractedProduct && extractedProduct.name) {
        const priceString = extractedProduct.price || '0';
        const priceNumber = parseFloat(priceString.replace(/[^\d.]/g, '')) || 0;
        
        // Store product preview data in Supabase
        try {
          const { error: insertError } = await supabase
            .from('product_preview_data')
            .insert({
              url: url,
              title: extractedProduct.name,
              price: priceNumber,
              platform: platform
            });

          if (insertError) {
            console.error("Error storing product preview:", insertError);
          }
        } catch (storageError) {
          console.error("Failed to store product preview data:", storageError);
        }
        
        const productDetails: ProductDetails = {
          name: extractedProduct.name,
          price: priceNumber,
          priceInr: priceNumber,
          platformFee: 5.00,
          image: "https://placehold.co/600x400?text=No+Image",
          platform: platform,
          id: url
        };

        setProductPreview(productDetails);
        setFetchProgress(100);
        
        toast({
          title: "Product Retrieved",
          description: "Product details have been fetched successfully"
        });
      } else {
        throw new Error("Failed to extract product details");
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      
      setError(errorMessage);
      
      if (errorMessage.includes("Failed to fetch") || errorMessage.includes("NetworkError")) {
        toast({
          title: "Network Error",
          description: "Could not connect to extraction service. Please check your internet connection and try again.",
          variant: "destructive",
        });
      } else if (errorMessage.includes("timeout")) {
        toast({
          title: "Extraction Timeout",
          description: "The extraction process took too long. Please try a different product URL.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error Fetching Product",
          description: "Could not extract product details. Please try a different product URL or try again later.",
          variant: "destructive",
        });
      }
    } finally {
      setIsFetchingProduct(false);
    }
  }, [toast, retryCount]);

  const detectPlatform = (url: string): 'amazon' | 'flipkart' | undefined => {
    if (url.includes('amazon')) return 'amazon';
    if (url.includes('flipkart')) return 'flipkart';
    return undefined;
  };

  return {
    productPreview,
    setProductPreview,
    isFetchingProduct,
    fetchProgress,
    handlePreviewProduct,
    error,
    retryCount,
    resetExtractionState
  };
};
