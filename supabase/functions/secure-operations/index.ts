
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.1";

interface RequestParams {
  operation: string;
  tableId: string;
  recordId?: string;
  data?: any;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle OPTIONS request for CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role key for admin operations
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Create client with auth token for user verification
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error("Unauthorized: Invalid token");
    }

    // Parse request body
    const { operation, tableId, recordId, data } = await req.json() as RequestParams;
    
    if (!operation || !tableId) {
      throw new Error("Missing required parameters");
    }

    // Process the secure operation
    let result;
    switch (operation) {
      case "get":
        // Get a specific record with permission check
        result = await getSecureRecord(supabaseAdmin, tableId, recordId!, user.id);
        break;
      
      case "update":
        // Update a record with permission check
        result = await updateSecureRecord(supabaseAdmin, tableId, recordId!, data, user.id);
        break;
        
      case "delete":
        // Delete a record with permission check
        result = await deleteSecureRecord(supabaseAdmin, tableId, recordId!, user.id);
        break;
        
      default:
        throw new Error("Unsupported operation");
    }
    
    return new Response(JSON.stringify({ success: true, data: result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Secure operation error:", error);
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message || "An unknown error occurred" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: error.message === "Unauthorized: Invalid token" ? 401 : 400,
    });
  }
});

// Function to check if user has access to a record
async function checkRecordAccess(supabase, tableId, recordId, userId) {
  // Different permission checks for different tables
  switch (tableId) {
    case "gift_requests":
      const { data: giftRequest } = await supabase
        .from(tableId)
        .select("sender_id, influencer_id")
        .eq("id", recordId)
        .single();
        
      return giftRequest && (giftRequest.sender_id === userId || giftRequest.influencer_id === userId);
      
    case "orders_under_process":
    case "orders_completed":
      const { data: order } = await supabase
        .from(tableId)
        .select("user_id")
        .eq("id", recordId)
        .single();
        
      return order && order.user_id === userId;
      
    // Add cases for other tables as needed
    
    default:
      return false;
  }
}

// Get a record securely
async function getSecureRecord(supabase, tableId, recordId, userId) {
  const hasAccess = await checkRecordAccess(supabase, tableId, recordId, userId);
  
  if (!hasAccess) {
    throw new Error("Unauthorized access to record");
  }
  
  const { data, error } = await supabase
    .from(tableId)
    .select("*")
    .eq("id", recordId)
    .single();
    
  if (error) throw error;
  return data;
}

// Update a record securely
async function updateSecureRecord(supabase, tableId, recordId, updateData, userId) {
  const hasAccess = await checkRecordAccess(supabase, tableId, recordId, userId);
  
  if (!hasAccess) {
    throw new Error("Unauthorized access to record");
  }
  
  // Prevent updating critical fields
  delete updateData.id;
  delete updateData.user_id;
  delete updateData.sender_id;
  delete updateData.influencer_id;
  delete updateData.created_at;
  
  const { data, error } = await supabase
    .from(tableId)
    .update(updateData)
    .eq("id", recordId)
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

// Delete a record securely
async function deleteSecureRecord(supabase, tableId, recordId, userId) {
  const hasAccess = await checkRecordAccess(supabase, tableId, recordId, userId);
  
  if (!hasAccess) {
    throw new Error("Unauthorized access to record");
  }
  
  const { error } = await supabase
    .from(tableId)
    .delete()
    .eq("id", recordId);
    
  if (error) throw error;
  return { id: recordId, deleted: true };
}
