-- Create RLS policies for notifications table
-- Allow authenticated users to insert notifications (for sending notifications)
CREATE POLICY "Users can insert notifications" 
ON public.notifications 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Allow users to view their own notifications
CREATE POLICY "Users can view their own notifications" 
ON public.notifications 
FOR SELECT 
TO authenticated
USING (recipient_id = auth.uid());

-- Allow users to update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications" 
ON public.notifications 
FOR UPDATE 
TO authenticated
USING (recipient_id = auth.uid());

-- Allow users to delete their own notifications
CREATE POLICY "Users can delete their own notifications" 
ON public.notifications 
FOR DELETE 
TO authenticated
USING (recipient_id = auth.uid());