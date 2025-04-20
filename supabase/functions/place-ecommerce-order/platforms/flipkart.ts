
export interface PlatformOrder {
  productUrl: string;
  quantity: number;
  addressId: string;
  credentials: any;
}

export const placeFlipkartOrder = async (params: PlatformOrder) => {
  const { productUrl, quantity, addressId, credentials } = params;
  
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Cookie': ''
  };

  // Step 1: Login
  console.log('Attempting to login to Flipkart...');
  const loginResponse = await fetch('https://www.flipkart.com/api/login', {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: credentials.username,
      password: credentials.encrypted_password,
    })
  });

  if (!loginResponse.ok) {
    throw new Error('Failed to login to Flipkart');
  }

  // Extract and store cookies
  headers.Cookie = loginResponse.headers.get('set-cookie') || '';

  // Step 2: Extract product ID
  console.log('Fetching product details...');
  const productResponse = await fetch(productUrl, { headers });
  const productHtml = await productResponse.text();
  
  const productIdMatch = productHtml.match(/productId['"]\s*:\s*['"]([^'"]+)['"]/i) || 
                        productUrl.match(/\/([A-Za-z0-9]+)(?:\?|\/$|$)/) ||
                        [];
  
  const productId = productIdMatch[1] || new URL(productUrl).pathname.split('/').pop();
  
  if (!productId) {
    throw new Error('Could not extract product ID');
  }

  // Step 3: Add to cart
  const cartResponse = await fetch('https://www.flipkart.com/api/cart/add', {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ productId, quantity })
  });

  if (!cartResponse.ok) {
    throw new Error('Failed to add product to cart');
  }

  // Step 4: Place order
  const orderResponse = await fetch('https://www.flipkart.com/api/checkout/place-order', {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      addressId,
      paymentMethod: 'COD'
    })
  });

  if (!orderResponse.ok) {
    throw new Error('Failed to place order');
  }

  const orderConfirmation = await orderResponse.json();
  return {
    orderId: orderConfirmation.orderId,
    status: 'pending',
    trackingInfo: orderConfirmation.trackingInfo
  };
};
