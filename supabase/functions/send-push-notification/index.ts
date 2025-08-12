import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Helper to resolve influencer (recipient) from an order or gift request after admin approval
async function resolveInfluencerUserId(
  supabase: ReturnType<typeof createClient>,
  {
    orderId,
    giftRequestId,
  }: { orderId?: string; giftRequestId?: string }
): Promise<{ influencerId: string; referenceType: 'order' | 'gift_request'; referenceId: string } | null> {
  // Prefer orderId if provided
  if (orderId) {
    const { data: order, error } = await supabase
      .from('orders')
      .select('id, influencer_id, admin_approved, status')
      .eq('id', orderId)
      .single()

    if (error) {
      console.error('Failed to load order:', error)
      return null
    }

    // Only proceed if admin approved and waiting for influencer
    if (!order?.admin_approved || order?.status !== 'approved_waiting_influencer') {
      console.warn('Order not in approved state for influencer notification', order)
      return null
    }

    return { influencerId: order.influencer_id, referenceType: 'order', referenceId: order.id }
  }

  if (giftRequestId) {
    const { data: gr, error } = await supabase
      .from('gift_requests')
      .select('id, influencer_id, admin_approved, status')
      .eq('id', giftRequestId)
      .single()

    if (error) {
      console.error('Failed to load gift request:', error)
      return null
    }

    // Admin approved gift request typically moves to pending for influencer
    if (!gr?.admin_approved || (gr?.status !== 'pending' && gr?.status !== 'approved')) {
      console.warn('Gift request not in admin-approved state for influencer notification', gr)
      return null
    }

    return { influencerId: gr.influencer_id, referenceType: 'gift_request', referenceId: gr.id }
  }

  return null
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string
    const supabase = createClient(supabaseUrl, supabaseKey)

    const {
      // New expected payload
      orderId,
      giftRequestId,
      title = 'New gift request approved',
      body = 'An admin approved a gift request for you. Please review it.',
      data = {},
      notificationType = 'gift_request_admin_approved',
    } = await req.json()

    // Enforce that this function only handles influencer notifications for admin-approved gift requests
    if (notificationType !== 'gift_request_admin_approved') {
      return new Response(
        JSON.stringify({
          error: "This function only handles 'gift_request_admin_approved' notifications.",
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Resolve recipient (influencer) from either orderId or giftRequestId
    const resolved = await resolveInfluencerUserId(supabase, { orderId, giftRequestId })

    if (!resolved) {
      return new Response(
        JSON.stringify({
          error:
            'Invalid or non-approved reference. Provide a valid orderId (approved_waiting_influencer) or giftRequestId (admin_approved).',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const influencerId = resolved.influencerId

    // Ensure the recipient actually has the influencer role
    const { data: roleRows, error: roleError } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('user_id', influencerId)
      .eq('role', 'influencer')

    if (roleError) {
      console.error('Error checking influencer role:', roleError)
      return new Response(
        JSON.stringify({ error: 'Failed to verify influencer role' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    if (!roleRows || roleRows.length === 0) {
      console.log('Recipient is not an influencer, skipping push')
      return new Response(
        JSON.stringify({ success: true, message: 'Recipient is not an influencer. No push sent.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    // Fetch device tokens for this influencer
    const { data: tokenData, error: tokenError } = await supabase
      .from('device_tokens')
      .select('token')
      .eq('user_id', influencerId)

    if (tokenError) {
      console.error('Error fetching device tokens:', tokenError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch device tokens' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    if (!tokenData || tokenData.length === 0) {
      console.log('No device tokens found for influencer')
      // Still create in-app notification even if no tokens
      await supabase.from('notifications').insert({
        recipient_id: influencerId,
        type: notificationType,
        message: `${title}: ${body}`,
        is_read: false,
        reference_id: resolved.referenceId,
      })

      return new Response(
        JSON.stringify({ success: true, message: 'No device tokens found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    const tokens = tokenData.map((t) => t.token)

    // FCM setup
    const fcmUrl = 'https://fcm.googleapis.com/fcm/send'
    const fcmKey = Deno.env.get('FCM_SERVER_KEY')

    if (!fcmKey) {
      console.error('FCM_SERVER_KEY not configured')
      return new Response(
        JSON.stringify({ error: 'Push notification service not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    console.log(`Sending FCM notifications to ${tokens.length} devices for influencer ${influencerId}`)

    // Send notifications to all tokens
    const promises = tokens.map(async (token) => {
      const message = {
        to: token,
        notification: {
          title,
          body,
        },
        data: {
          type: notificationType,
          referenceType: resolved.referenceType,
          referenceId: resolved.referenceId,
          ...data,
        },
      }

      try {
        const response = await fetch(fcmUrl, {
          method: 'POST',
          headers: {
            Authorization: `key=${fcmKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(message),
        })

        const result = await response.json()
        return { token, success: response.ok, result }
      } catch (error) {
        console.error(`Failed to send to token ${token}:`, error)
        return { token, success: false, error: (error as Error).message }
      }
    })

    const results = await Promise.all(promises)
    const successCount = results.filter((r) => r.success).length

    console.log(`Push notifications sent: ${successCount}/${tokens.length} successful`)

    // Create in-app notification as well
    const { error: notifError } = await supabase.from('notifications').insert({
      recipient_id: influencerId,
      type: notificationType,
      message: `${title}: ${body}`,
      is_read: false,
      reference_id: resolved.referenceId,
    })

    if (notifError) {
      console.error('Error creating in-app notification:', notifError)
    }

    return new Response(
      JSON.stringify({ success: true, sent: successCount, total: tokens.length, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('Error sending push notifications:', error)

    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
