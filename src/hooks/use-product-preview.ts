
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { ProductDetails } from "@/types/order";

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

  // Helper: Determine platform from URL
  const detectPlatform = (url: string): 'amazon' | 'flipkart' | undefined => {
    if (url.includes('amazon')) return 'amazon';
    if (url.includes('flipkart')) return 'flipkart';
    return undefined;
  };

  // Helper: Extract product ID from Flipkart URL
  const extractFlipkartProductId = (url: string): string | null => {
    // Pattern for pid in URL
    const pidMatch = url.match(/pid=([^&]+)/);
    if (pidMatch) return pidMatch[1];
    
    // Alternative pattern for p/ URLs
    const pMatch = url.match(/\/p\/([^?\/]+)/);
    if (pMatch) return pMatch[1];
    
    return null;
  };

  // Helper: Extract basic product info from URL
  const extractBasicProductInfo = (url: string, platform: 'amazon' | 'flipkart'): ProductDetails => {
    // Extract product name from URL path
    const urlParts = url.split('/');
    let productName = "Unknown Product";
    
    for (const part of urlParts) {
      if (part && !part.includes('http') && !part.includes('www') && part.length > 5) {
        productName = part
          .replace(/-/g, ' ')
          .replace(/_/g, ' ')
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
        break;
      }
    }
    
    return {
      name: productName || `Product from ${platform}`,
      description: `This is a product from ${platform.charAt(0).toUpperCase() + platform.slice(1)}. We've extracted basic details from the URL.`,
      price: 1999, // Default price
      priceInr: 1999,
      platformFee: 5.00,
      image: platform === 'flipkart' 
        ? "https://rukminim1.flixcart.com/flap/128/128/image/f15c02bfeb02d15d.png?q=100" 
        : "https://m.media-amazon.com/images/G/01/error/logo._TTD_.png",
      platform: platform
    };
  };

  // Main function to handle product preview
  const handlePreviewProduct = async (giftItem: string) => {
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
      
      setFetchProgress(40);
      
      // Step 2: For Flipkart, try to use hardcoded data
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
      
      setFetchProgress(60);
      
      // Step 3: Check for specific Timex watch URL - redundant but keeping as fallback
      if (giftItem.includes('timex-automatic-black-dial-analog-watch-men') && 
          (giftItem.includes('WATGPGR7QCYTFHRG') || giftItem.includes('itm5d039dcaeb0c8'))) {
        console.log("Using hardcoded Timex product data");
        setProductPreview(HARDCODED_PRODUCTS["WATGPGR7QCYTFHRG"]);
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
      
      setFetchProgress(80);
      
      // Step 4: Fallback to basic extraction
      const basicProduct = extractBasicProductInfo(giftItem, platform);
      setProductPreview(basicProduct);
      setFetchProgress(100);
      
      toast({
        title: "Basic product details",
        description: "Only basic details could be extracted from the URL",
        variant: "default",
      });
      
    } catch (error) {
      console.error("Error fetching product:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      
      toast({
        title: "Error",
        description: `Failed to fetch product details: ${errorMessage}`,
        variant: "destructive",
      });
      
      // Reset to default state
      setProductPreview(DEFAULT_PRODUCT);
    } finally {
      setTimeout(() => {
        setIsFetchingProduct(false);
        setFetchProgress(0);
      }, 500);
    }
  };

  return {
    productPreview,
    setProductPreview,
    isFetchingProduct,
    fetchProgress,
    handlePreviewProduct,
    error
  };
};
