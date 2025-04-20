
// Import from a URL for Deno compatibility
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

export const getSupabaseClient = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    {
      auth: {
        persistSession: false,
      },
    }
  );
};

export const getActiveCredentials = async (supabaseClient: any, platform: string) => {
  const { data: credentials, error } = await supabaseClient
    .from('ecommerce_credentials')
    .select('*')
    .eq('platform', platform)
    .eq('is_active', true)
    .single();

  if (error || !credentials) {
    throw new Error(`No active credentials found for ${platform}`);
  }

  return credentials;
};

export const getDeliveryAddress = async (supabaseClient: any, addressId: string) => {
  const { data: address, error } = await supabaseClient
    .from('influencer_addresses')
    .select('*')
    .eq('id', addressId)
    .single();

  if (error || !address) {
    throw new Error('Failed to fetch delivery address');
  }

  return address;
};
