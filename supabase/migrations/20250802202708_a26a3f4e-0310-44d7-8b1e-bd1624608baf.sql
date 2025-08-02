-- Add column to store influencer acceptance message separately
ALTER TABLE orders ADD COLUMN influencer_message TEXT;

-- Update existing orders that might have messages stored in the main message field
-- This is a one-time migration to separate fan messages from influencer messages