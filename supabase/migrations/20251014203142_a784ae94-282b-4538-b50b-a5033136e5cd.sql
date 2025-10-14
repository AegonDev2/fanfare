-- Allow public users to view active ad banners
CREATE POLICY "Allow public read access to active ad banners"
ON public.ad_banners
FOR SELECT
USING (is_active = true);

-- The existing admin policy will handle all other operations (INSERT, UPDATE, DELETE)