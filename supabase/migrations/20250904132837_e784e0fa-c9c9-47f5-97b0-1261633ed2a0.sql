-- Insert sample ad banners for the hero carousel
INSERT INTO public.ad_banners (title, subtitle, image_url, link_url, display_order, is_active) VALUES 
('Welcome to Fanfare', 'Send super gifts to your favorite creators', 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=450&fit=crop', '/gift-shop', 1, true),
('Join the Community', 'Connect with fans and creators worldwide', 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=450&fit=crop', '/influencers', 2, true),
('Show Your Support', 'Make your favorite creator happy with real gifts', 'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800&h=450&fit=crop', '/leaderboard', 3, true);