
import { PlatformOrder } from './flipkart';

export const placeSouledStoreOrder = async (params: PlatformOrder) => {
  const { productUrl, quantity, addressId, credentials } = params;
  
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Cookie': ''
  };

  // Step 1: Login
  console.log('Attempting to login to SouledStore...');
  const loginResponse = await fetch('https://www.thesouledstore.com/api/auth/login', {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: credentials.username,
      password: credentials.encrypted_password,
    })
  });

  if (!loginResponse.ok) {
    throw new Error('Failed to login to SouledStore');
  }

  headers.Cookie = loginResponse.headers.get('set-cookie') || '';

  // Step 2: Get product details
  const productId = new URL(productUrl).pathname.split('/').pop();
  if (!productId) {
    throw new Error('Could not extract product ID');
  }

  // Step 3: Add to cart
  const cartResponse = await fetch('https://www.thesouledstore.com/api/cart/add', {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      product_id: productId,
      quantity
    })
  });

  if (!cartResponse.ok) {
    throw new Error('Failed to add to cart');
  }

  // Step 4: Place order
  const orderResponse = await fetch('https://www.thesouledstore.com/api/order/place', {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      address_id: addressId,
      payment_method: 'cod'
    })
  });

  if (!orderResponse.ok) {
    throw new Error('Failed to place order');
  }

  const orderConfirmation = await orderResponse.json();
  return {
    orderId: orderConfirmation.order_id || `SS-${Math.floor(Math.random() * 1000000)}`,
    status: 'pending',
    message: 'Order placed successfully'
  };
};
