
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.1";

interface RequestParams {
  action: string;
  userId: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle OPTIONS request for CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role key for admin actions
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing environment variables for Supabase client");
    }
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Get auth header and validate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized: Missing auth header" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    // Extract token from Authorization header
    const token = authHeader.replace("Bearer ", "");
    
    // Verify the token
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized: Invalid token" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }
    
    // Verify user has admin role
    const { data: roles, error: rolesError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin");
      
    if (rolesError) throw rolesError;
    
    if (!roles || roles.length === 0) {
      return new Response(JSON.stringify({ error: "Unauthorized: Admin privileges required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }

    // Parse request body
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      throw new Error("Request must be JSON");
    }
    
    let params: RequestParams;
    try {
      params = await req.json() as RequestParams;
    } catch (e) {
      throw new Error("Invalid JSON in request body");
    }
    
    const { action, userId } = params;

    if (!action || !userId) {
      return new Response(JSON.stringify({ error: "Missing required parameters" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }
    
    // Validate userId
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)) {
      return new Response(JSON.stringify({ error: "Invalid user ID format" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Perform the requested action
    if (action === "delete_user") {
      try {
        // Ensure user exists before trying to delete
        const { data: userExists, error: userCheckError } = await supabaseAdmin.auth.admin.getUserById(userId);
        
        if (userCheckError || !userExists) {
          return new Response(JSON.stringify({ error: "User not found" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 404,
          });
        }
        
        // Delete the user's wallet and transactions first
        await supabaseAdmin
          .from("wallets")
          .delete()
          .eq("user_id", userId);
        
        // Delete user roles
        await supabaseAdmin
          .from("user_roles")
          .delete()
          .eq("user_id", userId);
        
        // Finally delete the user
        const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
        
        if (error) {
          throw new Error(`Failed to delete user: ${error.message}`);
        }
        
        return new Response(JSON.stringify({ success: true, message: "User deleted successfully" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      } catch (actionError) {
        console.error("Error performing delete user action:", actionError);
        throw actionError;
      }
    } else {
      return new Response(JSON.stringify({ error: "Unsupported action" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }
  } catch (error) {
    console.error("Admin action error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
