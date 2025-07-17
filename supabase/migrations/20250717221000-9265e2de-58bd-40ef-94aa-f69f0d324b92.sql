-- Fix RLS policy for influencers to update orders
-- The current policy fails because it checks the status after update, but we're changing the status
-- We need to allow updates based on the current status, not the new status

DROP POLICY IF EXISTS "Influencers can update orders for them" ON orders;

CREATE POLICY "Influencers can update orders for them" 
ON orders 
FOR UPDATE 
USING (
  auth.uid() = influencer_id AND 
  status = 'approved_waiting_influencer'
) 
WITH CHECK (
  auth.uid() = influencer_id
);