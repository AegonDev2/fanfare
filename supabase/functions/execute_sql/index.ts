
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
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

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
    const { sql_query } = await req.json() as RequestParams;

    // More rigorous security checks
    if (!sql_query) {
      throw new Error("SQL query is required");
    }

    // Security check - prevent multiple statements and dangerous SQL
    if (
      sql_query.includes(";") || 
      /drop|truncate|delete\s+from|update|alter|create|insert/i.test(sql_query)
    ) {
      throw new Error("Invalid SQL query detected: Only SELECT statements are allowed");
    }

    // Add forced LIMIT to prevent excessive data return
    let safeQuery = sql_query;
    if (!safeQuery.toLowerCase().includes("limit ")) {
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
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: error.message.includes("Unauthorized") ? 401 : 400,
    });
  }
});
