-- Create INSERT policy for notifications table
CREATE POLICY "Users can insert notifications" 
ON public.notifications 
FOR INSERT 
TO authenticated
WITH CHECK (true);