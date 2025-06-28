
-- Create shops table to store different gift shops
CREATE TABLE public.shops (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  website_url TEXT,
  logo_image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create shop_products table to store products from different shops
CREATE TABLE public.shop_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  image_url TEXT,
  product_url TEXT,
  category TEXT,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) to both tables
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_products ENABLE ROW LEVEL SECURITY;

-- Create policies for shops table (making it publicly readable for now)
CREATE POLICY "Anyone can view active shops" 
  ON public.shops 
  FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage shops" 
  ON public.shops 
  FOR ALL 
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policies for shop_products table (making it publicly readable for now)
CREATE POLICY "Anyone can view available products" 
  ON public.shop_products 
  FOR SELECT 
  USING (is_available = true);

CREATE POLICY "Authenticated users can manage products" 
  ON public.shop_products 
  FOR ALL 
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_shop_products_shop_id ON public.shop_products(shop_id);
CREATE INDEX idx_shop_products_category ON public.shop_products(category);
CREATE INDEX idx_shops_active ON public.shops(is_active);

-- Create trigger to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_shops_updated_at BEFORE UPDATE ON public.shops
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shop_products_updated_at BEFORE UPDATE ON public.shop_products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
