-- Create a trigger function to automatically create notifications for new gift orders
CREATE OR REPLACE FUNCTION public.create_gift_order_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only create notification for gift orders
  IF NEW.gift_type = true THEN
    -- Create in-app notification for the influencer
    INSERT INTO notifications (
      recipient_id,
      type,
      message,
      reference_id,
      sender_id,
      is_read
    ) VALUES (
      NEW.influencer_id,
      'new_gift_request',
      'You have received a new gift request from a fan!',
      NEW.id,
      NEW.sender_id,
      false
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create the trigger on orders table for INSERT events
CREATE TRIGGER trigger_create_gift_order_notification
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION create_gift_order_notification();