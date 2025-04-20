
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { placeFlipkartOrder } from "./platforms/flipkart.ts"
import { placeSouledStoreOrder } from "./platforms/souledstore.ts"
import { getSupabaseClient, getActiveCredentials, getDeliveryAddress } from "./utils.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { platform, productUrl, addressId, quantity } = await req.json()
    const supabaseClient = getSupabaseClient()
    
    // Get platform credentials
    const credentials = await getActiveCredentials(supabaseClient, platform)
    
    // Get delivery address
    const address = await getDeliveryAddress(supabaseClient, addressId)

    // Common order parameters
    const orderParams = {
      productUrl,
      quantity,
      addressId: address.id,
      credentials
    }

    let orderResult

    // Route to appropriate platform handler
    switch (platform) {
      case 'flipkart':
        orderResult = await placeFlipkartOrder(orderParams)
        break
      case 'souledstore':
        orderResult = await placeSouledStoreOrder(orderParams)
        break
      default:
        throw new Error(`Platform ${platform} is not supported yet`)
    }

    return new Response(
      JSON.stringify({
        success: true,
        ...orderResult,
        platform
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error placing order:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
