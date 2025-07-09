-- Fix the top_up_wallet function to use the most recent wallet (same logic as frontend)
CREATE OR REPLACE FUNCTION public.top_up_wallet(p_user_id uuid, p_amount numeric, p_description text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_wallet_id UUID;
BEGIN
  -- Get the most recent wallet for the user (same logic as frontend)
  SELECT id INTO v_wallet_id 
  FROM wallets 
  WHERE user_id = p_user_id 
  ORDER BY created_at DESC 
  LIMIT 1;
  
  IF v_wallet_id IS NULL THEN
    -- Create wallet if not exists
    INSERT INTO wallets (user_id, balance)
    VALUES (p_user_id, p_amount)
    RETURNING id INTO v_wallet_id;
  ELSE
    -- Update existing wallet (using the most recent one)
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
$function$