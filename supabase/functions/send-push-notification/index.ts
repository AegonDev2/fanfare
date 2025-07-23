import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
      userIds, 
      title, 
      body, 
      data, 
      notificationType = 'general' 
    } = await req.json()

    // Validate required data
    if (!title || !body) {
      return new Response(
        JSON.stringify({ error: 'Title and body are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    console.log(`Sending push notifications to ${userIds?.length || 'all'} users`)

    // Get device tokens based on user IDs or all tokens
    let tokensQuery = supabase.from('device_tokens').select('token, user_id')
    
    if (userIds && userIds.length > 0) {
      tokensQuery = tokensQuery.in('user_id', userIds)
    }

    const { data: tokenData, error: tokenError } = await tokensQuery

    if (tokenError) {
      console.error('Error fetching device tokens:', tokenError)
      throw new Error(`Failed to fetch device tokens: ${tokenError.message}`)
    }

    if (!tokenData || tokenData.length === 0) {
      console.log('No device tokens found')
      return new Response(
        JSON.stringify({ success: true, message: 'No device tokens found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    // Prepare FCM messages
    const tokens = tokenData.map(t => t.token)
    
    // For this example, we'll use Firebase Admin SDK approach
    // Note: In production, you'd want to use proper FCM credentials
    const fcmUrl = 'https://fcm.googleapis.com/fcm/send'
    const fcmKey = Deno.env.get('FCM_SERVER_KEY') // You'll need to set this
    
    if (!fcmKey) {
      console.error('FCM_SERVER_KEY not configured')
      return new Response(
        JSON.stringify({ error: 'Push notification service not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

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
          ...data
        }
      }

      try {
        const response = await fetch(fcmUrl, {
          method: 'POST',
          headers: {
            'Authorization': `key=${fcmKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(message)
        })
        
        const result = await response.json()
        return { token, success: response.ok, result }
      } catch (error) {
        console.error(`Failed to send to token ${token}:`, error)
        return { token, success: false, error: error.message }
      }
    })

    const results = await Promise.all(promises)
    const successCount = results.filter(r => r.success).length

    console.log(`Push notifications sent: ${successCount}/${tokens.length} successful`)

    // Also create in-app notifications
    if (userIds && userIds.length > 0) {
      const notifications = userIds.map(userId => ({
        recipient_id: userId,
        type: notificationType,
        message: `${title}: ${body}`,
        is_read: false
      }))

      const { error: notifError } = await supabase
        .from('notifications')
        .insert(notifications)

      if (notifError) {
        console.error('Error creating in-app notifications:', notifError)
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        sent: successCount,
        total: tokens.length,
        results 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('Error sending push notifications:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})