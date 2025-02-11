
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

      const { data, error } = await supabase.functions.invoke('fetch-product', {
        body: { url: giftItem }
      });

      if (error) throw error;

      clearInterval(progressInterval);
      setFetchProgress(100);
      
      if (!data.name || !data.priceInr) {
        throw new Error('Invalid product data received');
      }

      setProductPreview({
        ...data,
        platformFee: 5.00
      });

      toast({
        title: "Product fetched",
        description: "Product details have been updated",
      });
    } catch (error) {
      console.error("Error fetching product:", error);
      toast({
        title: "Error",
        description: "Failed to fetch product details. Please check the URL and try again.",
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
