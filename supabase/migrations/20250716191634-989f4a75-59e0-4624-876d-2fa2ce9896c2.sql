-- Add featured status and ranking to shops table
ALTER TABLE public.shops 
ADD COLUMN is_featured boolean DEFAULT false,
ADD COLUMN ranking integer DEFAULT 4 CHECK (ranking >= 1 AND ranking <= 4);

-- Add featured status and ranking to shop_products table  
ALTER TABLE public.shop_products
ADD COLUMN is_featured boolean DEFAULT false,
ADD COLUMN ranking integer DEFAULT 4 CHECK (ranking >= 1 AND ranking <= 4);

-- Create indexes for better performance on featured and ranking queries
CREATE INDEX idx_shops_featured_ranking ON public.shops (is_featured DESC, ranking ASC, created_at DESC);
CREATE INDEX idx_shop_products_featured_ranking ON public.shop_products (is_featured DESC, ranking ASC, created_at DESC);