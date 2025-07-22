-- Create a security definer function to get top fans data that bypasses RLS
CREATE OR REPLACE FUNCTION public.get_influencer_top_fans(influencer_id_param uuid)
RETURNS TABLE(
  fan_id uuid,
  fan_name text,
  fan_email text,
  profile_image_url text,
  total_gifts integer
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH fan_gift_counts AS (
    SELECT 
      o.sender_id,
      COUNT(*)::integer as gift_count
    FROM orders o
    WHERE o.influencer_id = influencer_id_param
      AND o.status = 'completed'
      AND o.gift_type = true
    GROUP BY o.sender_id
  )
  SELECT 
    fgc.sender_id as fan_id,
    COALESCE(p.name, 'Anonymous Fan') as fan_name,
    p.email as fan_email,
    fp.profile_image_url,
    fgc.gift_count as total_gifts
  FROM fan_gift_counts fgc
  JOIN profiles p ON p.id = fgc.sender_id
  LEFT JOIN fan_profiles fp ON fp.user_id = fgc.sender_id
  ORDER BY fgc.gift_count DESC
  LIMIT 4;
END;
$$;