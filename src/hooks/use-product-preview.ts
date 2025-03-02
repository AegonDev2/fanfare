
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProductDetails } from "@/types/order";
import { useToast } from "@/hooks/use-toast";

const DEFAULT_PRODUCT: ProductDetails = {
  name: "Enter a product URL to preview",
  description: "Product details will appear here once you enter a valid URL.",
  price: 0,
  priceInr: 0,
  platformFee: 5.00,
  image: "https://storage.googleapis.com/a1aa/image/tSbIqbP_qJMzV8bfuyM7gaSttRX2Pi5K-jl57IlWP44.jpg"
};

// Helper to fetch with retries and timeout
const fetchWithRetries = async (url: string, options: RequestInit = {}, maxRetries = 3, timeout = 30000) => {
  let attempt = 0;
  
  // Create an AbortController for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  const finalOptions = {
    ...options,
    signal: controller.signal,
    headers: {
      ...options.headers,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
  };

  while (attempt < maxRetries) {
    try {
      const response = await fetch(url, finalOptions);
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      attempt++;
      console.log(`Attempt ${attempt} failed:`, error);
      if (attempt >= maxRetries) {
        throw error;
      }
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
    }
  }
};

export const useProductPreview = () => {
  const { toast } = useToast();
  const [isFetchingProduct, setIsFetchingProduct] = useState(false);
  const [fetchProgress, setFetchProgress] = useState(0);
  const [productPreview, setProductPreview] = useState<ProductDetails>(DEFAULT_PRODUCT);

  const detectPlatform = (url: string): 'amazon' | 'flipkart' | undefined => {
    if (url.includes('amazon')) return 'amazon';
    if (url.includes('flipkart')) return 'flipkart';
    return undefined;
  };

  const extractFlipkartProductId = (url: string): string | null => {
    // Extract pid from URL
    const pidMatch = url.match(/pid=([^&]+)/);
    return pidMatch ? pidMatch[1] : null;
  };

  const handlePreviewProduct = async (giftItem: string) => {
    if (!giftItem) {
      toast({
        title: "Error",
        description: "Please enter a product URL",
        variant: "destructive",
      });
      return;
    }

    try {
      new URL(giftItem);
    } catch (e) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid product URL",
        variant: "destructive",
      });
      return;
    }

    setIsFetchingProduct(true);
    setFetchProgress(10);
    
    try {
      const platform = detectPlatform(giftItem);
      setFetchProgress(20);
      
      if (!platform) {
        throw new Error("Unsupported platform. Currently only Amazon and Flipkart are supported.");
      }

      // For debugging - Log detected platform
      console.log(`Detected platform: ${platform}, URL: ${giftItem}`);
      
      // Use direct backend function for reliable product extraction
      const { data, error } = await supabase.functions.invoke('fetch-product', {
        body: { 
          url: giftItem,
          platform: platform,
          productId: platform === 'flipkart' ? extractFlipkartProductId(giftItem) : null
        }
      });

      setFetchProgress(90);
      
      if (error) {
        console.error("Supabase function error:", error);
        throw new Error(`Failed to fetch product: ${error.message}`);
      }
      
      if (!data || !data.name) {
        console.error("Invalid product data received:", data);
        throw new Error('Invalid product data received');
      }

      console.log("Product data received:", data);
      
      // Ensure we have the necessary fields with proper defaults if missing
      const productData: ProductDetails = {
        name: data.name || "Unknown Product",
        description: data.description || "No description available",
        price: parseFloat(data.price) || 0,
        priceInr: parseFloat(data.priceInr || data.price) || 0,
        platformFee: 5.00,
        image: data.image || DEFAULT_PRODUCT.image,
        platform
      };
      
      setProductPreview(productData);
      setFetchProgress(100);

      toast({
        title: "Product fetched",
        description: "Product details have been updated",
      });
    } catch (error) {
      console.error("Error fetching product:", error);
      toast({
        title: "Error",
        description: `Failed to fetch product details: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setTimeout(() => {
        setIsFetchingProduct(false);
        setFetchProgress(0);
      }, 500);
    }
  };

  return {
    productPreview,
    isFetchingProduct,
    fetchProgress,
    handlePreviewProduct
  };
};
