
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { ProductDetails } from "@/types/order";
import { supabase } from "@/integrations/supabase/client";
import { ExtractedProduct } from "@/components/product/types/product";

// Default product details
const DEFAULT_PRODUCT: ProductDetails = {
  name: "Enter a product URL to preview",
  description: "Product details will appear here once you enter a valid URL.",
  price: 0,
  priceInr: 0,
  platformFee: 5.00,
  image: "https://storage.googleapis.com/a1aa/image/tSbIqbP_qJMzV8bfuyM7gaSttRX2Pi5K-jl57IlWP44.jpg",
  id: ""
};

export const useProductPreview = () => {
  const { toast } = useToast();
  const [productPreview, setProductPreview] = useState<ProductDetails>(DEFAULT_PRODUCT);
  const [isFetchingProduct, setIsFetchingProduct] = useState(false);
  const [fetchProgress, setFetchProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Reset all extraction state
  const resetExtractionState = () => {
    setError(null);
    setRetryCount(prev => prev + 1);
  };

  // Function to handle product previewing from URL
  const handlePreviewProduct = async (url: string) => {
    if (!url) {
      toast({
        title: "URL Required",
        description: "Please enter a product URL",
        variant: "destructive",
      });
      return;
    }

    // Validate URL format
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

    // Check if URL is from supported platform
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
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setFetchProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 5;
        });
      }, 500);

      // Call Supabase function to extract product data
      const { data, error } = await supabase.functions.invoke("axiom-product-extraction", {
        body: { url, platform, retryCount }
      });

      clearInterval(progressInterval);

      if (error) {
        throw new Error(error.message || "Failed to extract product details");
      }

      if (!data?.productData) {
        throw new Error("No product data returned");
      }

      // Extract product data
      const extractedProduct = data.productData as ExtractedProduct;
      
      // Convert to product details
      if (extractedProduct && extractedProduct.name) {
        const priceString = extractedProduct.price || '0';
        const priceNumber = parseFloat(priceString.replace(/[^\d.]/g, '')) || 0;
        
        const productDetails: ProductDetails = {
          name: extractedProduct.name,
          description: extractedProduct.description || "No description available",
          price: priceNumber,
          priceInr: priceNumber,
          platformFee: 5.00,
          image: extractedProduct.image || "https://placehold.co/600x400?text=No+Image",
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
        throw new Error("Failed to extract product name");
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      
      setError(errorMessage);
      
      toast({
        title: "Error Fetching Product",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsFetchingProduct(false);
    }
  };

  // Helper function to detect platform from URL
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
