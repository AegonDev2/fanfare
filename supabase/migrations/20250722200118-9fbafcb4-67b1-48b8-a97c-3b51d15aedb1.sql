-- Create a view for public top fans data that doesn't expose sensitive information
CREATE OR REPLACE VIEW public.influencer_top_fans AS
SELECT 
  o.influencer_id,
  o.sender_id as fan_id,
  p.name as fan_name,
  p.email as fan_email,
  fp.profile_image_url,
  COUNT(*) as total_gifts
FROM orders o
JOIN profiles p ON o.sender_id = p.id
LEFT JOIN fan_profiles fp ON o.sender_id = fp.user_id
WHERE o.status = 'completed' 
  AND o.gift_type = true
GROUP BY o.influencer_id, o.sender_id, p.name, p.email, fp.profile_image_url;

-- Enable RLS on the view
ALTER VIEW public.influencer_top_fans SET (security_invoker = on);

-- Create a policy to allow everyone to view top fans data
CREATE POLICY "Anyone can view top fans data" 
  ON public.influencer_top_fans
  FOR SELECT 
  USING (true);