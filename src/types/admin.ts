export interface OrderDetails {
  id: string;
  status: string;
  created_at: string;
  product_url: string;
  product_title: string | null;
  product_price: number | null;
  platform_fee: number | null;
  total_amount: number | null;
  message?: string;
  user_id: string;
  fan_id?: string;
  fan_email?: string;
  influencer_id: string | null;
  influencer_name?: string;
  shipping_address?: any;
  processing_started_at?: string;
  completed_at?: string;
  delivery_estimate?: string;
  rejection_reason?: string;
}

export interface BaseOrder {
  id: string;
  created_at: string;
  user_id: string | null;
  influencer_id: string | null;
  product_url: string;
  product_title: string | null;
  product_price: number | null;
  platform_fee: number | null;
  total_amount: number | null;
  message: string | null;
  shipping_address: any;
}

interface UnderProcessOrder extends BaseOrder {
  status: 'under_process';
}

interface AcceptedOrder extends BaseOrder {
  status: 'accepted';
  processing_started_at: string | null;
}

export type OrderDetails = UnderProcessOrder | AcceptedOrder;
