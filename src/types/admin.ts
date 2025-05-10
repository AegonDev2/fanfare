
import type { Json } from "@/integrations/supabase/types";

// Base order type
export interface BaseOrder {
  id: string;
  created_at: string;
  user_id: string;
  influencer_id: string;
  product_url: string;
  product_title: string | null;
  product_price: number | null;
  platform_fee: number | null;
  total_amount: number | null;
  message: string | null;
  shipping_address: Json;
  influencer: {
    id: string;
    name: string;
    avatar_url?: string;
  } | null;
}

// Order that's under process
export interface UnderProcessOrder extends BaseOrder {
  status: 'under_process';
}

// Order that's completed
export interface CompletedOrder extends BaseOrder {
  status: 'completed';
  completed_at: string | null;
  delivery_estimate: string | null;
}

// Additional fields added during API enrichment
export interface EnrichedOrderFields {
  fan_email: string;
  fan_name: string;
  influencer_name: string;
}

// Combined type for orders in the admin panel
export type OrderDetails = (UnderProcessOrder | CompletedOrder) & EnrichedOrderFields;
