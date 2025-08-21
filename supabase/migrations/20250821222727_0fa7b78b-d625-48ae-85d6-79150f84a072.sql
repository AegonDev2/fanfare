-- Fix Issue 2: Consolidate Multiple Permissive Policies for All Tables

-- ==============================================
-- FIX 1: fan_profiles - Consolidate SELECT policies
-- ==============================================
DROP POLICY IF EXISTS "Users can view all fan profiles" ON public.fan_profiles;
DROP POLICY IF EXISTS "Public can view all fan profiles" ON public.fan_profiles;
DROP POLICY IF EXISTS "Users can manage their own fan profile" ON public.fan_profiles;

-- Create single comprehensive policy for fan_profiles
CREATE POLICY "fan_profiles_access_policy" ON public.fan_profiles FOR ALL 
USING (
  true OR -- Public read access
  user_id = auth.uid() -- Owner access
)
WITH CHECK (user_id = auth.uid());

-- ==============================================
-- FIX 2: gift_requests - Consolidate all policies
-- ==============================================
DROP POLICY IF EXISTS "Admins can do all" ON public.gift_requests;
DROP POLICY IF EXISTS "Fans can create requests" ON public.gift_requests;
DROP POLICY IF EXISTS "Fans can see own requests" ON public.gift_requests;
DROP POLICY IF EXISTS "Influencers can manage their requests" ON public.gift_requests;
DROP POLICY IF EXISTS "Influencers can see and update their requests" ON public.gift_requests;

-- Create single comprehensive policy for gift_requests
CREATE POLICY "gift_requests_access_policy" ON public.gift_requests FOR ALL 
USING (
  has_role(auth.uid(), 'admin'::app_role) OR -- Admins can do all
  sender_id = auth.uid() OR -- Fans can see own requests
  influencer_id = auth.uid() -- Influencers can manage their requests
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR -- Admins can do all
  sender_id = auth.uid() OR -- Fans can create requests
  influencer_id = auth.uid() -- Influencers can manage their requests
);

-- ==============================================
-- FIX 3: gifts_to_influencers - Consolidate all policies
-- ==============================================
DROP POLICY IF EXISTS "Admins can manage all gifts" ON public.gifts_to_influencers;
DROP POLICY IF EXISTS "Users can manage sent gifts" ON public.gifts_to_influencers;
DROP POLICY IF EXISTS "Influencers can view received gifts" ON public.gifts_to_influencers;

-- Create single comprehensive policy for gifts_to_influencers
CREATE POLICY "gifts_to_influencers_access_policy" ON public.gifts_to_influencers FOR ALL 
USING (
  has_role(auth.uid(), 'admin'::app_role) OR -- Admins can manage all
  sender_id = auth.uid() OR -- Users can manage sent gifts
  influencer_id = auth.uid() -- Influencers can view received gifts
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR -- Admins can manage all
  sender_id = auth.uid() -- Users can manage sent gifts
);

-- ==============================================
-- FIX 4: influencer_addresses - Consolidate SELECT policies
-- ==============================================
DROP POLICY IF EXISTS "Public can view addresses" ON public.influencer_addresses;
DROP POLICY IF EXISTS "Users can manage their own addresses" ON public.influencer_addresses;
DROP POLICY IF EXISTS "Users can read any address" ON public.influencer_addresses;
DROP POLICY IF EXISTS "Users can view own addresses" ON public.influencer_addresses;
DROP POLICY IF EXISTS "Users can insert own addresses" ON public.influencer_addresses;

-- Create single comprehensive policy for influencer_addresses
CREATE POLICY "influencer_addresses_access_policy" ON public.influencer_addresses FOR ALL 
USING (
  true OR -- Public read access
  influencer_id = auth.uid() -- Owner access
)
WITH CHECK (influencer_id = auth.uid());

-- ==============================================
-- FIX 5: influencer_profiles - Consolidate SELECT policies
-- ==============================================
DROP POLICY IF EXISTS "Influencers can manage their own profile" ON public.influencer_profiles;
DROP POLICY IF EXISTS "Public can view influencer profiles" ON public.influencer_profiles;
DROP POLICY IF EXISTS "Allow authenticated users to read influencer profiles" ON public.influencer_profiles;
DROP POLICY IF EXISTS "Anyone can view influencer profiles" ON public.influencer_profiles;
DROP POLICY IF EXISTS "Users can view all influencer profiles" ON public.influencer_profiles;

-- Create single comprehensive policy for influencer_profiles
CREATE POLICY "influencer_profiles_access_policy" ON public.influencer_profiles FOR ALL 
USING (
  true OR -- Public read access
  id = auth.uid() -- Owner access
)
WITH CHECK (id = auth.uid());

-- ==============================================
-- FIX 6: influencer_wishlist - Consolidate SELECT policies
-- ==============================================
DROP POLICY IF EXISTS "Influencers can manage their own wishlist" ON public.influencer_wishlist;
DROP POLICY IF EXISTS "Public can view influencer wishlist" ON public.influencer_wishlist;
DROP POLICY IF EXISTS "Anyone can view influencer wishlist" ON public.influencer_wishlist;

-- Create single comprehensive policy for influencer_wishlist
CREATE POLICY "influencer_wishlist_access_policy" ON public.influencer_wishlist FOR ALL 
USING (
  true OR -- Public read access
  influencer_id = auth.uid() -- Owner access
)
WITH CHECK (influencer_id = auth.uid());

-- ==============================================
-- FIX 7: orders - Consolidate all policies
-- ==============================================
DROP POLICY IF EXISTS "Admins can manage all orders" ON public.orders;
DROP POLICY IF EXISTS "Influencers can view and update their orders" ON public.orders;
DROP POLICY IF EXISTS "Users can manage their own orders" ON public.orders;

-- Create single comprehensive policy for orders
CREATE POLICY "orders_access_policy" ON public.orders FOR ALL 
USING (
  has_role(auth.uid(), 'admin'::app_role) OR -- Admins can manage all
  user_id = auth.uid() OR -- Users can manage their own orders
  influencer_id = auth.uid() -- Influencers can view and update their orders
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR -- Admins can manage all
  user_id = auth.uid() OR -- Users can manage their own orders
  influencer_id = auth.uid() -- Influencers can view and update their orders
);

-- ==============================================
-- FIX 8: profiles - Consolidate SELECT policies
-- ==============================================
DROP POLICY IF EXISTS "Public can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can manage their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create single comprehensive policy for profiles
CREATE POLICY "profiles_access_policy" ON public.profiles FOR ALL 
USING (
  true OR -- Public read access
  id = auth.uid() -- Owner access
)
WITH CHECK (id = auth.uid());

-- ==============================================
-- FIX 9: shop_products - Consolidate SELECT policies
-- ==============================================
DROP POLICY IF EXISTS "Authenticated users can manage products" ON public.shop_products;
DROP POLICY IF EXISTS "Public can view available products" ON public.shop_products;
DROP POLICY IF EXISTS "Anyone can view available products" ON public.shop_products;

-- Create single comprehensive policy for shop_products
CREATE POLICY "shop_products_access_policy" ON public.shop_products FOR ALL 
USING (
  is_available = true OR -- Public read access for available products
  auth.uid() IS NOT NULL -- Authenticated users can manage all
)
WITH CHECK (auth.uid() IS NOT NULL);

-- ==============================================
-- FIX 10: shops - Consolidate SELECT policies
-- ==============================================
DROP POLICY IF EXISTS "Authenticated users can manage shops" ON public.shops;
DROP POLICY IF EXISTS "Public can view active shops" ON public.shops;
DROP POLICY IF EXISTS "Anyone can view active shops" ON public.shops;

-- Create single comprehensive policy for shops
CREATE POLICY "shops_access_policy" ON public.shops FOR ALL 
USING (
  is_active = true OR -- Public read access for active shops
  auth.uid() IS NOT NULL -- Authenticated users can manage all
)
WITH CHECK (auth.uid() IS NOT NULL);

-- ==============================================
-- FIX 11: size_preferences - Consolidate SELECT policies
-- ==============================================
DROP POLICY IF EXISTS "Influencers can manage their own size preferences" ON public.size_preferences;
DROP POLICY IF EXISTS "Public can view size preferences" ON public.size_preferences;
DROP POLICY IF EXISTS "Anyone can view size preferences" ON public.size_preferences;

-- Create single comprehensive policy for size_preferences
CREATE POLICY "size_preferences_access_policy" ON public.size_preferences FOR ALL 
USING (
  true OR -- Public read access
  influencer_id = auth.uid() -- Owner access
)
WITH CHECK (influencer_id = auth.uid());

-- ==============================================
-- FIX 12: testimonials - Consolidate all policies
-- ==============================================
DROP POLICY IF EXISTS "Admins can manage all testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Public can view approved testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Users can manage their own testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Anyone can view approved testimonials" ON public.testimonials;

-- Create single comprehensive policy for testimonials
CREATE POLICY "testimonials_access_policy" ON public.testimonials FOR ALL 
USING (
  has_role(auth.uid(), 'admin'::app_role) OR -- Admins can manage all
  (is_approved = true) OR -- Public can view approved testimonials
  user_id = auth.uid() -- Users can manage their own testimonials
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR -- Admins can manage all
  user_id = auth.uid() -- Users can manage their own testimonials
);

-- ==============================================
-- FIX 13: transactions - Consolidate SELECT policies
-- ==============================================
DROP POLICY IF EXISTS "Admins can view all transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can access their own transactions" ON public.transactions;

-- Create single comprehensive policy for transactions
CREATE POLICY "transactions_access_policy" ON public.transactions FOR ALL 
USING (
  has_role(auth.uid(), 'admin'::app_role) OR -- Admins can view all
  wallet_id IN (SELECT id FROM wallets WHERE user_id = auth.uid()) -- Users can access their own
)
WITH CHECK (
  wallet_id IN (SELECT id FROM wallets WHERE user_id = auth.uid()) -- Users can only create/update their own
);

-- ==============================================
-- FIX 14: user_roles - Consolidate all policies
-- ==============================================
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Service role can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

-- Create single comprehensive policy for user_roles
CREATE POLICY "user_roles_access_policy" ON public.user_roles FOR ALL 
USING (
  is_admin(auth.uid()) OR -- Admins can manage all
  auth.role() = 'service_role' OR -- Service role can manage all
  user_id = auth.uid() -- Users can view their own roles
)
WITH CHECK (
  is_admin(auth.uid()) OR -- Admins can manage all
  auth.role() = 'service_role' -- Service role can manage all
);

-- ==============================================
-- FIX 15: wallets - Consolidate SELECT policies
-- ==============================================
DROP POLICY IF EXISTS "Admins can view all wallets" ON public.wallets;
DROP POLICY IF EXISTS "Users can access their own wallet" ON public.wallets;

-- Create single comprehensive policy for wallets
CREATE POLICY "wallets_access_policy" ON public.wallets FOR ALL 
USING (
  has_role(auth.uid(), 'admin'::app_role) OR -- Admins can view all
  user_id = auth.uid() -- Users can access their own wallet
)
WITH CHECK (user_id = auth.uid());