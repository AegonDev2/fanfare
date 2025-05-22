
-- Check if the column exists first to avoid errors
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'cart_items'
        AND column_name = 'quantity'
    ) THEN
        -- Add the quantity column with a default value of 1
        ALTER TABLE public.cart_items ADD COLUMN quantity integer NOT NULL DEFAULT 1;
    END IF;
END
$$;
