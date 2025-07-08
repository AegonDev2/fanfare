-- Add rejection reason column to orders_under_process
ALTER TABLE orders_under_process 
ADD COLUMN rejection_reason TEXT NULL;

-- Create orders_rejected table for rejected orders
CREATE TABLE orders_rejected (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_order_id UUID NOT NULL,
  user_id UUID,
  influencer_id UUID,
  product_url TEXT NOT NULL,
  product_title TEXT,
  product_price NUMERIC,
  platform_fee NUMERIC DEFAULT 5.00,
  total_amount NUMERIC,
  message TEXT,
  shipping_address JSONB,
  rejection_reason TEXT NOT NULL,
  rejected_by TEXT NOT NULL, -- 'admin' or 'influencer'
  rejected_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Enable RLS on orders_rejected
ALTER TABLE orders_rejected ENABLE ROW LEVEL SECURITY;

-- Create policies for orders_rejected
CREATE POLICY "Admins can manage all rejected orders" 
ON orders_rejected 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  )
);

CREATE POLICY "Users can view their own rejected orders" 
ON orders_rejected 
FOR SELECT 
USING (auth.uid() = user_id);

-- Update gift_requests table to add admin_approved and influencer_response columns
ALTER TABLE gift_requests 
ADD COLUMN admin_approved BOOLEAN DEFAULT FALSE,
ADD COLUMN admin_approved_at TIMESTAMP WITH TIME ZONE NULL,
ADD COLUMN influencer_response TEXT NULL, -- 'accepted' or 'rejected'
ADD COLUMN influencer_response_at TIMESTAMP WITH TIME ZONE NULL;

-- Create function to move order from under_process to gift_requests for influencer approval
CREATE OR REPLACE FUNCTION move_order_to_gift_request(order_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
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
    -- Create new gift request
    INSERT INTO gift_requests (
      sender_id,
      influencer_id,
      product_url,
      product_title,
      product_price,
      message,
      status,
      admin_approved,
      admin_approved_at
    ) VALUES (
      v_order.user_id,
      v_order.influencer_id,
      v_order.product_url,
      v_order.product_title,
      v_order.product_price,
      v_order.message,
      'pending',
      TRUE,
      now()
    ) RETURNING id INTO v_gift_request_id;
  ELSE
    -- Update existing gift request
    UPDATE gift_requests 
    SET admin_approved = TRUE,
        admin_approved_at = now(),
        status = 'pending'
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
$$;

-- Create function to reject order with reason
CREATE OR REPLACE FUNCTION reject_order_with_reason(
  order_id UUID, 
  rejection_reason TEXT,
  rejected_by TEXT DEFAULT 'admin'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_order RECORD;
BEGIN
  -- Get the order from orders_under_process
  SELECT * INTO v_order FROM orders_under_process WHERE id = order_id;
  
  IF v_order IS NULL THEN
    RAISE EXCEPTION 'Order not found';
  END IF;
  
  -- Insert into orders_rejected
  INSERT INTO orders_rejected (
    original_order_id,
    user_id,
    influencer_id,
    product_url,
    product_title,
    product_price,
    platform_fee,
    total_amount,
    message,
    shipping_address,
    rejection_reason,
    rejected_by,
    created_at
  ) VALUES (
    order_id,
    v_order.user_id,
    v_order.influencer_id,
    v_order.product_url,
    v_order.product_title,
    v_order.product_price,
    v_order.platform_fee,
    v_order.total_amount,
    v_order.message,
    v_order.shipping_address,
    rejection_reason,
    rejected_by,
    v_order.created_at
  );
  
  -- Delete from orders_under_process
  DELETE FROM orders_under_process WHERE id = order_id;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE;
    RETURN FALSE;
END;
$$;

-- Create function to process wallet deduction when influencer accepts
CREATE OR REPLACE FUNCTION process_influencer_acceptance(gift_request_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_request RECORD;
  v_wallet_id UUID;
  v_total_amount NUMERIC;
BEGIN
  -- Get the gift request
  SELECT * INTO v_request FROM gift_requests WHERE id = gift_request_id;
  
  IF v_request IS NULL THEN
    RAISE EXCEPTION 'Gift request not found';
  END IF;
  
  -- Calculate total amount
  v_total_amount := COALESCE(v_request.product_price, 0) + 5.00; -- 5.00 platform fee
  
  -- Get user's wallet
  SELECT id INTO v_wallet_id FROM wallets WHERE user_id = v_request.sender_id;
  
  IF v_wallet_id IS NULL THEN
    RAISE EXCEPTION 'User wallet not found';
  END IF;
  
  -- Check if user has sufficient balance
  IF (SELECT balance FROM wallets WHERE id = v_wallet_id) < v_total_amount THEN
    RAISE EXCEPTION 'Insufficient wallet balance';
  END IF;
  
  -- Deduct amount from wallet
  UPDATE wallets 
  SET balance = balance - v_total_amount,
      updated_at = now()
  WHERE id = v_wallet_id;
  
  -- Record transaction
  INSERT INTO transactions (
    wallet_id,
    amount,
    type,
    status,
    description,
    reference_id
  ) VALUES (
    v_wallet_id,
    -v_total_amount,
    'payment',
    'completed',
    'Gift order payment: ' || COALESCE(v_request.product_title, 'Gift'),
    gift_request_id
  );
  
  -- Update gift request
  UPDATE gift_requests 
  SET status = 'completed',
      completed_at = now(),
      influencer_response = 'accepted',
      influencer_response_at = now()
  WHERE id = gift_request_id;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE;
    RETURN FALSE;
END;
$$;