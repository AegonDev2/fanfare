-- Clean up database and add constraints to prevent self-gifting and non-gift orders

-- 1. Clean up existing invalid data
-- Remove self-gifts (where user_id = influencer_id)
DELETE FROM orders WHERE user_id = influencer_id;

-- Update all orders to be gifts (set gift_type = true for all orders)
UPDATE orders SET gift_type = true WHERE gift_type = false OR gift_type IS NULL;

-- Ensure all orders have sender_id set to user_id if not already set
UPDATE orders SET sender_id = user_id WHERE sender_id IS NULL;

-- 2. Add constraints to prevent future issues
-- Add check constraint to prevent self-gifting
ALTER TABLE orders ADD CONSTRAINT check_no_self_gifts 
CHECK (user_id IS DISTINCT FROM influencer_id);

-- Add constraint to ensure all orders are gifts
ALTER TABLE orders ADD CONSTRAINT check_gift_type_true 
CHECK (gift_type = true);

-- Add constraint to ensure sender_id matches user_id for gifts
ALTER TABLE orders ADD CONSTRAINT check_sender_is_user 
CHECK (sender_id = user_id);

-- Add constraint to ensure influencer_id is not null for gifts
ALTER TABLE orders ADD CONSTRAINT check_influencer_required 
CHECK (influencer_id IS NOT NULL);