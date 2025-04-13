
-- Create function to top up a user's wallet
CREATE OR REPLACE FUNCTION public.top_up_wallet(
  p_user_id UUID,
  p_amount NUMERIC,
  p_description TEXT
) 
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_wallet_id UUID;
BEGIN
  -- Get or create wallet
  SELECT id INTO v_wallet_id FROM wallets WHERE user_id = p_user_id;
  
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
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.top_up_wallet TO authenticated;
