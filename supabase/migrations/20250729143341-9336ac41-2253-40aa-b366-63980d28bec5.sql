-- Fix critical security issues

-- 1. Add missing RLS policies for gifts_to_influencers table
ALTER TABLE public.gifts_to_influencers ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own gift records
CREATE POLICY "Users can send gifts" 
ON public.gifts_to_influencers 
FOR INSERT 
WITH CHECK (auth.uid() = sender_id);

-- Allow users to view gifts they sent
CREATE POLICY "Users can view sent gifts" 
ON public.gifts_to_influencers 
FOR SELECT 
USING (auth.uid() = sender_id);

-- Allow recipients to view gifts sent to them
CREATE POLICY "Recipients can view received gifts" 
ON public.gifts_to_influencers 
FOR SELECT 
USING (auth.uid() = influencer_id);

-- Allow admins to manage all gifts
CREATE POLICY "Admins can manage all gifts" 
ON public.gifts_to_influencers 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 2. Fix search_path issues in database functions - update existing functions
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = user_uuid AND role = 'admin'::app_role
  );
$function$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$function$;

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

CREATE OR REPLACE FUNCTION public.process_gift_payment(p_user_id uuid, p_amount numeric, p_gift_request_id uuid, p_description text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
  
  -- Update wallet balance (deduct the amount)
  UPDATE wallets
  SET 
    balance = balance - p_amount,
    updated_at = now()
  WHERE id = v_wallet_id;
  
  -- Record payment transaction with NEGATIVE amount to show deduction
  INSERT INTO transactions (
    wallet_id,
    amount,
    type,
    status,
    description,
    reference_id
  ) VALUES (
    v_wallet_id,
    -p_amount,  -- Record as negative amount for payment/deduction
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
$function$;

-- 3. Add audit logging table for security monitoring
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  action TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on audit logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs" 
ON public.audit_logs 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- System can insert audit logs
CREATE POLICY "System can insert audit logs" 
ON public.audit_logs 
FOR INSERT 
WITH CHECK (true);

-- 4. Create audit trigger function
CREATE OR REPLACE FUNCTION public.audit_trigger()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, old_values)
    VALUES (auth.uid(), 'DELETE', TG_TABLE_NAME, OLD.id, to_jsonb(OLD));
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, old_values, new_values)
    VALUES (auth.uid(), 'UPDATE', TG_TABLE_NAME, NEW.id, to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, new_values)
    VALUES (auth.uid(), 'INSERT', TG_TABLE_NAME, NEW.id, to_jsonb(NEW));
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$function$;

-- Add audit triggers to sensitive tables
CREATE TRIGGER audit_user_roles
  AFTER INSERT OR UPDATE OR DELETE ON user_roles
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER audit_orders
  AFTER INSERT OR UPDATE OR DELETE ON orders
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER audit_transactions
  AFTER INSERT OR UPDATE OR DELETE ON transactions
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();