
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.1";

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
    // Get the URL params
    const url = new URL(req.url);
    const targetMonth = url.searchParams.get("month");
    const targetYear = url.searchParams.get("year");
    
    // Get authorization header from the request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Create Supabase client with the auth token
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    
    // Extract the JWT token from the authorization header
    const token = authHeader.replace("Bearer ", "");
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    // Get today's date if month/year not provided
    const today = new Date();
    const month = targetMonth ? parseInt(targetMonth) : today.getMonth() + 1;
    const year = targetYear ? parseInt(targetYear) : today.getFullYear();

    // Calculate the start and end of the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // Last day of the month

    // Format dates for the query
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    // Query to get the top fans who completed gifts in the specified month
    // First, get the completed gift requests
    const { data: giftRequests, error: giftError } = await supabase
      .from('gift_requests')
      .select(`
        id,
        sender_id,
        influencer_id,
        completed_at,
        status
      `)
      .eq('status', 'completed')
      .gte('completed_at', startDateStr)
      .lte('completed_at', endDateStr + 'T23:59:59')
      .order('completed_at', { ascending: false });

    if (giftError) {
      throw giftError;
    }

    // Group gifts by sender and count them
    const fanGiftCount: Record<string, { 
      count: number, 
      influencerCounts: Record<string, number>,
      topInfluencerId?: string
    }> = {};

    giftRequests?.forEach(gift => {
      // Count total gifts for each fan
      if (!fanGiftCount[gift.sender_id]) {
        fanGiftCount[gift.sender_id] = { count: 0, influencerCounts: {} };
      }
      fanGiftCount[gift.sender_id].count += 1;
      
      // Count gifts to each influencer
      if (!fanGiftCount[gift.sender_id].influencerCounts[gift.influencer_id]) {
        fanGiftCount[gift.sender_id].influencerCounts[gift.influencer_id] = 0;
      }
      fanGiftCount[gift.sender_id].influencerCounts[gift.influencer_id] += 1;
    });
    
    // Find the favorite influencer for each fan
    Object.keys(fanGiftCount).forEach(fanId => {
      const influencerCounts = fanGiftCount[fanId].influencerCounts;
      let maxCount = 0;
      let favoriteInfluencerId: string | undefined = undefined;
      
      Object.entries(influencerCounts).forEach(([influencerId, count]) => {
        if (count > maxCount) {
          maxCount = count;
          favoriteInfluencerId = influencerId;
        }
      });
      
      fanGiftCount[fanId].topInfluencerId = favoriteInfluencerId;
    });

    // Convert to array and sort by gift count
    const sortedFans = Object.entries(fanGiftCount)
      .map(([fanId, data]) => ({
        fan_id: fanId,
        total_gifts: data.count,
        favorite_influencer_id: data.topInfluencerId || null
      }))
      .sort((a, b) => b.total_gifts - a.total_gifts);
    
    if (sortedFans.length === 0) {
      return new Response(
        JSON.stringify([]), 
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get fan and influencer details
    const leaderboardEntries = await Promise.all(sortedFans.map(async (fan) => {
      // Get fan details
      const { data: fanData } = await supabase
        .from('profiles')
        .select('name, email')
        .eq('id', fan.fan_id)
        .single();
      
      // Get influencer details if available
      let influencerName = null;
      if (fan.favorite_influencer_id) {
        const { data: influencerData } = await supabase
          .from('influencer_profiles')
          .select('name')
          .eq('id', fan.favorite_influencer_id)
          .single();
        
        influencerName = influencerData?.name || null;
      }
      
      return {
        fan_id: fan.fan_id,
        fan_name: fanData?.name,
        fan_email: fanData?.email || "Unknown email",
        total_gifts: fan.total_gifts,
        favorite_influencer_id: fan.favorite_influencer_id,
        favorite_influencer_name: influencerName,
        month: new Intl.DateTimeFormat('en-US', { month: 'long' }).format(startDate),
        year: year
      };
    }));
    
    // Return the data
    return new Response(
      JSON.stringify(leaderboardEntries),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing leaderboard request:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "An unknown error occurred" 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
