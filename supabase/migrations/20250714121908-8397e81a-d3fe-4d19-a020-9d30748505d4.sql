-- Update the top_up_wallet function to work with the unique constraint
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

-- Update process_gift_payment function to use the single wallet
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