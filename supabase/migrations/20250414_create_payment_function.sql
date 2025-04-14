
-- Create function to process a gift payment from a user's wallet
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
  -- Get the wallet ID and current balance
  SELECT id, balance INTO v_wallet_id, v_current_balance
  FROM wallets 
  WHERE user_id = p_user_id
  ORDER BY created_at DESC
  LIMIT 1;
  
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

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.process_gift_payment TO authenticated;
