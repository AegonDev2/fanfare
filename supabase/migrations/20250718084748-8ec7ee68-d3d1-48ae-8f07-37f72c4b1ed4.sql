-- Add delivery_fee column to orders table
ALTER TABLE orders ADD COLUMN delivery_fee NUMERIC DEFAULT 0;