
-- Add RLS policies for orders_under_process table
ALTER TABLE public.orders_under_process ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own orders
CREATE POLICY "Users can create their own orders" 
  ON public.orders_under_process 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Allow users to view their own orders
CREATE POLICY "Users can view their own orders" 
  ON public.orders_under_process 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Allow admins to view and update all orders
CREATE POLICY "Admins can manage all orders" 
  ON public.orders_under_process 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );
