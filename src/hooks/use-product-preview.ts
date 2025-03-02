
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
    setFetchProgress(0);
    
    try {
      const progressInterval = setInterval(() => {
        setFetchProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      // Use direct fetch-product function for reliable product extraction
      const { data, error } = await supabase.functions.invoke('fetch-product', {
        body: { url: giftItem }
      });

      clearInterval(progressInterval);
      setFetchProgress(100);
      
      if (error) {
        console.error("Supabase function error:", error);
        throw new Error(`Failed to fetch product: ${error.message}`);
      }
      
      if (!data || !data.name) {
        throw new Error('Invalid product data received');
      }

      console.log("Product data received:", data);
      
      // Ensure we have the necessary fields
      const platform = detectPlatform(giftItem);
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
