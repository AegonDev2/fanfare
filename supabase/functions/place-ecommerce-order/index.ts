
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
      }
    )

    const { platform, productUrl, addressId, quantity } = await req.json()

    // Get active credentials for the platform
    const { data: credentials, error: credError } = await supabaseClient
      .from('ecommerce_credentials')
      .select('*')
      .eq('platform', platform)
      .eq('is_active', true)
      .single()

    if (credError || !credentials) {
      throw new Error(`No active credentials found for ${platform}`)
    }

    // Initialize browser-like headers
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120"',
      'Sec-Ch-Ua-Mobile': '?0',
      'Sec-Ch-Ua-Platform': '"Windows"',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Upgrade-Insecure-Requests': '1',
      'Cookie': '', // Will be populated after login
    }

    // Step 1: Login to Flipkart
    console.log('Attempting to login to Flipkart...')
    
    const loginData = {
      username: credentials.username,
      password: credentials.encrypted_password,
    }

    const loginResponse = await fetch('https://www.flipkart.com/api/login', {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData)
    })

    if (!loginResponse.ok) {
      throw new Error('Failed to login to Flipkart')
    }

    // Extract and store cookies from login response
    const sessionCookies = loginResponse.headers.get('set-cookie')
    headers.Cookie = sessionCookies || ''

    // Step 2: Fetch product page to get product ID and other details
    console.log('Fetching product details...')
    const productResponse = await fetch(productUrl, { headers })
    const productHtml = await productResponse.text()
    
    const parser = new DOMParser()
    const doc = parser.parseFromString(productHtml, 'text/html')
    if (!doc) {
      throw new Error('Failed to parse product page')
    }

    // Extract product ID from URL or page content
    const productId = new URL(productUrl).pathname.split('/').pop()
    if (!productId) {
      throw new Error('Could not extract product ID')
    }

    // Step 3: Add to cart
    console.log('Adding product to cart...')
    const addToCartResponse = await fetch('https://www.flipkart.com/api/cart/add', {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productId,
        quantity
      })
    })

    if (!addToCartResponse.ok) {
      throw new Error('Failed to add product to cart')
    }

    // Step 4: Initialize checkout
    console.log('Initializing checkout...')
    const checkoutResponse = await fetch('https://www.flipkart.com/api/checkout/initialize', {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      }
    })

    if (!checkoutResponse.ok) {
      throw new Error('Failed to initialize checkout')
    }

    // Step 5: Set delivery address
    console.log('Setting delivery address...')
    const { data: address, error: addressError } = await supabaseClient
      .from('influencer_addresses')
      .select('*')
      .eq('id', addressId)
      .single()

    if (addressError || !address) {
      throw new Error('Failed to fetch delivery address')
    }

    const addressResponse = await fetch('https://www.flipkart.com/api/checkout/address', {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        addressId: address.id,
        address: {
          street: address.street_address,
          city: address.city,
          state: address.state,
          pincode: address.postal_code,
          country: address.country
        }
      })
    })

    if (!addressResponse.ok) {
      throw new Error('Failed to set delivery address')
    }

    // Step 6: Place order
    console.log('Placing final order...')
    const placeOrderResponse = await fetch('https://www.flipkart.com/api/checkout/place-order', {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentMethod: 'COD' // Cash on Delivery as default
      })
    })

    if (!placeOrderResponse.ok) {
      throw new Error('Failed to place order')
    }

    const orderConfirmation = await placeOrderResponse.json()

    return new Response(
      JSON.stringify({
        success: true,
        orderId: orderConfirmation.orderId,
        platform,
        status: 'pending',
        trackingInfo: orderConfirmation.trackingInfo
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error placing order:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
