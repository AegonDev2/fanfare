-- Create materialized view for monthly leaderboard
CREATE MATERIALIZED VIEW mv_monthly_leaderboard AS
WITH completed_gifts AS (
  SELECT 
    DATE_TRUNC('month', o.completed_at) as month,
    o.sender_id,
    o.influencer_id,
    COUNT(*) as gift_count
  FROM orders o
  WHERE o.status = 'completed'
    AND o.gift_type = true
    AND o.completed_at IS NOT NULL
  GROUP BY DATE_TRUNC('month', o.completed_at), o.sender_id, o.influencer_id
),
fan_total_gifts AS (
  SELECT 
    cg.month,
    cg.sender_id,
    SUM(cg.gift_count)::integer as total_gifts
  FROM completed_gifts cg
  GROUP BY cg.month, cg.sender_id
),
fan_favorite_influencer AS (
  SELECT 
    cg.month,
    cg.sender_id,
    cg.influencer_id,
    cg.gift_count,
    ROW_NUMBER() OVER (PARTITION BY cg.month, cg.sender_id ORDER BY cg.gift_count DESC) as rank
  FROM completed_gifts cg
)
SELECT 
  EXTRACT(MONTH FROM ftg.month)::integer as target_month,
  EXTRACT(YEAR FROM ftg.month)::integer as target_year,
  p.id as fan_id,
  p.name as fan_name,
  p.email as fan_email,
  ftg.total_gifts,
  ffi.influencer_id as favorite_influencer_id,
  ip.name as favorite_influencer_name,
  to_char(ftg.month, 'Month') as month,
  EXTRACT(YEAR FROM ftg.month)::integer as year
FROM fan_total_gifts ftg
JOIN profiles p ON p.id = ftg.sender_id
LEFT JOIN fan_favorite_influencer ffi ON ffi.month = ftg.month AND ffi.sender_id = ftg.sender_id AND ffi.rank = 1
LEFT JOIN influencer_profiles ip ON ip.id = ffi.influencer_id;

-- Create indexes on materialized view
CREATE INDEX idx_mv_leaderboard_month_year ON mv_monthly_leaderboard(target_month, target_year);
CREATE INDEX idx_mv_leaderboard_total_gifts ON mv_monthly_leaderboard(target_month, target_year, total_gifts DESC);

-- Create function to refresh leaderboard materialized view
CREATE OR REPLACE FUNCTION refresh_leaderboard_mv()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW mv_monthly_leaderboard;
END;
$$;

-- Update get_monthly_leaderboard to use materialized view
CREATE OR REPLACE FUNCTION public.get_monthly_leaderboard(target_month integer, target_year integer)
RETURNS TABLE(fan_id uuid, fan_name text, fan_email text, total_gifts integer, favorite_influencer_id uuid, favorite_influencer_name text, month text, year integer)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    mv.fan_id,
    mv.fan_name,
    mv.fan_email,
    mv.total_gifts,
    mv.favorite_influencer_id,
    mv.favorite_influencer_name,
    mv.month,
    mv.year
  FROM mv_monthly_leaderboard mv
  WHERE mv.target_month = get_monthly_leaderboard.target_month
    AND mv.target_year = get_monthly_leaderboard.target_year
  ORDER BY mv.total_gifts DESC;
$$;