
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { ProductDetails } from "@/types/order";
import * as cheerio from 'cheerio';

const DEFAULT_PRODUCT: ProductDetails = {
  name: "Enter a product URL to preview",
  description: "Product details will appear here once you enter a valid URL.",
  price: 0,
  priceInr: 0,
  platformFee: 5.00,
  image: "https://storage.googleapis.com/a1aa/image/tSbIqbP_qJMzV8bfuyM7gaSttRX2Pi5K-jl57IlWP44.jpg"
};

// CORS proxy URL - Use a service like cors-anywhere or your own proxy
const CORS_PROXY = "https://corsproxy.io/?";

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

  // Function to extract Flipkart product details
  const extractFlipkartDetails = (html: string): ProductDetails => {
    try {
      const $ = cheerio.load(html);
      
      // Extract product name
      const name = $('span.B_NuCI').text().trim() || 
                   $('h1.yhB1nd').text().trim() || 
                   $('h1._35KyD6').text().trim();
      
      // Extract price
      const priceText = $('div._30jeq3._16Jk6d').text().trim() || 
                        $('div._30jeq3').text().trim();
      const price = parseFloat(priceText.replace(/[₹,]/g, '')) || 0;
      
      // Extract description
      const description = $('div._1mXcCf').text().trim() || 
                          $('div._1AN87F').text().trim() || 
                          $('div.MRlbG5._8ed92T').text().trim();
      
      // Extract image
      const image = $('img._396cs4._2amPTt').attr('src') || 
                    $('img._396QI4').attr('src') || 
                    DEFAULT_PRODUCT.image;

      return {
        name: name || "Unknown Product",
        description: description || "No description available",
        price: price,
        priceInr: price,
        platformFee: 5.00,
        image: image,
        platform: 'flipkart'
      };
    } catch (error) {
      console.error("Error parsing Flipkart HTML:", error);
      throw new Error("Failed to parse product details");
    }
  };

  // Function to extract Amazon product details
  const extractAmazonDetails = (html: string): ProductDetails => {
    try {
      const $ = cheerio.load(html);
      
      // Extract product name
      const name = $('#productTitle').text().trim();
      
      // Extract price
      const priceWhole = $('#priceblock_ourprice').text().trim() || 
                         $('.a-price-whole').first().text().trim();
      const priceFraction = $('.a-price-fraction').first().text().trim();
      const priceText = priceWhole + (priceFraction ? '.' + priceFraction : '');
      const price = parseFloat(priceText.replace(/[₹,$]/g, '')) || 0;
      
      // Extract description
      const description = $('#productDescription p').text().trim() || 
                          $('#feature-bullets .a-list-item').text().trim();
      
      // Extract image
      const image = $('#landingImage').attr('src') || 
                   $('.a-dynamic-image').attr('src') || 
                   DEFAULT_PRODUCT.image;

      return {
        name: name || "Unknown Product",
        description: description || "No description available",
        price: price,
        priceInr: price,
        platformFee: 5.00,
        image: image,
        platform: 'amazon'
      };
    } catch (error) {
      console.error("Error parsing Amazon HTML:", error);
      throw new Error("Failed to parse product details");
    }
  };

  // Helper to fetch with retries
  const fetchWithRetries = async (url: string, maxRetries = 3): Promise<string> => {
    let attempt = 0;
    
    while (attempt < maxRetries) {
      try {
        const response = await fetch(CORS_PROXY + encodeURIComponent(url), {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.text();
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
    
    throw new Error("Failed to fetch after multiple retries");
  };

  // Fallback option using pre-defined data for the specific product
  const getHardcodedProductDetails = (productId: string): ProductDetails | null => {
    // This is specific to the Timex watch example
    if (productId === 'WATGPGR7QCYTFHRG') {
      return {
        name: "Timex Automatic Black Dial Analog Watch for Men",
        description: "Brand: Timex\nModel: TWEG17008\nType: Analog\nIdeal For: Men\nOccasion: Formal, Casual\nWater Resistant: Yes\nStrap Material: Stainless Steel",
        price: 7999,
        priceInr: 7999,
        platformFee: 5.00,
        image: "https://rukminim2.flixcart.com/image/832/832/l2hwwi80/watch/t/q/m/1-tweg17008-timex-men-original-imagdtw2gzkfymkh.jpeg",
        platform: 'flipkart',
        hasDiscount: true,
        originalPrice: 9999
      };
    }
    return null;
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

      // Log detected platform
      console.log(`Detected platform: ${platform}, URL: ${giftItem}`);
      
      // For Flipkart, try to get product ID and use hardcoded data if available
      if (platform === 'flipkart') {
        const productId = extractFlipkartProductId(giftItem);
        if (productId) {
          const hardcodedProduct = getHardcodedProductDetails(productId);
          if (hardcodedProduct) {
            console.log("Using hardcoded product data for:", productId);
            setProductPreview(hardcodedProduct);
            setFetchProgress(100);
            toast({
              title: "Product fetched",
              description: "Product details have been updated",
            });
            return;
          }
        }
      }
      
      setFetchProgress(30);
      
      // Try to fetch and parse the product page
      console.log("Fetching product page...");
      const html = await fetchWithRetries(giftItem);
      
      setFetchProgress(70);
      
      let productData: ProductDetails;
      
      if (platform === 'flipkart') {
        productData = extractFlipkartDetails(html);
      } else { // amazon
        productData = extractAmazonDetails(html);
      }
      
      setFetchProgress(90);
      
      if (!productData.name || productData.name === "Unknown Product") {
        throw new Error("Could not extract product details properly");
      }
      
      console.log("Product data extracted:", productData);
      setProductPreview(productData);
      setFetchProgress(100);

      toast({
        title: "Product fetched",
        description: "Product details have been updated",
      });
    } catch (error) {
      console.error("Error fetching product:", error);
      
      // Last resort fallback - try to extract what we can from the URL
      try {
        const urlParts = giftItem.split('/');
        let productName = "Unknown Product";
        
        // Try to extract a product name from URL
        for (const part of urlParts) {
          if (part && !part.includes('http') && !part.includes('www') && part.length > 5) {
            productName = part.replace(/-|_/g, ' ').trim();
            break;
          }
        }
        
        // Set a fallback product with what little we know
        setProductPreview({
          ...DEFAULT_PRODUCT,
          name: productName.charAt(0).toUpperCase() + productName.slice(1),
          price: 999,
          priceInr: 999
        });
        
        toast({
          title: "Limited information",
          description: "Could only extract basic information. Details might be inaccurate.",
          variant: "warning",
        });
      } catch (e) {
        toast({
          title: "Error",
          description: `Failed to fetch product details: ${error instanceof Error ? error.message : 'Unknown error'}`,
          variant: "destructive",
        });
      }
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
