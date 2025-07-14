
-- Create a dedicated table for fan profiles
CREATE TABLE public.fan_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  profile_image_url TEXT,
  bio TEXT,
  favorite_categories TEXT[],
  total_gifts_sent INTEGER DEFAULT 0,
  total_amount_spent NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.fan_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for fan profiles
CREATE POLICY "Users can view all fan profiles" 
  ON public.fan_profiles 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can create their own fan profile" 
  ON public.fan_profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own fan profile" 
  ON public.fan_profiles 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own fan profile" 
  ON public.fan_profiles 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create trigger to update updated_at column
CREATE TRIGGER update_fan_profiles_updated_at
  BEFORE UPDATE ON public.fan_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
