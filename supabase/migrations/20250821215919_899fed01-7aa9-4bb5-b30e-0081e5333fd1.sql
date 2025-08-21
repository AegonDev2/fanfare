-- Fix Issue 2: Consolidate Multiple Permissive Policies

-- Fix ad_banners - Consolidate SELECT policies
DROP POLICY IF EXISTS "Allow everyone to view ad banners" ON public.ad_banners;
-- Keep the existing "Allow admins full access to ad banners" policy which covers all operations

-- Fix fan_profiles - Consolidate SELECT policies  
DROP POLICY IF EXISTS "Users can view all fan profiles" ON public.fan_profiles;
-- The "Users can manage their own fan profile" already handles user access, add public read access
CREATE POLICY "Public can view all fan profiles" ON public.fan_profiles FOR SELECT 
USING (true);

-- Fix gift_requests - Consolidate all policies
DROP POLICY IF EXISTS "Influencers can see and update their requests" ON public.gift_requests;
-- Add influencer access to the consolidated policy
CREATE POLICY "Influencers can manage their requests" ON public.gift_requests FOR ALL 
USING (influencer_id IN (SELECT influencer_profiles.id FROM influencer_profiles WHERE influencer_profiles.id = gift_requests.influencer_id))
WITH CHECK (influencer_id IN (SELECT influencer_profiles.id FROM influencer_profiles WHERE influencer_profiles.id = gift_requests.influencer_id));

-- Fix influencer_addresses - Consolidate SELECT policies
DROP POLICY IF EXISTS "Users can read any address" ON public.influencer_addresses;
DROP POLICY IF EXISTS "Users can view own addresses" ON public.influencer_addresses;
DROP POLICY IF EXISTS "Users can insert own addresses" ON public.influencer_addresses;
-- The "Users can manage their own addresses" already handles owner access, add public read access
CREATE POLICY "Public can view addresses" ON public.influencer_addresses FOR SELECT 
USING (true);

-- Fix influencer_profiles - Consolidate SELECT policies
DROP POLICY IF EXISTS "Allow authenticated users to read influencer profiles" ON public.influencer_profiles;
DROP POLICY IF EXISTS "Anyone can view influencer profiles" ON public.influencer_profiles;
DROP POLICY IF EXISTS "Users can view all influencer profiles" ON public.influencer_profiles;
-- Keep just one public read policy
CREATE POLICY "Public can view influencer profiles" ON public.influencer_profiles FOR SELECT 
USING (true);

-- Fix influencer_wishlist - Consolidate SELECT policies
DROP POLICY IF EXISTS "Anyone can view influencer wishlist" ON public.influencer_wishlist;
-- The "Influencers can manage their own wishlist" already handles owner access, add public read access
CREATE POLICY "Public can view influencer wishlist" ON public.influencer_wishlist FOR SELECT 
USING (true);

-- Fix notifications - Consolidate INSERT policies
DROP POLICY IF EXISTS "Users can insert notifications" ON public.notifications;
-- The "Users can manage their own notifications" already handles user operations

-- Fix profiles - Consolidate SELECT policies
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
-- Keep just one public read policy
CREATE POLICY "Public can view all profiles" ON public.profiles FOR SELECT 
USING (true);

-- Fix shop_products - Consolidate SELECT policies
DROP POLICY IF EXISTS "Anyone can view available products" ON public.shop_products;
-- The "Authenticated users can manage products" already covers authenticated users, add public read for available products
CREATE POLICY "Public can view available products" ON public.shop_products FOR SELECT 
USING (is_available = true);

-- Fix shops - Consolidate SELECT policies
DROP POLICY IF EXISTS "Anyone can view active shops" ON public.shops;
-- The "Authenticated users can manage shops" already covers authenticated users, add public read for active shops
CREATE POLICY "Public can view active shops" ON public.shops FOR SELECT 
USING (is_active = true);

-- Fix size_preferences - Consolidate SELECT policies
DROP POLICY IF EXISTS "Anyone can view size preferences" ON public.size_preferences;
-- The "Influencers can manage their own size preferences" already handles owner access, add public read access
CREATE POLICY "Public can view size preferences" ON public.size_preferences FOR SELECT 
USING (true);

-- Fix testimonials - Consolidate policies by keeping existing approved testimonials policy
DROP POLICY IF EXISTS "Anyone can view approved testimonials" ON public.testimonials;
-- The other policies already handle user and admin access, add public read for approved testimonials
CREATE POLICY "Public can view approved testimonials" ON public.testimonials FOR SELECT 
USING (is_approved = true);