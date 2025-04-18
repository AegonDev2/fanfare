import { useState, useCallback } from "react";
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
  const resetExtractionState = useCallback(() => {
    setError(null);
    setRetryCount(prev => prev + 1);
  }, []);

  // Function to handle product previewing from URL
  const handlePreviewProduct = useCallback(async (url: string) => {
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
          const increment = Math.floor(Math.random() * 5) + 2;
          const newValue = Math.min(prev + increment, 85);
          return newValue >= 85 ? 85 : newValue;
        });
      }, 800);

      console.log("Calling buildship extraction service with URL:", url);
      
      toast({
        title: "Starting Extraction",
        description: "Extracting product details. This may take up to 30 seconds...",
      });
      
      // Add a simplified URL version to potentially improve scraping success
      const simplifiedUrl = simplifyUrl(url);
      console.log("Simplified URL for extraction:", simplifiedUrl);
      
      // Call Supabase function to extract product data
      const { data, error: functionError } = await supabase.functions.invoke("buildship-extraction", {
        body: { 
          url: simplifiedUrl || url, 
          platform: detectPlatform(url),
          retryCount,
          timestamp: new Date().getTime()
        },
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      clearInterval(progressInterval);
      setFetchProgress(95);

      if (functionError) {
        console.error("Error invoking function:", functionError);
        throw new Error(functionError.message || "Failed to extract product details");
      }

      if (!data?.productData) {
        throw new Error("No product data returned");
      }

      console.log("Extraction result:", data);

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
          platform: extractedProduct.platform,
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

  // Helper function to detect platform from URL
  const detectPlatform = (url: string): 'amazon' | 'flipkart' | undefined => {
    if (url.includes('amazon')) return 'amazon';
    if (url.includes('flipkart')) return 'flipkart';
    return undefined;
  };
  
  // Helper function to simplify complex URLs by removing tracking parameters
  const simplifyUrl = (url: string): string | null => {
    try {
      const parsedUrl = new URL(url);
      
      if (parsedUrl.hostname.includes('amazon')) {
        // For Amazon, keep only the domain, path and dp parameter which has the product ID
        const productIdMatch = parsedUrl.pathname.match(/\/dp\/([A-Z0-9]{10})/i);
        if (productIdMatch && productIdMatch[1]) {
          return `https://${parsedUrl.hostname}/dp/${productIdMatch[1]}`;
        }
        
        // If we couldn't extract from path, try from query params
        const asinParam = parsedUrl.searchParams.get('ASIN') || parsedUrl.searchParams.get('asin');
        if (asinParam) {
          return `https://${parsedUrl.hostname}/dp/${asinParam}`;
        }
      } 
      else if (parsedUrl.hostname.includes('flipkart')) {
        // For Flipkart, keep the domain, path and pid parameter
        const pidParam = parsedUrl.searchParams.get('pid');
        if (pidParam && parsedUrl.pathname.includes('/p/')) {
          const mainPath = parsedUrl.pathname.split('?')[0];
          return `https://${parsedUrl.hostname}${mainPath}?pid=${pidParam}`;
        }
      }
      
      return null; // Couldn't simplify, use original URL
    } catch (e) {
      console.error("Error simplifying URL:", e);
      return null; // On error, use original URL
    }
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
