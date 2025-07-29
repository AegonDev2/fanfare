-- Fix remaining functions with search_path issues

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

CREATE OR REPLACE FUNCTION public.update_order_status(order_id uuid, new_status text, delivery_estimate date DEFAULT NULL::date, rejection_reason text DEFAULT NULL::text, influencer_response text DEFAULT NULL::text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  current_order RECORD;
BEGIN
  -- Get current order
  SELECT * INTO current_order FROM orders WHERE id = order_id;
  
  IF current_order IS NULL THEN
    RAISE EXCEPTION 'Order not found';
  END IF;
  
  -- Update order with new status and relevant fields
  UPDATE orders SET
    status = new_status,
    admin_approved_at = CASE WHEN new_status = 'approved_waiting_influencer' THEN now() ELSE admin_approved_at END,
    influencer_response_at = CASE WHEN new_status IN ('accepted', 'rejected_by_influencer') THEN now() ELSE influencer_response_at END,
    completed_at = CASE WHEN new_status = 'completed' THEN now() ELSE completed_at END,
    cancelled_at = CASE WHEN new_status = 'cancelled_by_user' THEN now() ELSE cancelled_at END,
    delivery_estimate = COALESCE(delivery_estimate, orders.delivery_estimate),
    rejection_reason = COALESCE(rejection_reason, orders.rejection_reason),
    influencer_response = COALESCE(influencer_response, orders.influencer_response),
    rejected_by = CASE WHEN new_status LIKE 'rejected_%' THEN 
      CASE WHEN new_status = 'rejected_by_admin' THEN 'admin' ELSE 'influencer' END
      ELSE rejected_by END
  WHERE id = order_id;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE;
    RETURN FALSE;
END;
$function$;

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