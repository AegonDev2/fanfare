
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
