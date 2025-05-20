
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProductDetails } from "@/types/order";
import { generateWebsitePreview } from "@/utils/pikwy";
import { useToast } from "@/hooks/use-toast";

export const useProductPreview = () => {
  const { toast } = useToast();
  const [productPreview, setProductPreview] = useState<ProductDetails | null>(null);
  const [isFetchingProduct, setIsFetchingProduct] = useState(false);
  const [fetchProgress, setFetchProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [websitePreview, setWebsitePreview] = useState<string | null>(null);

  const resetExtractionState = () => {
    setProductPreview(null);
    setIsFetchingProduct(false);
    setFetchProgress(0);
    setError(null);
    setWebsitePreview(null);
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

  const fetchWebsitePreview = async (url: string) => {
    if (!url) return null;
    
    try {
      console.log("Generating website preview for URL:", url);
      const imageUrl = await generateWebsitePreview(url);
      console.log("Website preview generated:", imageUrl);
      setWebsitePreview(imageUrl);
      return imageUrl;
    } catch (err) {
      console.error("Failed to generate website preview:", err);
      return null;
    }
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
      setWebsitePreview(null);

      // Simulate progress while fetching
      const progressInterval = incrementProgress(40);

      // Start generating website preview in parallel
      const previewPromise = fetchWebsitePreview(url);

      // Extract product information from supplied URL
      const { data: extractionResponse, error: extractError } = await supabase.functions.invoke(
        "jigsawstack-extraction",
        {
          body: { url },
        }
      );

      // Stop the progress interval
      clearInterval(progressInterval);
      setFetchProgress(90);

      if (extractError) {
        console.error("Extraction error:", extractError);
        throw new Error(extractError.message);
      }

      // Wait for website preview to complete
      const previewImage = await previewPromise;

      // Set to 95% as we're almost done
      setFetchProgress(95);

      // Check if we received valid extraction response
      if (!extractionResponse || !extractionResponse.productData) {
        console.log("No product data in response:", extractionResponse);
        
        // Create a fallback product preview with website screenshot
        setProductPreview({
          name: "Product information couldn't be fully extracted",
          price: "N/A",
          priceInr: 0,
          image: previewImage || "https://placehold.co/600x400?text=No+Image",
          description: "Please verify the product details before proceeding.",
          platformFee: 5.00
        });
        
        toast({
          title: "Limited Information",
          description: "Only partial product details could be extracted. Please verify before proceeding.",
          variant: "default",
        });
        
        setFetchProgress(100);
        return;
      }

      const productData = extractionResponse.productData;
      
      // Check if we received valid product data
      if (!productData.name) {
        console.log("Product data missing name:", productData);
        setProductPreview({
          name: "Product information couldn't be extracted",
          price: "N/A",
          priceInr: 0,
          image: previewImage || "https://placehold.co/600x400?text=No+Image",
          description: "Please try a different URL or enter product details manually.",
          platformFee: 5.00
        });
        setError("Couldn't extract product details from this URL");
        setFetchProgress(100);
        return;
      }

      // Parse price from string if needed
      let priceNumber = 0;
      if (typeof productData.price === 'string') {
        // Extract numeric value from price string (e.g. "₹ 999" -> 999)
        const priceMatch = productData.price.match(/[\d.]+/);
        priceNumber = priceMatch ? parseFloat(priceMatch[0]) : 0;
      } else {
        priceNumber = parseFloat(productData.price) || 0;
      }

      // Set the product preview data
      const preview = {
        name: productData.name,
        price: productData.price?.toString() || "Price not available",
        priceInr: priceNumber,
        image: productData.image || previewImage || "https://placehold.co/600x400?text=No+Image",
        description: productData.description || "No description available",
        platformFee: 5.00
      };
      
      console.log("Setting product preview:", preview);
      setProductPreview(preview);
      setFetchProgress(100);

      // Success notification
      toast({
        title: "Product Processed",
        description: "Product information has been successfully extracted.",
        variant: "default",
      });

    } catch (err) {
      console.error("Error in product preview:", err);
      
      // Try to still get a website preview even if extraction failed
      const previewImage = await fetchWebsitePreview(url);
      
      setError(err instanceof Error ? err.message : "An error occurred extracting product details");
      setProductPreview({
        name: "Enter a product URL to preview",
        price: "N/A",
        priceInr: 0,
        image: previewImage || "https://placehold.co/600x400?text=No+Image",
        description: "Please try a different URL or enter product details manually.",
        platformFee: 5.00
      });
      
      toast({
        title: "Extraction Failed",
        description: "Could not extract product details. You can still proceed with the URL.",
        variant: "destructive",
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
    resetExtractionState,
    websitePreview
  };
};
