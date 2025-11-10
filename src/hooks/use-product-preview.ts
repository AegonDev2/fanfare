
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
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);

  const resetExtractionState = () => {
    setProductPreview(null);
    setIsFetchingProduct(false);
    setFetchProgress(0);
    setError(null);
    setWebsitePreview(null);
    setIsGeneratingPreview(false);
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
      setIsGeneratingPreview(true);
      console.log("Generating website preview for URL:", url);
      const imageUrl = await generateWebsitePreview(url);
      console.log("Website preview generated successfully, data URL length:", imageUrl?.length || 0);
      setWebsitePreview(imageUrl);
      return imageUrl;
    } catch (err) {
      console.error("Failed to generate website preview:", err);
      // Don't fail completely, just return null for the preview
      return null;
    } finally {
      setIsGeneratingPreview(false);
    }
  };

  const fetchProductPreview = async (url: string) => {
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
          body: { url, async: false },
        }
      );

      // Stop the progress interval
      clearInterval(progressInterval);
      setFetchProgress(85);

      if (extractError) {
        console.error("Extraction error:", extractError);
        throw new Error(extractError.message);
      }

      // Check if data is from cache
      const isCached = extractionResponse?.cached || false;
      
      // If cached and has screenshot, use it
      if (isCached && extractionResponse?.screenshot_url) {
        setWebsitePreview(extractionResponse.screenshot_url);
      } else {
        // Wait for website preview to complete
        const previewImage = await previewPromise;
        console.log("Preview image received:", previewImage ? "yes (length: " + previewImage.length + ")" : "no");
      }

      // Set to 95% as we're almost done
      setFetchProgress(95);

      // Check if we received valid extraction response
      if (!extractionResponse || !extractionResponse.productData) {
        console.log("No product data in response:", extractionResponse);
        
        // Create a fallback product preview with website screenshot
        const fallbackImage = websitePreview || "https://placehold.co/600x400?text=No+Image";
        setProductPreview({
          name: "Product information couldn't be fully extracted",
          price: "N/A",
          priceInr: 0,
          image: fallbackImage,
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
        const fallbackImage = websitePreview || "https://placehold.co/600x400?text=No+Image";
        setProductPreview({
          name: "Product information couldn't be extracted",
          price: "N/A",
          priceInr: 0,
          image: fallbackImage,
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
        // Extract numeric value from price string (e.g. "₹ 44,999" -> 44999)
        const priceMatch = productData.price.match(/[\d,]+/);
        if (priceMatch) {
          // Remove commas and parse as float
          const cleanPrice = priceMatch[0].replace(/,/g, '');
          priceNumber = parseFloat(cleanPrice);
        }
      } else {
        priceNumber = parseFloat(productData.price) || 0;
      }

      // Use cached screenshot if available, otherwise use website preview or fallback
      const imageUrl = extractionResponse.screenshot_url || websitePreview || productData.image || "https://placehold.co/600x400?text=No+Image";

      // Set the product preview data
      const preview = {
        name: productData.name,
        price: productData.price?.toString() || "Price not available",
        priceInr: priceNumber,
        image: imageUrl,
        description: productData.description || "No description available",
        platformFee: 5.00
      };
      
      console.log("Setting product preview:", preview);
      console.log("Using cached data:", isCached);
      setProductPreview(preview);
      setFetchProgress(100);

      // Success notification
      toast({
        title: isCached ? "Product Retrieved (Cached)" : "Product Processed",
        description: isCached ? "Product information retrieved from cache." : "Product information has been successfully extracted.",
        variant: "default",
      });

    } catch (err) {
      console.error("Error in product preview:", err);
      
      try {
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
      } catch (previewErr) {
        // In case of failure, create product preview without image
        setProductPreview({
          name: "Enter a product URL to preview",
          price: "N/A",
          priceInr: 0,
          image: "https://placehold.co/600x400?text=No+Image",
          description: "Please try a different URL or enter product details manually.",
          platformFee: 5.00
        });
      }
      
      toast({
        title: "Extraction Failed",
        description: "Could not extract product details. You can still proceed with the URL.",
        variant: "destructive",
      });
    } finally {
      setIsFetchingProduct(false);
      setFetchProgress(100);
    }
  };

  // Add the missing handlePreviewProduct method
  const handlePreviewProduct = fetchProductPreview;

  return {
    productPreview,
    setProductPreview,
    isFetchingProduct,
    fetchProgress,
    setFetchProgress,
    fetchProductPreview,
    handlePreviewProduct,
    error,
    resetExtractionState,
    websitePreview,
    isGeneratingPreview
  };
};
