-- Drop the existing restrictive UPDATE policy for users
DROP POLICY IF EXISTS "Users can cancel their own pending orders" ON public.orders;

-- Create a new policy that allows users to cancel their own orders
CREATE POLICY "Users can cancel their own pending orders" 
ON public.orders 
FOR UPDATE 
USING (
    auth.uid() = user_id 
    AND status IN ('pending_admin_approval', 'approved_waiting_influencer')
) 
WITH CHECK (
    auth.uid() = user_id 
    AND status = 'cancelled_by_user'
);