
export const detectPlatform = (url: string): string => {
  if (url.includes('amazon') || url.includes('amzn.')) {
    return 'amazon';
  }
  if (url.includes('flipkart')) {
    return 'flipkart';
  }
  if (url.includes('thesouledstore')) {
    return 'souledstore';
  }
  return 'other';
};

export const getElementPrompts = (platform: string): string[] => {
  if (platform === 'amazon' || platform === 'flipkart' || platform === 'souledstore') {
    return ["product_title", "product_price"];
  }
  return [];
};

export const getSelectors = (platform: string): Array<{ selector: string }> => {
  if (platform === 'amazon') {
    return [
      { selector: "#productTitle" }, // title
      { selector: ".a-price-whole" } // price
    ];
  } else if (platform === 'flipkart') {
    return [
      { selector: "h1 span" }, // title
      { selector: "div._30jeq3._16Jk6d" } // price
    ];
  } else if (platform === 'souledstore') {
    return [
      { selector: "h1.pdp-title" }, // title
      { selector: "div.price-box span.price" } // price
    ];
  }
  return [];
};
