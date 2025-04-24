
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
  // Additional enriched fields
  fan_email?: string;
  influencer_name?: string;
}

interface UnderProcessOrder extends BaseOrder {
  status: 'under_process';
}

interface AcceptedOrder extends BaseOrder {
  status: 'accepted';
  processing_started_at: string | null;
}

interface CompletedOrder extends BaseOrder {
  status: 'completed';
  completed_at: string;
  delivery_estimate?: string;
}

export type OrderDetails = UnderProcessOrder | AcceptedOrder | CompletedOrder;
