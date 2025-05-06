
-- Fix the return type in the leaderboard function
CREATE OR REPLACE FUNCTION public.get_monthly_leaderboard(target_month integer, target_year integer)
RETURNS TABLE(
  fan_id uuid,
  fan_name text,
  fan_email text,
  total_gifts bigint,
  favorite_influencer_id uuid,
  favorite_influencer_name text,
  month text,
  year integer
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH gift_counts AS (
    SELECT
      sender_id,
      COUNT(*) AS gift_count,
      EXTRACT(MONTH FROM created_at) AS month,
      EXTRACT(YEAR FROM created_at) AS year
    FROM orders_completed
    WHERE 
      EXTRACT(MONTH FROM created_at) = target_month AND
      EXTRACT(YEAR FROM created_at) = target_year
    GROUP BY sender_id, EXTRACT(MONTH FROM created_at), EXTRACT(YEAR FROM created_at)
  ),
  
  favorite_influencers AS (
    SELECT
      sender_id,
      influencer_id,
      COUNT(*) AS gift_count
    FROM orders_completed
    WHERE 
      EXTRACT(MONTH FROM created_at) = target_month AND
      EXTRACT(YEAR FROM created_at) = target_year
    GROUP BY sender_id, influencer_id
    ORDER BY COUNT(*) DESC
  ),
  
  top_influencer_per_fan AS (
    SELECT DISTINCT ON (sender_id)
      sender_id,
      influencer_id
    FROM favorite_influencers
    ORDER BY sender_id, gift_count DESC
  )
  
  SELECT
    gc.sender_id AS fan_id,
    p.name AS fan_name,
    p.email AS fan_email,
    gc.gift_count AS total_gifts,
    tip.influencer_id AS favorite_influencer_id,
    ip.name AS favorite_influencer_name,
    TO_CHAR(TO_DATE(gc.month::text, 'MM'), 'Month') AS month,
    gc.year::integer AS year
  FROM gift_counts gc
  JOIN profiles p ON gc.sender_id = p.id
  LEFT JOIN top_influencer_per_fan tip ON gc.sender_id = tip.sender_id
  LEFT JOIN influencer_profiles ip ON tip.influencer_id = ip.id
  ORDER BY gc.gift_count DESC;
END;
$$;
