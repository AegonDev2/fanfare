import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProductDetails } from "@/types/order";

export const useProductPreview = () => {
  const [productPreview, setProductPreview] = useState<ProductDetails | null>(null);
  const [isFetchingProduct, setIsFetchingProduct] = useState(false);
  const [fetchProgress, setFetchProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const resetExtractionState = () => {
    setProductPreview(null);
    setIsFetchingProduct(false);
    setFetchProgress(0);
    setError(null);
  };

  const incrementProgress = (interval: number) => {
    return setInterval(() => {
      setFetchProgress((prev) => {
        if (prev >= 95) {
          return 95;
        }
        return prev + 1;
      });
    }, interval);
  };

  const handlePreviewProduct = async (url: string) => {
    if (!url) {
      setError("Please enter a product URL");
      return;
    }

    try {
      setIsFetchingProduct(true);
      setFetchProgress(0);
      setError(null);

      // Simulate progress while fetching
      const progressInterval = incrementProgress(40);

      // Extract product information from supplied URL
      const { data: productData, error: extractError } = await supabase.functions.invoke(
        "jigsawstack-extraction",
        {
          body: { url },
        }
      );

      if (extractError) {
        throw new Error(extractError.message);
      }

      // Stop the progress interval
      clearInterval(progressInterval);
      setFetchProgress(90);

      if (!productData) {
        throw new Error("Failed to extract product data");
      }

      // Check if we received valid product data
      if (!productData.title) {
        setProductPreview({
          name: "Product information couldn't be extracted",
          price: "N/A",
          priceInr: 0,
          image: "https://placehold.co/600x400?text=No+Image",
          description: "Please try a different URL or enter product details manually.",
          platformFee: 5.00,
          currency: "INR"
        });
        setError("Couldn't extract product details from this URL");
        return;
      }

      // Set the product preview data
      setProductPreview({
        name: productData.title,
        price: productData.price?.toString() || "Price not available",
        priceInr: parseFloat(productData.price) || 0,
        image: productData.image || "https://placehold.co/600x400?text=No+Image",
        description: productData.description || "No description available",
        platformFee: 5.00,
        currency: "INR"
      });

      setFetchProgress(100);

    } catch (err) {
      console.error("Error in product preview:", err);
      setError(err instanceof Error ? err.message : "An error occurred extracting product details");
      setProductPreview({
        name: "Enter a product URL to preview",
        price: "N/A",
        priceInr: 0,
        image: "https://placehold.co/600x400?text=No+Image",
        description: "Please try a different URL or enter product details manually.",
        platformFee: 5.00,
        currency: "INR"
      });
    } finally {
      setIsFetchingProduct(false);
    }
  };

  return {
    productPreview,
    setProductPreview,
    isFetchingProduct,
    fetchProgress,
    handlePreviewProduct,
    error,
    resetExtractionState
  };
};
