
interface ExtractedData {
  name: string;
  price: string;
  platform?: string;
}

export const extractProductData = (response: any, platform: string): ExtractedData => {
  console.log("Extracting product data from response format:", response);
  
  // Special handling for souledstore raw context data
  if (response.context) {
    if (platform === 'souledstore') {
      const titles = response.context["h1.fbold.mb-0.title-size"] || [];
      const prices = response.context["span.fbold"] || [];
      
      const title = titles.length > 0 ? titles[0] : "";
      // Take the first price (as requested)
      const price = prices.length > 0 ? prices[0] : "0";
      
      console.log(`Extracted souledstore title: ${title}, First price: ${price}`);
      
      return { 
        name: title, 
        price: price, 
        platform: platform 
      };
    }
    
    // For other platforms using normal product_title/product_price
    const titles = response.context.product_title || [];
    const prices = response.context.product_price || [];
    
    const title = titles.length > 0 ? titles[0] : "";
    const price = prices.length > 0 ? prices[0] : "0";
    
    console.log(`Extracted title: ${title}, First price: ${price}`);
    
    return { 
      name: title, 
      price: price, 
      platform: platform 
    };
  }
  
  if (response.data && Array.isArray(response.data)) {
    // For AI-based scraping
    if (platform === 'souledstore') {
      const productTitle = response.data.find(d => 
        d.element_prompt === "h1.fbold.mb-0.title-size" && d.results?.length > 0
      )?.results[0]?.text?.trim() || "";

      const productPrice = response.data.find(d => 
        d.element_prompt === "span.fbold" && d.results?.length > 0
      )?.results[0]?.text?.trim() || "0";
      
      return { name: productTitle, price: productPrice };
    }
    
    const productTitle = response.data.find(d => 
      d.element_prompt === "product_title" && d.results?.length > 0
    )?.results[0]?.text?.trim() || "";

    const productPrice = response.data.find(d => 
      d.element_prompt === "product_price" && d.results?.length > 0
    )?.results[0]?.text?.trim() || "0";
    
    return { name: productTitle, price: productPrice };
  }
  
  if (response.selectors) {
    let title = "";
    let price = "0";
    
    try {
      if (platform === 'souledstore' && response.selectors["h1.fbold.mb-0.title-size"]) {
        title = response.selectors["h1.fbold.mb-0.title-size"][0] || "";
        price = response.selectors["span.fbold"] ? 
                response.selectors["span.fbold"][0] || "0" : "0";
      } else if ((platform === 'flipkart') && response.selectors.product_title) {
        title = response.selectors.product_title[0] || "";
        price = response.selectors.product_price ? 
                response.selectors.product_price[0] || "0" : "0";
      }
    } catch (error) {
      console.error("Error extracting from selectors:", error);
    }
    
    return { name: title, price: price };
  }
  
  return { name: "", price: "0" };
};
