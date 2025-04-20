
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

    const { type, recipientId, senderId, giftRequestId, message } = await req.json()

    // Validate required data
    if (!type || !message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    console.log(`Creating notification: ${message}`)

    // If recipientId is null and type is new_approved_gift, send to all admins
    if (recipientId === null && type === 'new_approved_gift') {
      // Get all admin users
      const { data: adminRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin')

      if (rolesError) {
        throw new Error(`Failed to fetch admin users: ${rolesError.message}`)
      }

      if (!adminRoles || adminRoles.length === 0) {
        console.log('No admin users found to notify')
        return new Response(
          JSON.stringify({ success: true, message: 'No admin users found to notify' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )
      }

      // Create notifications for all admin users
      const notifications = adminRoles.map(admin => ({
        type,
        recipient_id: admin.user_id,
        sender_id: senderId,
        reference_id: giftRequestId,
        message,
        is_read: false
      }))

      const { data, error } = await supabase
        .from('notifications')
        .insert(notifications)

      if (error) {
        console.error('Database error when inserting admin notifications:', error)
        throw error
      }

      console.log(`Admin notifications created successfully for ${notifications.length} admins`)
    } else {
      // Regular notification to a specific recipient
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          type,
          recipient_id: recipientId,
          sender_id: senderId,
          reference_id: giftRequestId,
          message,
          is_read: false
        })

      if (error) {
        console.error('Database error when inserting notification:', error)
        throw error
      }

      console.log(`Notification created successfully for recipient ${recipientId}`)
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('Error processing notification:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
