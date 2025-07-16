-- Add delivery_estimate column to gift_requests table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gift_requests' AND column_name = 'delivery_estimate') THEN
        ALTER TABLE gift_requests ADD COLUMN delivery_estimate DATE;
    END IF;
END $$;

-- Update the move_order_to_gift_request function to accept delivery_estimate parameter
CREATE OR REPLACE FUNCTION public.move_order_to_gift_request(order_id uuid, delivery_estimate date DEFAULT NULL)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_order RECORD;
  v_gift_request_id UUID;
BEGIN
  -- Get the order from orders_under_process
  SELECT * INTO v_order FROM orders_under_process WHERE id = order_id;
  
  IF v_order IS NULL THEN
    RAISE EXCEPTION 'Order not found';
  END IF;
  
  -- Check if gift request already exists
  SELECT id INTO v_gift_request_id 
  FROM gift_requests 
  WHERE product_url = v_order.product_url 
    AND sender_id = v_order.user_id 
    AND influencer_id = v_order.influencer_id
    AND message = v_order.message;
  
  IF v_gift_request_id IS NULL THEN
    -- Create new gift request with the same ID to maintain continuity
    INSERT INTO gift_requests (
      id,
      sender_id,
      influencer_id,
      product_url,
      product_title,
      product_price,
      message,
      status,
      admin_approved,
      admin_approved_at,
      delivery_estimate,
      created_at
    ) VALUES (
      order_id,  -- Use the same ID for continuity
      v_order.user_id,
      v_order.influencer_id,
      v_order.product_url,
      v_order.product_title,
      v_order.product_price,
      v_order.message,
      'pending',
      TRUE,
      now(),
      delivery_estimate,
      v_order.created_at  -- Preserve original creation time
    );
  ELSE
    -- Update existing gift request
    UPDATE gift_requests 
    SET admin_approved = TRUE,
        admin_approved_at = now(),
        status = 'pending',
        delivery_estimate = COALESCE(delivery_estimate, delivery_estimate)
    WHERE id = v_gift_request_id;
  END IF;
  
  -- Delete the order from orders_under_process  
  DELETE FROM orders_under_process WHERE id = order_id;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE;
    RETURN FALSE;
END;
$function$;