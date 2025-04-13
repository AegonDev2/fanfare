
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

    // Parse request body
    const { sql_query } = await req.json() as RequestParams;

    // Security check - prevent multiple statements and dangerous SQL
    if (sql_query.includes(";") || /drop|truncate|delete\s+from|update/i.test(sql_query)) {
      throw new Error("Invalid SQL query detected");
    }

    // Execute SQL query
    const { data, error } = await supabaseClient
      .rpc("query_raw", { query: sql_query });

    if (error) {
      throw error;
    }

    // Return response
    return new Response(JSON.stringify({ data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
