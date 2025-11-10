-- Create table to cache product extractions
CREATE TABLE IF NOT EXISTS public.product_extractions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_url TEXT NOT NULL UNIQUE,
  product_data JSONB NOT NULL,
  screenshot_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '7 days')
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_product_extractions_url ON public.product_extractions(product_url);
CREATE INDEX IF NOT EXISTS idx_product_extractions_expires ON public.product_extractions(expires_at);

-- Enable RLS
ALTER TABLE public.product_extractions ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read cached extractions
CREATE POLICY "Anyone can view product extractions"
  ON public.product_extractions
  FOR SELECT
  TO authenticated
  USING (true);

-- Only service role can insert/update
CREATE POLICY "Service role can manage extractions"
  ON public.product_extractions
  FOR ALL
  TO service_role
  USING (true);

-- Function to clean up expired extractions
CREATE OR REPLACE FUNCTION public.cleanup_expired_extractions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM product_extractions
  WHERE expires_at < now();
END;
$$;

-- Create async extraction jobs table
CREATE TABLE IF NOT EXISTS public.extraction_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  result JSONB,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_extraction_jobs_status ON public.extraction_jobs(status);
CREATE INDEX IF NOT EXISTS idx_extraction_jobs_url ON public.extraction_jobs(product_url);

-- Enable RLS
ALTER TABLE public.extraction_jobs ENABLE ROW LEVEL SECURITY;

-- Users can view their own jobs
CREATE POLICY "Users can view extraction jobs"
  ON public.extraction_jobs
  FOR SELECT
  TO authenticated
  USING (true);

-- Service role can manage jobs
CREATE POLICY "Service role can manage jobs"
  ON public.extraction_jobs
  FOR ALL
  TO service_role
  USING (true);