-- Create unified function to fetch complete user data in one call
CREATE OR REPLACE FUNCTION public.get_complete_user_data(user_uuid uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  result jsonb;
  profile_data jsonb;
  influencer_data jsonb;
  fan_data jsonb;
  user_roles_data jsonb;
  wallet_data jsonb;
BEGIN
  -- Get basic profile
  SELECT to_jsonb(p.*) INTO profile_data
  FROM profiles p
  WHERE p.id = user_uuid;
  
  -- Get influencer profile if exists
  SELECT to_jsonb(ip.*) INTO influencer_data
  FROM influencer_profiles ip
  WHERE ip.id = user_uuid;
  
  -- Get fan profile if exists
  SELECT to_jsonb(fp.*) INTO fan_data
  FROM fan_profiles fp
  WHERE fp.user_id = user_uuid;
  
  -- Get user roles
  SELECT jsonb_agg(ur.role) INTO user_roles_data
  FROM user_roles ur
  WHERE ur.user_id = user_uuid;
  
  -- Get wallet data
  SELECT to_jsonb(w.*) INTO wallet_data
  FROM wallets w
  WHERE w.user_id = user_uuid;
  
  -- Combine all data
  result := jsonb_build_object(
    'profile', profile_data,
    'influencer_profile', influencer_data,
    'fan_profile', fan_data,
    'roles', COALESCE(user_roles_data, '[]'::jsonb),
    'wallet', wallet_data
  );
  
  RETURN result;
END;
$function$;

-- Add performance indexes for faster lookups
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_fan_profiles_user_id ON fan_profiles(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_influencer_profiles_id ON influencer_profiles(id);