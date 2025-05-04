
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.1";

interface RequestParams {
  sql_query: string;
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
    // Create Supabase client with service role key for full access
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing environment variables for Supabase client");
    }

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the user has admin privileges
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error("Unauthorized: Invalid token");
    }

    // Verify the user has admin role
    const { data: roles, error: rolesError } = await supabaseClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin");
      
    if (rolesError) throw rolesError;
    
    if (!roles || roles.length === 0) {
      throw new Error("Unauthorized: Admin privileges required");
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
    
    const { sql_query } = params;

    // More rigorous security checks
    if (!sql_query || typeof sql_query !== 'string') {
      throw new Error("SQL query is required and must be a string");
    }

    // Enhanced security check to prevent dangerous SQL
    if (
      sql_query.includes(";") || 
      /\b(drop|truncate|delete\s+from|update|alter|create|insert|grant|revoke)\b/i.test(sql_query) ||
      !sql_query.trim().toLowerCase().startsWith("select ")
    ) {
      throw new Error("Invalid SQL query detected: Only SELECT statements are allowed");
    }

    // Add forced LIMIT to prevent excessive data return
    let safeQuery = sql_query.trim();
    if (!safeQuery.toLowerCase().includes(" limit ")) {
      safeQuery += " LIMIT 1000";
    }

    // Execute SQL query
    const { data, error } = await supabaseClient
      .rpc("query_raw", { query: safeQuery });

    if (error) {
      throw error;
    }

    // Return response
    return new Response(JSON.stringify({ data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error executing SQL:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "An unknown error occurred" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: error instanceof Error && error.message.includes("Unauthorized") ? 401 : 400,
    });
  }
});
