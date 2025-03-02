
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import puppeteer from 'https://deno.land/x/puppeteer@16.2.0/mod.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0';

// Initialize Supabase client with environment variables
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Get the Axiom AI API key from Supabase secrets
const AXIOM_API_KEY = Deno.env.get('AXIOM_API_KEY') || '';
// Get ecommerce account credentials from Supabase secrets
const AMAZON_EMAIL = Deno.env.get('AMAZON_EMAIL') || '';
const AMAZON_PASSWORD = Deno.env.get('AMAZON_PASSWORD') || '';
const FLIPKART_EMAIL = Deno.env.get('FLIPKART_EMAIL') || '';
const FLIPKART_PASSWORD = Deno.env.get('FLIPKART_PASSWORD') || '';

interface RequestBody {
  orderId: string;
  productUrl: string;
  platform?: 'amazon' | 'flipkart';
  shippingAddress: {
    name: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    phone?: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Get the request body
    const requestData = await req.json() as RequestBody;
    
    if (!requestData.orderId || !requestData.productUrl) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Order ID and product URL are required" 
        }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 400 }
      );
    }

    // Detect platform if not provided
    const platform = requestData.platform || detectPlatform(requestData.productUrl);
    
    if (!platform) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Unsupported platform. Currently only Amazon and Flipkart are supported." 
        }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 400 }
      );
    }

    console.log(`Order automation: Processing order ${requestData.orderId} for ${platform}`);

    // Update order log in database
    await logOrderEvent(requestData.orderId, "started", "Order automation started");

    // If using Axiom API (via external API):
    if (AXIOM_API_KEY) {
      try {
        const axiomResponse = await fetch('https://api.axiom.ai/v1/order-automation', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${AXIOM_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            productUrl: requestData.productUrl,
            platform: platform,
            shippingAddress: requestData.shippingAddress,
            credentials: {
              email: platform === 'amazon' ? AMAZON_EMAIL : FLIPKART_EMAIL,
              password: platform === 'amazon' ? AMAZON_PASSWORD : FLIPKART_PASSWORD
            }
          })
        });

        if (!axiomResponse.ok) {
          const errorData = await axiomResponse.json();
          console.error('Axiom API error:', errorData);
          
          // Log error to database
          await logOrderEvent(requestData.orderId, "error", `Axiom API error: ${errorData.message || 'Unknown error'}`);
          
          throw new Error(errorData.message || 'Failed to process order through Axiom API');
        }

        const data = await axiomResponse.json();
        
        // Log success to database
        await logOrderEvent(requestData.orderId, "completed", "Order successfully placed through Axiom API");
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: "Order successfully processed through Axiom API",
            orderDetails: data.orderDetails 
          }),
          { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      } catch (error) {
        console.error('Error calling Axiom API:', error);
        
        // Log the fallback attempt
        await logOrderEvent(requestData.orderId, "info", "Axiom API failed, attempting manual processing");
      }
    }

    // Fallback or if no API key: Log that we need manual processing
    await logOrderEvent(
      requestData.orderId, 
      "pending", 
      "Order queued for manual processing by support team"
    );
    
    // Update order status to "processing" in the database
    const { error } = await supabase
      .from('orders')
      .update({ 
        status: "processing",
        order_notes: "Order queued for manual processing by support team"
      })
      .eq('id', requestData.orderId);
    
    if (error) {
      console.error("Error updating order status:", error);
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Order queued for manual processing",
        automated: false
      }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
    
  } catch (error) {
    console.error(`Error processing request: ${error.message}`);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: `Server error: ${error.message}` 
      }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
    );
  }
});

// Helper function to detect platform from URL
function detectPlatform(url: string): 'amazon' | 'flipkart' | undefined {
  if (url.includes('amazon')) return 'amazon';
  if (url.includes('flipkart')) return 'flipkart';
  return undefined;
}

// Helper function to log order events to the database
async function logOrderEvent(orderId: string, eventType: string, eventDescription: string) {
  try {
    const { error } = await supabase
      .from('order_events')
      .insert({
        order_id: orderId,
        event_type: eventType,
        event_description: eventDescription
      });
    
    if (error) {
      console.error(`Error logging order event: ${error.message}`);
    }
  } catch (err) {
    console.error(`Exception logging order event: ${err.message}`);
  }
}
