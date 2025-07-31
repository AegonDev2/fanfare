-- Fix the verify_admin_access function to resolve ambiguous column reference
CREATE OR REPLACE FUNCTION public.verify_admin_access()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  current_user_id UUID;
  is_valid_admin BOOLEAN := FALSE;
BEGIN
  -- Get current user ID
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check if user has admin role
  SELECT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = current_user_id 
    AND role = 'admin'::app_role
  ) INTO is_valid_admin;
  
  -- Log admin access attempt
  INSERT INTO audit_logs (user_id, action, table_name, new_values)
  VALUES (
    current_user_id, 
    'ADMIN_ACCESS_CHECK', 
    'admin_verification',
    jsonb_build_object('success', is_valid_admin, 'timestamp', now())
  );
  
  RETURN is_valid_admin;
END;
$function$;