
-- Create function to execute raw SQL queries
-- This function should be used with caution as it executes raw SQL
CREATE OR REPLACE FUNCTION public.query_raw(query text)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  EXECUTE 'SELECT json_agg(t) FROM (' || query || ') t' INTO result;
  RETURN result;
EXCEPTION WHEN OTHERS THEN
  RAISE;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.query_raw TO authenticated;
