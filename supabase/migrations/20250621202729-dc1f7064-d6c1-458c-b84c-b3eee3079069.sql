
-- Add category column to influencer_profiles table
ALTER TABLE public.influencer_profiles 
ADD COLUMN category TEXT;

-- Create an index on category for better search performance
CREATE INDEX idx_influencer_profiles_category ON public.influencer_profiles(category);

-- Update existing records with a default category (optional)
UPDATE public.influencer_profiles 
SET category = 'lifestyle' 
WHERE category IS NULL;
