-- Fix Function Search Path Mutable warning by updating functions without SET search_path
-- This prevents potential security issues from search_path manipulation

-- Update auto_assign_user_role function
CREATE OR REPLACE FUNCTION public.auto_assign_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- When a new profile is created, add the corresponding role to user_roles table
  INSERT INTO user_roles (user_id, role)
  VALUES (
    NEW.id,
    CASE 
      WHEN LOWER(NEW.user_type) = 'fan' THEN 'fan'::app_role
      WHEN LOWER(NEW.user_type) = 'influencer' THEN 'influencer'::app_role
      WHEN LOWER(NEW.user_type) = 'admin' THEN 'admin'::app_role
      ELSE 'fan'::app_role -- Default to fan if user_type is not recognized
    END
  );
  RETURN NEW;
END;
$function$;

-- Update check_primary_address function
CREATE OR REPLACE FUNCTION public.check_primary_address()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
    IF NEW.is_primary THEN
        UPDATE influencer_addresses
        SET is_primary = false
        WHERE influencer_id = NEW.influencer_id
        AND id != NEW.id
        AND is_primary = true;
    END IF;
    RETURN NEW;
END;
$function$;

-- Update handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO profiles (id, email, user_type, name)
  VALUES (
    new.id,
    new.email,
    COALESCE(
      (new.raw_user_meta_data->>'user_type')::text,
      'fan'
    ),
    new.raw_user_meta_data->>'name'
  );
  RETURN new;
END;
$function$;

-- Update update_gift_completed_timestamp function
CREATE OR REPLACE FUNCTION public.update_gift_completed_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status != 'completed' OR OLD.status IS NULL) THEN
    NEW.completed_at = now();
  END IF;
  RETURN NEW;
END;
$function$;

-- Update update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

-- Update update_orders_updated_at function
CREATE OR REPLACE FUNCTION public.update_orders_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  -- Add status change to history
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    NEW.status_history = COALESCE(OLD.status_history, '[]'::jsonb) || 
      jsonb_build_object(
        'from_status', OLD.status,
        'to_status', NEW.status,
        'changed_at', now(),
        'changed_by', auth.uid()
      );
  END IF;
  RETURN NEW;
END;
$function$;

-- Update migrate_gift_requests_to_orders function to have proper search path
CREATE OR REPLACE FUNCTION public.migrate_gift_requests_to_orders()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    -- Function logic would go here if needed
    -- This function currently has empty logic
    RETURN;
END;
$function$;