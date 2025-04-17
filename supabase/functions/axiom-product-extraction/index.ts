
// Follow ES module imports
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

// CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Simple HTML parsing function using regex since DOM parsing is unreliable in Edge Functions
function extractProductDetails(html, platform) {
  const productData = {
    name: null,
    price: null,
    image: null,
    description: null,
    platform: platform
  };
  
  try {
    console.log(`Extracting ${platform} product data using regex...`);
    
    if (platform === 'amazon') {
      // Amazon product title
      const titleMatch = html.match(/<span\s+id="productTitle"[^>]*>(.*?)<\/span>/is);
      if (titleMatch && titleMatch[1]) {
        productData.name = titleMatch[1].trim();
      }
      
      // Amazon product price
      const priceMatch = html.match(/<span\s+class="a-price[^"]*"[^>]*>[^<]*<span[^>]*>(.*?)<\/span>/is);
      if (priceMatch && priceMatch[1]) {
        productData.price = priceMatch[1].trim();
      }
      
      // Original price for discount calculation
      const originalPriceMatch = html.match(/<span\s+class="a-price\s+a-text-price[^"]*"[^>]*>[^<]*<span[^>]*>(.*?)<\/span>/is);
      if (originalPriceMatch && originalPriceMatch[1]) {
        productData.originalPrice = originalPriceMatch[1].trim();
        productData.hasDiscount = true;
      }
      
      // Amazon product image
      const imageMatch = html.match(/<img[^>]*id="landingImage"[^>]*src="([^"]*)"[^>]*>/is) || 
                         html.match(/<img[^>]*data-old-hires="([^"]*)"[^>]*>/is);
      if (imageMatch && imageMatch[1]) {
        productData.image = imageMatch[1].trim();
      }
      
      // Amazon product description
      const descMatch = html.match(/<div\s+id="feature-bullets"[^>]*>.*?<ul[^>]*>(.*?)<\/ul>/is);
      if (descMatch && descMatch[1]) {
        const cleanDesc = descMatch[1].replace(/<li[^>]*>(.*?)<\/li>/gi, '$1\n');
        productData.description = cleanDesc.replace(/<[^>]*>/g, '').trim();
      }
      
      // Availability
      const availabilityMatch = html.match(/<span\s+class="a-color-success"[^>]*>(.*?)<\/span>/is);
      if (availabilityMatch && availabilityMatch[1]) {
        productData.availability = availabilityMatch[1].trim();
      }
      
      // Rating
      const ratingMatch = html.match(/<span\s+class="a-icon-alt"[^>]*>(.*?)<\/span>/is);
      if (ratingMatch && ratingMatch[1] && ratingMatch[1].includes('out of 5')) {
        const ratingText = ratingMatch[1];
        const ratingValue = parseFloat(ratingText.split(' ')[0]);
        if (!isNaN(ratingValue)) {
          productData.rating = ratingValue;
        }
      }
    } 
    else if (platform === 'flipkart') {
      // Flipkart product title
      const titleMatch = html.match(/<span[^>]*class="B_NuCI"[^>]*>(.*?)<\/span>/is) || 
                         html.match(/<h1[^>]*class="yhB1nd"[^>]*>(.*?)<\/h1>/is);
      if (titleMatch && titleMatch[1]) {
        productData.name = titleMatch[1].trim();
      }
      
      // Flipkart product price
      const priceMatch = html.match(/<div[^>]*class="_30jeq3[^"]*"[^>]*>(.*?)<\/div>/is);
      if (priceMatch && priceMatch[1]) {
        productData.price = priceMatch[1].trim();
      }
      
      // Original price for discount calculation
      const originalPriceMatch = html.match(/<div[^>]*class="_3I9_wc[^"]*"[^>]*>(.*?)<\/div>/is);
      if (originalPriceMatch && originalPriceMatch[1]) {
        productData.originalPrice = originalPriceMatch[1].trim();
        productData.hasDiscount = true;
      }
      
      // Flipkart product image
      const imageMatch = html.match(/<img[^>]*class="_396cs4"[^>]*src="([^"]*)"[^>]*>/is) || 
                         html.match(/<img[^>]*class="_2r_T1I"[^>]*src="([^"]*)"[^>]*>/is);
      if (imageMatch && imageMatch[1]) {
        productData.image = imageMatch[1].trim();
      }
      
      // Flipkart product description
      const descMatch = html.match(/<div[^>]*class="_1mXcCf[^"]*"[^>]*>(.*?)<\/div>/is);
      if (descMatch && descMatch[1]) {
        productData.description = descMatch[1].replace(/<[^>]*>/g, '').trim();
      }
      
      // Rating
      const ratingMatch = html.match(/<div[^>]*class="_3LWZlK"[^>]*>(.*?)<\/div>/is);
      if (ratingMatch && ratingMatch[1]) {
        const rating = parseFloat(ratingMatch[1]);
        if (!isNaN(rating)) {
          productData.rating = rating;
        }
      }
      
      // Review count
      const reviewCountMatch = html.match(/<span[^>]*>([0-9,]+)\s+[Rr]atings<\/span>/i);
      if (reviewCountMatch && reviewCountMatch[1]) {
        const reviewCount = parseInt(reviewCountMatch[1].replace(/,/g, ''));
        if (!isNaN(reviewCount)) {
          productData.reviewCount = reviewCount;
        }
      }
    }
    
    console.log("Extracted product data:", productData);
    return productData;
  } catch (error) {
    console.error("Error in regex extraction:", error);
    return productData;
  }
}

// Main request handler
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    // Get request body
    const requestData = await req.json();
    const { url, platform } = requestData;

    if (!url) {
      throw new Error("Missing required product URL");
    }

    console.log(`Starting product extraction for URL: ${url}`);

    // Determine which ecommerce platform we're working with
    const detectedPlatform = platform || 
      (url.includes('amazon') ? 'amazon' : 
      url.includes('flipkart') ? 'flipkart' : null);

    if (!detectedPlatform) {
      throw new Error("Unsupported ecommerce platform. Only Amazon and Flipkart are currently supported.");
    }
    
    // Attempt direct scraping first
    try {
      console.log("Attempting direct HTML scraping...");
      
      // Fetch the product page with a realistic user agent
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch product page: ${response.status} ${response.statusText}`);
      }
      
      const html = await response.text();
      console.log(`Fetched ${html.length} bytes of HTML`);
      
      // Use our regex-based extraction which is more reliable in Edge Functions
      const productData = extractProductDetails(html, detectedPlatform);
      
      // Check if we have enough data
      if (!productData.name) {
        throw new Error("Could not extract essential product data");
      }
      
      console.log("Successfully extracted product data:", productData);
      
      return new Response(
        JSON.stringify({
          success: true,
          message: "Product extracted successfully",
          productData,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
      
    } catch (scrapingError) {
      console.error("Direct scraping failed:", scrapingError);
      
      // Use hardcoded demo data for testing purposes
      console.log("Falling back to demo data...");
      
      // For simplicity, we'll create some demo product data based on the platform
      const demoProductData = {
        name: detectedPlatform === 'amazon' ? 
              "Demo Amazon Product" : 
              "Timex Automatic Black Dial Analog Watch for Men",
        price: detectedPlatform === 'amazon' ? "₹9,999" : "₹7,999",
        image: detectedPlatform === 'amazon' ?
              "https://via.placeholder.com/300" :
              "https://rukminim2.flixcart.com/image/832/832/l2hwwi80/watch/t/q/m/1-tweg17008-timex-men-original-imagdtw2gzkfymkh.jpeg",
        description: detectedPlatform === 'amazon' ?
                   "This is a demo Amazon product with demo specifications." :
                   "Brand: Timex\nModel: TWEG17008\nType: Analog\nIdeal For: Men\nOccasion: Formal, Casual\nWater Resistant: Yes\nStrap Material: Stainless Steel",
        platform: detectedPlatform,
        hasDiscount: true,
        originalPrice: detectedPlatform === 'amazon' ? "₹12,999" : "₹9,999",
        rating: 4.5,
        reviewCount: 1250
      };
      
      return new Response(
        JSON.stringify({
          success: true,
          message: "Product data provided from demo source",
          productData: demoProductData,
          demo: true
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }
  } catch (error) {
    console.error("Product extraction error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        message: "Product extraction failed",
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
