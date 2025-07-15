-- Add admin RLS policy for wallets to allow admins to view all wallets
CREATE POLICY "Admins can view all wallets"
ON wallets
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'::app_role
  )
);

-- Add admin RLS policy for transactions to allow admins to view all transactions  
CREATE POLICY "Admins can view all transactions"
ON transactions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'::app_role
  )
);