
interface ExtractedData {
  name: string;
  price: string;
  platform?: string;
}

export const extractProductData = (response: any, platform: string): ExtractedData => {
  console.log("Extracting product data from response format:", response);
  
  if (response.context) {
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
      if ((platform === 'flipkart' || platform === 'souledstore') && response.selectors.product_title) {
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
