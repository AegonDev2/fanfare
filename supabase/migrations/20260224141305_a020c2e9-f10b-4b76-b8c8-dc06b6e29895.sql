
-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Users can manage their own notifications" ON public.notifications;

-- Create a consolidated policy that allows:
-- 1. Users to read/update/delete their own notifications
-- 2. Admins to insert notifications for any user
-- 3. Users to insert notifications (e.g. system-generated)
CREATE POLICY "notifications_access_policy"
ON public.notifications FOR ALL
USING (
  (recipient_id = (SELECT auth.uid()))
  OR has_role((SELECT auth.uid()), 'admin'::app_role)
)
WITH CHECK (
  (recipient_id = (SELECT auth.uid()))
  OR has_role((SELECT auth.uid()), 'admin'::app_role)
);
