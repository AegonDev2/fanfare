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
  wallet_records RECORD[];
  primary_wallet_id UUID;
  secondary_wallet_id UUID;
  total_balance NUMERIC;
BEGIN
  -- Find users with multiple wallets
  FOR user_record IN 
    SELECT user_id, COUNT(*) as wallet_count
    FROM wallets 
    GROUP BY user_id 
    HAVING COUNT(*) > 1
  LOOP
    RAISE NOTICE 'Processing user % with % wallets', user_record.user_id, user_record.wallet_count;
    
    -- Get all wallets for this user ordered by created_at DESC (newest first)
    SELECT array_agg(
      ROW(id, balance, created_at, updated_at)::wallets
      ORDER BY created_at DESC
    ) INTO wallet_records
    FROM wallets 
    WHERE user_id = user_record.user_id;
    
    -- Use the most recently created wallet as primary
    primary_wallet_id := (wallet_records[1]).id;
    
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

-- Step 4: Update the top_up_wallet function to handle the unique constraint properly
CREATE OR REPLACE FUNCTION public.top_up_wallet(p_user_id uuid, p_amount numeric, p_description text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_wallet_id UUID;
BEGIN
  -- Get the wallet for the user (should be unique now)
  SELECT id INTO v_wallet_id 
  FROM wallets 
  WHERE user_id = p_user_id;
  
  IF v_wallet_id IS NULL THEN
    -- Create wallet if not exists
    INSERT INTO wallets (user_id, balance)
    VALUES (p_user_id, p_amount)
    RETURNING id INTO v_wallet_id;
  ELSE
    -- Update existing wallet
    UPDATE wallets
    SET balance = balance + p_amount,
        updated_at = now()
    WHERE id = v_wallet_id;
  END IF;
  
  -- Record transaction
  INSERT INTO transactions (
    wallet_id,
    amount,
    type,
    status,
    description
  ) VALUES (
    v_wallet_id,
    p_amount,
    'deposit',
    'completed',
    p_description
  );
  
  RETURN TRUE;
END;
$function$;

-- Step 5: Update process_gift_payment function to use the single wallet
CREATE OR REPLACE FUNCTION public.process_gift_payment(
  p_user_id UUID,
  p_amount NUMERIC,
  p_gift_request_id UUID,
  p_description TEXT
) 
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_wallet_id UUID;
  v_current_balance NUMERIC;
BEGIN
  -- Get the wallet ID and current balance (should be unique now)
  SELECT id, balance INTO v_wallet_id, v_current_balance
  FROM wallets 
  WHERE user_id = p_user_id;
  
  -- Check if wallet exists and has sufficient balance
  IF v_wallet_id IS NULL THEN
    RAISE EXCEPTION 'Wallet not found for user';
  END IF;
  
  IF v_current_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient wallet balance. Required: %, Available: %', p_amount, v_current_balance;
  END IF;
  
  -- Update wallet balance
  UPDATE wallets
  SET 
    balance = balance - p_amount,
    updated_at = now()
  WHERE id = v_wallet_id;
  
  -- Record payment transaction
  INSERT INTO transactions (
    wallet_id,
    amount,
    type,
    status,
    description,
    reference_id
  ) VALUES (
    v_wallet_id,
    p_amount,
    'payment',
    'completed',
    p_description,
    p_gift_request_id
  );
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE;
END;
$$;