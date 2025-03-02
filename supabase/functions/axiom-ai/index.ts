
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.6'

// Define CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Initialize Supabase client with service role key
const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const supabase = createClient(supabaseUrl, supabaseKey)

// Get Axiom AI API key from environment variables
const AXIOM_AI_API_KEY = Deno.env.get('AXIOM_AI_API_KEY') || ''

export interface AxiomAIResponse {
  success: boolean
  data?: any
  error?: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Verify API key is set
    if (!AXIOM_AI_API_KEY) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'AXIOM_AI_API_KEY is not configured in the Supabase Edge Function Secrets'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      )
    }

    // Parse request body
    const { action, url, options } = await req.json()
    console.log(`Received request to Axiom AI: action=${action}, url=${url}`)

    // Different actions available through Axiom AI
    switch (action) {
      case 'extractProductDetails':
        return await extractProductDetails(url, options)
      case 'placeOrder':
        return await placeOrder(url, options)
      default:
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid action' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400 
          }
        )
    }
  } catch (error) {
    console.error('Error in Axiom AI function:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

async function extractProductDetails(url: string, options: any = {}): Promise<Response> {
  try {
    console.log(`Extracting product details from ${url}`)

    // Make request to Axiom AI API for product extraction
    const response = await fetch('https://api.axiom.ai/v1/extract-product', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AXIOM_AI_API_KEY}`
      },
      body: JSON.stringify({ url, ...options })
    })

    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to extract product details')
    }

    // Transform the response to match our ProductDetails format
    const productData = {
      name: result.title || 'Product name not available',
      description: result.description || 'No description available',
      price: result.price || 0,
      priceInr: result.localPrice || 0,
      platformFee: 5.00,
      image: result.imageUrl || 'https://storage.googleapis.com/a1aa/image/tSbIqbP_qJMzV8bfuyM7gaSttRX2Pi5K-jl57IlWP44.jpg',
      platform: detectPlatform(url),
      hasDiscount: result.hasDiscount || false,
      originalPrice: result.originalPrice || 0
    }

    return new Response(JSON.stringify({ success: true, data: productData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error extracting product details:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
}

async function placeOrder(url: string, options: any = {}): Promise<Response> {
  try {
    console.log(`Placing order on ${url} with options:`, options)

    // Set up the order request to Axiom AI
    const orderRequest = {
      url,
      address: options.address,
      paymentDetails: options.paymentDetails,
      quantity: options.quantity || 1,
      ...options
    }

    // Make request to Axiom AI API for order automation
    const response = await fetch('https://api.axiom.ai/v1/place-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AXIOM_AI_API_KEY}`
      },
      body: JSON.stringify(orderRequest)
    })

    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to place order')
    }

    return new Response(JSON.stringify({ success: true, data: result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error placing order:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
}

function detectPlatform(url: string): 'amazon' | 'flipkart' | undefined {
  if (url.includes('amazon')) return 'amazon'
  if (url.includes('flipkart')) return 'flipkart'
  return undefined
}
