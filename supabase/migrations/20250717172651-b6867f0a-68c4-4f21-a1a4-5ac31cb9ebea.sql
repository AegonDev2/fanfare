-- Add fields to orders table to support gift request functionality
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS admin_approved BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS sender_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS gift_type BOOLEAN DEFAULT false;

-- Add index for efficient querying
CREATE INDEX IF NOT EXISTS idx_orders_influencer_gift ON orders(influencer_id, gift_type) WHERE gift_type = true;
CREATE INDEX IF NOT EXISTS idx_orders_sender_gift ON orders(sender_id, gift_type) WHERE gift_type = true;

-- Update status values to match gift request statuses
-- The orders table already has flexible status field that can handle these values

-- Create a function to migrate gift_requests data to orders table
CREATE OR REPLACE FUNCTION migrate_gift_requests_to_orders()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Migrate existing gift_requests to orders table
  INSERT INTO orders (
    id,
    user_id,
    sender_id,
    influencer_id,
    product_url,
    product_title,
    product_price,
    platform_fee,
    total_amount,
    message,
    status,
    admin_approved,
    admin_approved_at,
    influencer_response,
    influencer_response_at,
    completed_at,
    created_at,
    updated_at,
    gift_type
  )
  SELECT 
    gr.id,
    gr.sender_id, -- user_id is the sender for gifts
    gr.sender_id, -- also set sender_id explicitly
    gr.influencer_id,
    gr.product_url,
    gr.product_title,
    gr.product_price,
    5.00 as platform_fee,
    COALESCE(gr.product_price, 0) + 5.00 as total_amount,
    gr.message,
    CASE 
      WHEN gr.status = 'pending' THEN 'pending_admin_approval'
      WHEN gr.status = 'accepted' THEN 'approved_waiting_influencer'
      WHEN gr.status = 'under process' THEN 'accepted'
      WHEN gr.status = 'completed' THEN 'completed'
      WHEN gr.status = 'rejected' THEN 'rejected_by_influencer'
      ELSE gr.status::text
    END as status,
    gr.admin_approved,
    gr.admin_approved_at,
    gr.influencer_response,
    gr.influencer_response_at,
    gr.completed_at,
    gr.created_at,
    gr.updated_at,
    true as gift_type
  FROM gift_requests gr
  WHERE NOT EXISTS (
    SELECT 1 FROM orders o WHERE o.id = gr.id
  );
  
  RAISE NOTICE 'Migration completed successfully';
END;
$$;