-- Create function to get top gifted creators/influencers leaderboard
CREATE OR REPLACE FUNCTION public.get_top_gifted_creators(target_month integer DEFAULT NULL, target_year integer DEFAULT NULL)
RETURNS TABLE(
  influencer_id uuid, 
  influencer_name text, 
  total_gifts_received integer,
  total_amount_received numeric,
  top_fan_id uuid,
  top_fan_name text,
  month text,
  year integer
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  start_date DATE;
  end_date DATE;
  current_month integer;
  current_year integer;
BEGIN
  -- Use current month/year if not provided
  IF target_month IS NULL OR target_year IS NULL THEN
    current_month := EXTRACT(MONTH FROM now());
    current_year := EXTRACT(YEAR FROM now());
  ELSE
    current_month := target_month;
    current_year := target_year;
  END IF;
  
  -- Calculate the start and end dates for the given month and year
  start_date := make_date(current_year, current_month, 1);
  end_date := (start_date + interval '1 month')::date - interval '1 day';
  
  RETURN QUERY
  WITH creator_gift_stats AS (
    SELECT 
      o.influencer_id,
      COUNT(*)::integer as gifts_received,
      SUM(COALESCE(o.total_amount, 0))::numeric as amount_received,
      o.sender_id,
      COUNT(*) as gifts_from_fan,
      ROW_NUMBER() OVER (PARTITION BY o.influencer_id ORDER BY COUNT(*) DESC) as fan_rank
    FROM 
      orders o
    WHERE 
      o.status = 'completed'
      AND o.gift_type = true
      AND o.influencer_id IS NOT NULL
      AND (target_month IS NULL OR (o.completed_at::date >= start_date AND o.completed_at::date <= end_date))
    GROUP BY 
      o.influencer_id, o.sender_id
  ),
  creator_totals AS (
    SELECT 
      cgs.influencer_id,
      SUM(cgs.gifts_received)::integer as total_gifts,
      SUM(cgs.amount_received)::numeric as total_amount
    FROM 
      creator_gift_stats cgs
    GROUP BY 
      cgs.influencer_id
  ),
  creator_top_fans AS (
    SELECT 
      cgs.influencer_id,
      cgs.sender_id as top_fan_id,
      cgs.gifts_from_fan
    FROM 
      creator_gift_stats cgs
    WHERE 
      cgs.fan_rank = 1
  )
  SELECT 
    ct.influencer_id,
    ip.name as influencer_name,
    ct.total_gifts as total_gifts_received,
    ct.total_amount as total_amount_received,
    ctf.top_fan_id,
    p.name as top_fan_name,
    to_char(start_date, 'Month') as month,
    current_year as year
  FROM 
    creator_totals ct
    JOIN influencer_profiles ip ON ip.id = ct.influencer_id
    LEFT JOIN creator_top_fans ctf ON ctf.influencer_id = ct.influencer_id
    LEFT JOIN profiles p ON p.id = ctf.top_fan_id
  ORDER BY 
    ct.total_gifts DESC, ct.total_amount DESC
  LIMIT 20;
END;
$function$;