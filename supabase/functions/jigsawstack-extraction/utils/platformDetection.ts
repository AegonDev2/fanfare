
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
  if (platform === 'amazon' || platform === 'flipkart') {
    return ["product_title", "product_price"];
  }
  if (platform === 'souledstore') {
    return ["h1.fbold.mb-0.title-size", "span.fbold"];
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
      { selector: "h1.fbold.mb-0.title-size" }, // title
      { selector: "span.fbold" } // price
    ];
  }
  return [];
};
