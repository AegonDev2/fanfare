-- Fix the leaderboard function to return proper integer type for total_gifts
CREATE OR REPLACE FUNCTION public.get_monthly_leaderboard(target_month integer, target_year integer)
RETURNS TABLE(
  fan_id uuid,
  fan_name text,
  fan_email text,
  total_gifts integer,  -- Changed back to integer to match interface
  favorite_influencer_id uuid,
  favorite_influencer_name text,
  month text,
  year integer
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  start_date DATE;
  end_date DATE;
BEGIN
  -- Calculate the start and end dates for the given month and year
  start_date := make_date(target_year, target_month, 1);
  end_date := (start_date + interval '1 month')::date - interval '1 day';
  
  RETURN QUERY
  WITH completed_gifts AS (
    SELECT 
      gr.sender_id,
      gr.influencer_id,
      COUNT(*) as gift_count
    FROM 
      gift_requests gr
    WHERE 
      gr.status = 'completed'
      AND gr.completed_at::date >= start_date
      AND gr.completed_at::date <= end_date
    GROUP BY 
      gr.sender_id, gr.influencer_id
  ),
  fan_total_gifts AS (
    SELECT 
      cg.sender_id,
      SUM(cg.gift_count)::integer as total_gifts  -- Cast to integer instead of bigint
    FROM 
      completed_gifts cg
    GROUP BY 
      cg.sender_id
  ),
  fan_favorite_influencer AS (
    SELECT 
      cg.sender_id,
      cg.influencer_id,
      cg.gift_count,
      ROW_NUMBER() OVER (PARTITION BY cg.sender_id ORDER BY cg.gift_count DESC) as rank
    FROM 
      completed_gifts cg
  )
  SELECT 
    p.id as fan_id,
    p.name as fan_name,
    p.email as fan_email,
    ftg.total_gifts,
    ffi.influencer_id as favorite_influencer_id,
    ip.name as favorite_influencer_name,
    to_char(start_date, 'Month') as month,
    target_year as year
  FROM 
    fan_total_gifts ftg
    JOIN profiles p ON p.id = ftg.sender_id
    LEFT JOIN fan_favorite_influencer ffi ON ffi.sender_id = ftg.sender_id AND ffi.rank = 1
    LEFT JOIN influencer_profiles ip ON ip.id = ffi.influencer_id
  ORDER BY 
    ftg.total_gifts DESC;
END;
$$;