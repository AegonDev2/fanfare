
interface Response {
  link?: Array<{ href?: string }>;
  data?: any[];
  selectors?: {
    product_title?: string[];
    product_price?: string[];
  };
}

export const isErrorPage = (response: Response): boolean => {
  if (response.link && response.link.some(link => 
      link.href && (
        link.href.includes('ref=cs_503') || 
        link.href.includes('ref=cs_500') ||
        link.href.includes('ref=cs_404')
      )
    )) {
    console.log("Detected Amazon error page (503/500/404)");
    return true;
  }
  
  if (
    (!response.data || response.data.length === 0) && 
    response.selectors && 
    (!response.selectors.product_title || response.selectors.product_title.length === 0) &&
    (!response.selectors.product_price || response.selectors.product_price.length === 0)
  ) {
    console.log("Detected empty response with no product data");
    return true;
  }
  
  return false;
};
