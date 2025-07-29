-- Fix the last function and create comprehensive admin security

-- Find and fix the last function with search_path issue
CREATE OR REPLACE FUNCTION public.query_raw(query text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  result JSONB;
BEGIN
  EXECUTE 'SELECT json_agg(t) FROM (' || query || ') t' INTO result;
  RETURN result;
EXCEPTION WHEN OTHERS THEN
  RAISE;
END;
$function$;

-- Create enhanced admin verification function
CREATE OR REPLACE FUNCTION public.verify_admin_access()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  user_id UUID;
  is_valid_admin BOOLEAN := FALSE;
BEGIN
  -- Get current user ID
  user_id := auth.uid();
  
  IF user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check if user has admin role
  SELECT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = verify_admin_access.user_id 
    AND role = 'admin'::app_role
  ) INTO is_valid_admin;
  
  -- Log admin access attempt
  INSERT INTO audit_logs (user_id, action, table_name, new_values)
  VALUES (
    user_id, 
    'ADMIN_ACCESS_CHECK', 
    'admin_verification',
    jsonb_build_object('success', is_valid_admin, 'timestamp', now())
  );
  
  RETURN is_valid_admin;
END;
$function$;

-- Create secure admin session verification
CREATE OR REPLACE FUNCTION public.create_admin_session_token()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  user_id UUID;
  session_token TEXT;
  expires_at TIMESTAMP;
BEGIN
  user_id := auth.uid();
  
  -- Verify admin access first
  IF NOT verify_admin_access() THEN
    RAISE EXCEPTION 'Access denied: User is not an admin';
  END IF;
  
  -- Generate secure session token
  session_token := encode(gen_random_bytes(32), 'hex');
  expires_at := now() + interval '1 hour';
  
  -- Store session in audit log for tracking
  INSERT INTO audit_logs (user_id, action, table_name, new_values)
  VALUES (
    user_id, 
    'ADMIN_SESSION_CREATED', 
    'admin_sessions',
    jsonb_build_object(
      'session_token', session_token,
      'expires_at', expires_at,
      'created_at', now()
    )
  );
  
  RETURN session_token;
END;
$function$;