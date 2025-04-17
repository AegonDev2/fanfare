
import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { ProductDetails } from "@/types/order";
import { supabase } from "@/integrations/supabase/client";

// Default product details when no product is selected
const DEFAULT_PRODUCT: ProductDetails = {
  name: "Enter a product URL to preview",
  description: "Product details will appear here once you enter a valid URL.",
  price: 0,
  priceInr: 0,
  platformFee: 5.00,
  image: "https://storage.googleapis.com/a1aa/image/tSbIqbP_qJMzV8bfuyM7gaSttRX2Pi5K-jl57IlWP44.jpg"
};

// Hardcoded products database for reliable demo
const HARDCODED_PRODUCTS: Record<string, ProductDetails> = {
  // Timex watch product
  "WATGPGR7QCYTFHRG": {
    name: "Timex Automatic Black Dial Analog Watch for Men",
    description: "Brand: Timex\nModel: TWEG17008\nType: Analog\nIdeal For: Men\nOccasion: Formal, Casual\nWater Resistant: Yes\nStrap Material: Stainless Steel",
    price: 7999,
    priceInr: 7999,
    platformFee: 5.00,
    image: "https://rukminim2.flixcart.com/image/832/832/l2hwwi80/watch/t/q/m/1-tweg17008-timex-men-original-imagdtw2gzkfymkh.jpeg",
    platform: 'flipkart',
    hasDiscount: true,
    originalPrice: 9999
  },
  // Additional demo product
  "demo-product": {
    name: "Demo Product",
    description: "This is a demo product for testing purposes.",
    price: 1999,
    priceInr: 1999,
    platformFee: 5.00,
    image: "https://via.placeholder.com/300",
    platform: 'amazon'
  }
};

export const useProductPreview = () => {
  const { toast } = useToast();
  const [isFetchingProduct, setIsFetchingProduct] = useState(false);
  const [fetchProgress, setFetchProgress] = useState(0);
  const [productPreview, setProductPreview] = useState<ProductDetails>(DEFAULT_PRODUCT);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Helper: Determine platform from URL
  const detectPlatform = useCallback((url: string): 'amazon' | 'flipkart' | undefined => {
    if (url.includes('amazon')) return 'amazon';
    if (url.includes('flipkart')) return 'flipkart';
    return undefined;
  }, []);

  // Helper: Extract product ID from Flipkart URL
  const extractFlipkartProductId = useCallback((url: string): string | null => {
    // Pattern for pid in URL
    const pidMatch = url.match(/pid=([^&]+)/);
    if (pidMatch) return pidMatch[1];
    
    // Alternative pattern for p/ URLs
    const pMatch = url.match(/\/p\/([^?\/]+)/);
    if (pMatch) return pMatch[1];
    
    return null;
  }, []);

  // Reset extraction state to try again
  const resetExtractionState = useCallback(() => {
    setError(null);
    setRetryCount(prev => prev + 1);
  }, []);

  // Main function to handle product preview
  const handlePreviewProduct = useCallback(async (giftItem: string) => {
    if (!giftItem) {
      toast({
        title: "Error",
        description: "Please enter a product URL",
        variant: "destructive",
      });
      setError("Please enter a product URL");
      return;
    }

    // Validate URL format
    try {
      new URL(giftItem);
    } catch (e) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid product URL",
        variant: "destructive",
      });
      setError("Invalid URL format");
      return;
    }

    // Start fetching process
    setIsFetchingProduct(true);
    setFetchProgress(20);
    setError(null);
    
    try {
      // Step 1: Detect platform
      const platform = detectPlatform(giftItem);
      
      if (!platform) {
        throw new Error("Unsupported platform. Currently only Amazon and Flipkart are supported.");
      }
      
      setFetchProgress(30);
      
      // Step 2: For Flipkart, try to use hardcoded data first
      if (platform === 'flipkart') {
        const productId = extractFlipkartProductId(giftItem);
        console.log("Extracted Flipkart product ID:", productId);
        
        if (productId && HARDCODED_PRODUCTS[productId]) {
          console.log("Using hardcoded product data for:", productId);
          setProductPreview(HARDCODED_PRODUCTS[productId]);
          setFetchProgress(100);
          
          toast({
            title: "Product fetched",
            description: "Product details have been loaded successfully",
          });
          
          setTimeout(() => {
            setIsFetchingProduct(false);
            setFetchProgress(0);
          }, 500);
          
          return;
        }
      }
      
      setFetchProgress(40);
      
      // Step 3: Try to fetch actual product data from the Edge Function directly
      console.log("Fetching product data via Edge Function for:", giftItem);
      
      try {
        // Call Supabase Edge Function directly
        const { data: axiomData, error: axiomError } = await supabase.functions.invoke("axiom-product-extraction", {
          body: { 
            url: giftItem,
            retryCount: retryCount,
            platform: platform
          },
        });

        if (axiomError) {
          console.error("Edge function error:", axiomError);
          throw new Error(axiomError.message || "Failed to extract product details");
        }
        
        setFetchProgress(80);
        
        if (!axiomData || !axiomData.productData || !axiomData.productData.name) {
          throw new Error("Could not extract product details. Please try a different product or URL.");
        }
        
        console.log("Extracted product data:", axiomData.productData);
        
        // Process the extracted data
        const extractedData = axiomData.productData;
        const priceString = extractedData.price?.toString() || "0";
        const priceNumber = parseFloat(priceString.replace(/[^\d.]/g, "")) || 0;
        
        const productDetails: ProductDetails = {
          name: extractedData.name,
          description: extractedData.description || "No description available",
          price: priceNumber,
          priceInr: priceNumber,
          platformFee: 5.00,
          image: extractedData.image || "https://placehold.co/600x400?text=No+Image",
          platform: platform,
          hasDiscount: extractedData.hasDiscount || false,
          originalPrice: extractedData.originalPrice ? 
            parseFloat(extractedData.originalPrice.toString().replace(/[^\d.]/g, "")) || undefined : 
            undefined,
        };
        
        setProductPreview(productDetails);
        setFetchProgress(100);
        
        toast({
          title: "Product extracted",
          description: "Successfully extracted product details",
        });
      } catch (fetchError) {
        console.error("Fetch error:", fetchError);
        
        // If regular extraction fails, try to use demo data
        if (axiomData?.demo && axiomData.productData) {
          const demoData = axiomData.productData;
          const demoProductDetails: ProductDetails = {
            name: demoData.name || "Demo Product",
            description: demoData.description || "Demo product details",
            price: 1999,
            priceInr: 1999,
            platformFee: 5.00,
            image: demoData.image || "https://placehold.co/600x400?text=Demo+Product",
            platform: platform,
            hasDiscount: true,
            originalPrice: 2499
          };
          
          setProductPreview(demoProductDetails);
          setFetchProgress(100);
          
          toast({
            title: "Demo product loaded",
            description: "Could not extract actual product. Using demo data instead.",
            variant: "warning",
          });
          
          return;
        }
        
        throw new Error(fetchError instanceof Error ? fetchError.message : 'Error connecting to extraction service');
      }
      
    } catch (error) {
      console.error("Error fetching product:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      
      toast({
        title: "Extraction failed",
        description: `${errorMessage}. Please try another product URL.`,
        variant: "destructive",
      });
      
      // Reset the product preview to default if extraction failed
      if (productPreview.name !== DEFAULT_PRODUCT.name) {
        setProductPreview(DEFAULT_PRODUCT);
      }
    } finally {
      setTimeout(() => {
        setIsFetchingProduct(false);
        setFetchProgress(0);
      }, 500);
    }
  }, [toast, retryCount, detectPlatform, extractFlipkartProductId, productPreview.name]);

  return {
    productPreview,
    setProductPreview,
    isFetchingProduct,
    fetchProgress,
    handlePreviewProduct,
    error,
    resetExtractionState,
    retryCount
  };
};
