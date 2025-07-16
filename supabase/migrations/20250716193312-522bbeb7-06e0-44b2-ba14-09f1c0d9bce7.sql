-- Remove the ranking constraint from shops table
ALTER TABLE public.shops 
DROP CONSTRAINT IF EXISTS shops_ranking_check;

-- Remove the ranking constraint from shop_products table  
ALTER TABLE public.shop_products
DROP CONSTRAINT IF EXISTS shop_products_ranking_check;