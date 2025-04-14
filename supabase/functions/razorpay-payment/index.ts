
import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.1"

// Define CORS headers for browser access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Define API response types
interface CreateOrderResponse {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  key: string;
}

interface VerifyPaymentResponse {
  success: boolean;
  message: string;
  payment_id?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get Razorpay API keys from environment variables
    const RAZORPAY_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID')
    const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET')
    
    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      throw new Error('Razorpay API keys are not configured')
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Parse request body
    const { action, userId, amount, orderId, paymentId, signature } = await req.json()
    
    console.log(`Processing Razorpay ${action} request for user: ${userId}`)
    
    // Handle different actions
    switch (action) {
      case 'create_order': {
        // Validate amount
        if (!amount || amount <= 0) {
          throw new Error('Invalid amount')
        }
        
        // Amount in paisa (Razorpay uses smallest currency unit)
        const amountInPaisa = Math.round(amount * 100)
        
        // Create receipt reference with timestamp
        const receipt = `wallet_topup_${userId}_${Date.now()}`
        
        // Create order in Razorpay
        const response = await fetch('https://api.razorpay.com/v1/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`)
          },
          body: JSON.stringify({
            amount: amountInPaisa,
            currency: 'INR',
            receipt: receipt,
            notes: {
              user_id: userId,
              type: 'wallet_topup'
            }
          })
        })
        
        const orderData = await response.json()
        
        if (!response.ok) {
          console.error('Razorpay order creation failed:', orderData)
          throw new Error(orderData.error?.description || 'Failed to create payment order')
        }
        
        console.log('Razorpay order created:', orderData.id)
        
        // Return order data with key for frontend
        const result: CreateOrderResponse = {
          id: orderData.id,
          amount: orderData.amount / 100, // Convert back to rupees
          currency: orderData.currency,
          receipt: orderData.receipt,
          key: RAZORPAY_KEY_ID
        }
        
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        })
      }
      
      case 'verify_payment': {
        // Validate required parameters
        if (!orderId || !paymentId || !signature) {
          throw new Error('Missing payment verification parameters')
        }
        
        // Calculate signature for verification using crypto
        const encoder = new TextEncoder()
        const data = encoder.encode(orderId + "|" + paymentId)
        const key = await crypto.subtle.importKey(
          "raw",
          encoder.encode(RAZORPAY_KEY_SECRET),
          { name: "HMAC", hash: "SHA-256" },
          false,
          ["sign"]
        )
        const signature_array = await crypto.subtle.sign("HMAC", key, data)
        const signature_bytes = new Uint8Array(signature_array)
        const signature_hex = Array.from(signature_bytes)
          .map(b => b.toString(16).padStart(2, '0'))
          .join('')
        
        // Verify signature
        if (signature_hex !== signature) {
          console.error('Payment signature verification failed')
          return new Response(JSON.stringify({
            success: false,
            message: 'Payment verification failed'
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400
          })
        }
        
        // Get payment details from Razorpay
        const paymentResponse = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}`, {
          method: 'GET',
          headers: {
            'Authorization': 'Basic ' + btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`)
          }
        })
        
        const paymentDetails = await paymentResponse.json()
        
        if (!paymentResponse.ok || paymentDetails.status !== 'captured') {
          console.error('Invalid payment status:', paymentDetails)
          return new Response(JSON.stringify({
            success: false,
            message: 'Payment not successful'
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400
          })
        }
        
        // Extract amount (convert from paisa to rupees)
        const amountPaid = paymentDetails.amount / 100
        
        // Update user's wallet using Supabase RPC
        const { data: walletData, error } = await supabaseClient.rpc('top_up_wallet', {
          p_user_id: userId,
          p_amount: amountPaid,
          p_description: `Razorpay payment: ${paymentId}`
        })
        
        if (error) {
          console.error('Error topping up wallet:', error)
          throw new Error('Failed to top up wallet: ' + error.message)
        }
        
        console.log(`Successfully topped up wallet for user: ${userId}, amount: ₹${amountPaid}`)
        
        // Return success response
        const result: VerifyPaymentResponse = {
          success: true,
          message: `Successfully added ₹${amountPaid} to your wallet`,
          payment_id: paymentId
        }
        
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        })
      }
      
      default:
        throw new Error('Invalid action')
    }
  } catch (error) {
    console.error('Razorpay function error:', error)
    
    return new Response(JSON.stringify({ 
      success: false, 
      message: error.message || 'An unknown error occurred' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    })
  }
})
