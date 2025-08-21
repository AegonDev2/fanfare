-- Fix Issue 1: Over-eager RLS Policies - Update to use subqueries for better performance

-- Drop and recreate policies for gift_requests
DROP POLICY IF EXISTS "Admins can do all" ON public.gift_requests;
DROP POLICY IF EXISTS "Fans can create requests" ON public.gift_requests;
DROP POLICY IF EXISTS "Fans can see own requests" ON public.gift_requests;

-- Recreate with optimized subqueries
CREATE POLICY "Admins can do all" ON public.gift_requests FOR ALL 
USING (has_role((select auth.uid()), 'admin'::app_role))
WITH CHECK (has_role((select auth.uid()), 'admin'::app_role));

CREATE POLICY "Fans can create requests" ON public.gift_requests FOR INSERT 
WITH CHECK (sender_id = (select auth.uid()));

CREATE POLICY "Fans can see own requests" ON public.gift_requests FOR SELECT 
USING (sender_id = (select auth.uid()));

-- Drop and recreate policies for ad_banners
DROP POLICY IF EXISTS "Allow admins full access to ad banners" ON public.ad_banners;

CREATE POLICY "Allow admins full access to ad banners" ON public.ad_banners FOR ALL 
USING (has_role((select auth.uid()), 'admin'::app_role))
WITH CHECK (has_role((select auth.uid()), 'admin'::app_role));

-- Drop and recreate policies for profiles
DROP POLICY IF EXISTS "Allow profile creation during signup" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

CREATE POLICY "Users can manage their own profile" ON public.profiles FOR ALL 
USING (id = (select auth.uid()))
WITH CHECK (id = (select auth.uid()));

-- Drop and recreate policies for influencer_profiles
DROP POLICY IF EXISTS "Influencers can create their own profile" ON public.influencer_profiles;
DROP POLICY IF EXISTS "Influencers can insert their own profile" ON public.influencer_profiles;
DROP POLICY IF EXISTS "Influencers can update their own profile" ON public.influencer_profiles;

CREATE POLICY "Influencers can manage their own profile" ON public.influencer_profiles FOR ALL 
USING (id = (select auth.uid()))
WITH CHECK (id = (select auth.uid()));

-- Drop and recreate policies for size_preferences
DROP POLICY IF EXISTS "Influencers can insert their own size preferences" ON public.size_preferences;
DROP POLICY IF EXISTS "Influencers can update their own size preferences" ON public.size_preferences;

CREATE POLICY "Influencers can manage their own size preferences" ON public.size_preferences FOR ALL 
USING (influencer_id = (select auth.uid()))
WITH CHECK (influencer_id = (select auth.uid()));

-- Drop and recreate policies for influencer_wishlist
DROP POLICY IF EXISTS "Influencers can manage their own wishlist" ON public.influencer_wishlist;

CREATE POLICY "Influencers can manage their own wishlist" ON public.influencer_wishlist FOR ALL 
USING (influencer_id = (select auth.uid()))
WITH CHECK (influencer_id = (select auth.uid()));

-- Drop and recreate policies for influencer_addresses
DROP POLICY IF EXISTS "Users can delete their own addresses" ON public.influencer_addresses;
DROP POLICY IF EXISTS "Users can insert their own addresses" ON public.influencer_addresses;
DROP POLICY IF EXISTS "Users can update their own addresses" ON public.influencer_addresses;

CREATE POLICY "Users can manage their own addresses" ON public.influencer_addresses FOR ALL 
USING (influencer_id = (select auth.uid()))
WITH CHECK (influencer_id = (select auth.uid()));

-- Drop and recreate policies for notifications
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;

CREATE POLICY "Users can manage their own notifications" ON public.notifications FOR ALL 
USING (recipient_id = (select auth.uid()))
WITH CHECK (recipient_id = (select auth.uid()));

-- Drop and recreate policies for transactions
DROP POLICY IF EXISTS "transaction_user_access" ON public.transactions;
DROP POLICY IF EXISTS "Admins can view all transactions" ON public.transactions;

CREATE POLICY "Users can access their own transactions" ON public.transactions FOR ALL 
USING (wallet_id IN (SELECT wallets.id FROM wallets WHERE wallets.user_id = (select auth.uid())));

CREATE POLICY "Admins can view all transactions" ON public.transactions FOR SELECT 
USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = (select auth.uid()) AND user_roles.role = 'admin'::app_role));

-- Drop and recreate policies for wallets
DROP POLICY IF EXISTS "wallet_user_access" ON public.wallets;
DROP POLICY IF EXISTS "Admins can view all wallets" ON public.wallets;

CREATE POLICY "Users can access their own wallet" ON public.wallets FOR ALL 
USING (user_id = (select auth.uid()));

CREATE POLICY "Admins can view all wallets" ON public.wallets FOR SELECT 
USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = (select auth.uid()) AND user_roles.role = 'admin'::app_role));

-- Drop and recreate policies for user_roles
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT 
USING (user_id = (select auth.uid()));

CREATE POLICY "Admins can manage all roles" ON public.user_roles FOR ALL 
USING (is_admin((select auth.uid())))
WITH CHECK (is_admin((select auth.uid())));

-- Drop and recreate policies for orders
DROP POLICY IF EXISTS "Users can create their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Influencers can view orders for them" ON public.orders;
DROP POLICY IF EXISTS "Admins can manage all orders" ON public.orders;
DROP POLICY IF EXISTS "Influencers can update orders for them" ON public.orders;
DROP POLICY IF EXISTS "Users can cancel their own pending orders" ON public.orders;

CREATE POLICY "Users can manage their own orders" ON public.orders FOR ALL 
USING (user_id = (select auth.uid()))
WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Influencers can view and update their orders" ON public.orders FOR ALL 
USING (influencer_id = (select auth.uid()))
WITH CHECK (influencer_id = (select auth.uid()));

CREATE POLICY "Admins can manage all orders" ON public.orders FOR ALL 
USING (has_role((select auth.uid()), 'admin'::app_role))
WITH CHECK (has_role((select auth.uid()), 'admin'::app_role));

-- Drop and recreate policies for fan_profiles
DROP POLICY IF EXISTS "Users can create their own fan profile" ON public.fan_profiles;
DROP POLICY IF EXISTS "Users can update their own fan profile" ON public.fan_profiles;
DROP POLICY IF EXISTS "Users can delete their own fan profile" ON public.fan_profiles;

CREATE POLICY "Users can manage their own fan profile" ON public.fan_profiles FOR ALL 
USING (user_id = (select auth.uid()))
WITH CHECK (user_id = (select auth.uid()));

-- Drop and recreate policies for audit_logs
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;

CREATE POLICY "Admins can view audit logs" ON public.audit_logs FOR SELECT 
USING (has_role((select auth.uid()), 'admin'::app_role));

-- Drop and recreate policies for testimonials
DROP POLICY IF EXISTS "Users can create testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Users can view their own testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Admins can manage all testimonials" ON public.testimonials;

CREATE POLICY "Users can manage their own testimonials" ON public.testimonials FOR ALL 
USING (user_id = (select auth.uid()))
WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Admins can manage all testimonials" ON public.testimonials FOR ALL 
USING (has_role((select auth.uid()), 'admin'::app_role))
WITH CHECK (has_role((select auth.uid()), 'admin'::app_role));

-- Drop and recreate policies for device_tokens
DROP POLICY IF EXISTS "Users can manage their own device tokens" ON public.device_tokens;

CREATE POLICY "Users can manage their own device tokens" ON public.device_tokens FOR ALL 
USING (user_id = (select auth.uid()));

-- Drop and recreate policies for gifts_to_influencers
DROP POLICY IF EXISTS "Users can send gifts" ON public.gifts_to_influencers;
DROP POLICY IF EXISTS "Users can view sent gifts" ON public.gifts_to_influencers;
DROP POLICY IF EXISTS "Recipients can view received gifts" ON public.gifts_to_influencers;
DROP POLICY IF EXISTS "Admins can manage all gifts" ON public.gifts_to_influencers;

CREATE POLICY "Users can manage sent gifts" ON public.gifts_to_influencers FOR ALL 
USING (sender_id = (select auth.uid()))
WITH CHECK (sender_id = (select auth.uid()));

CREATE POLICY "Influencers can view received gifts" ON public.gifts_to_influencers FOR SELECT 
USING (influencer_id = (select auth.uid()));

CREATE POLICY "Admins can manage all gifts" ON public.gifts_to_influencers FOR ALL 
USING (has_role((select auth.uid()), 'admin'::app_role))
WITH CHECK (has_role((select auth.uid()), 'admin'::app_role));