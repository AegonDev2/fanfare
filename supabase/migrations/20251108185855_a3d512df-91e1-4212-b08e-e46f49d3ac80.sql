-- Performance optimization: Add composite indexes for common queries

-- Index for order queries with gift_type filter and completed status
CREATE INDEX IF NOT EXISTS idx_orders_completed_gift 
ON orders(completed_at DESC, status) 
WHERE gift_type = true;

-- Index for completed orders sorted by completion time
CREATE INDEX IF NOT EXISTS idx_orders_status_completed_at 
ON orders(status, completed_at DESC);

-- Index for influencer profile searches by name and category
CREATE INDEX IF NOT EXISTS idx_influencer_profiles_name_category 
ON influencer_profiles(name, category);

-- Index for influencer profile lookups by followers (for leaderboards)
CREATE INDEX IF NOT EXISTS idx_influencer_profiles_followers 
ON influencer_profiles(followers DESC);

-- Index for notification queries by recipient and creation time
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_created 
ON notifications(recipient_id, created_at DESC, is_read);

-- Index for gift requests by status and influencer
CREATE INDEX IF NOT EXISTS idx_gift_requests_status_influencer 
ON gift_requests(status, influencer_id, created_at DESC);

-- Index for gift requests by sender
CREATE INDEX IF NOT EXISTS idx_gift_requests_sender 
ON gift_requests(sender_id, status, created_at DESC);

-- Index for wallet lookups by user_id (if not already exists)
CREATE INDEX IF NOT EXISTS idx_wallets_user_id 
ON wallets(user_id);

-- Index for transactions by wallet and creation time
CREATE INDEX IF NOT EXISTS idx_transactions_wallet_created 
ON transactions(wallet_id, created_at DESC);

-- Index for orders by sender (for gift tracking)
CREATE INDEX IF NOT EXISTS idx_orders_sender_status 
ON orders(sender_id, status, created_at DESC) 
WHERE gift_type = true;