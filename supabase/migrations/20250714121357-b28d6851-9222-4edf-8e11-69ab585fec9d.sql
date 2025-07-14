-- Fix wallet duplication issue by consolidating wallets and updating transactions
-- Step 1: Create a function to merge duplicate wallets
CREATE OR REPLACE FUNCTION public.consolidate_user_wallets()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_record RECORD;
  primary_wallet_id UUID;
  total_balance NUMERIC;
BEGIN
  -- Find users with multiple wallets and consolidate them
  FOR user_record IN 
    SELECT user_id, COUNT(*) as wallet_count
    FROM wallets 
    GROUP BY user_id 
    HAVING COUNT(*) > 1
  LOOP
    RAISE NOTICE 'Processing user % with % wallets', user_record.user_id, user_record.wallet_count;
    
    -- Get the most recently created wallet as primary
    SELECT id INTO primary_wallet_id
    FROM wallets 
    WHERE user_id = user_record.user_id
    ORDER BY created_at DESC
    LIMIT 1;
    
    -- Calculate total balance from all wallets
    SELECT COALESCE(SUM(balance), 0) INTO total_balance
    FROM wallets 
    WHERE user_id = user_record.user_id;
    
    -- Update all transactions to point to the primary wallet
    UPDATE transactions 
    SET wallet_id = primary_wallet_id
    WHERE wallet_id IN (
      SELECT id FROM wallets WHERE user_id = user_record.user_id AND id != primary_wallet_id
    );
    
    -- Update the primary wallet with the consolidated balance
    UPDATE wallets 
    SET balance = total_balance,
        updated_at = now()
    WHERE id = primary_wallet_id;
    
    -- Delete secondary wallets
    DELETE FROM wallets 
    WHERE user_id = user_record.user_id AND id != primary_wallet_id;
    
    RAISE NOTICE 'Consolidated wallets for user %. Primary wallet: %, Total balance: %', 
      user_record.user_id, primary_wallet_id, total_balance;
  END LOOP;
END;
$$;

-- Step 2: Execute the consolidation
SELECT public.consolidate_user_wallets();

-- Step 3: Add constraint to prevent duplicate wallets in future
ALTER TABLE public.wallets DROP CONSTRAINT IF EXISTS unique_user_wallet;
ALTER TABLE public.wallets ADD CONSTRAINT unique_user_wallet UNIQUE (user_id);