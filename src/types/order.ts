
export interface ProductDetails {
  id?: string;
  name: string;
  description: string;
  price?: string;
  priceInr: number;
  platformFee: number;
  image?: string;
  imageUrl?: string;
  previewUrl?: string;
}

export interface InfluencerAddress {
  id: string;
  name: string;
  street_address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string;
  is_primary: boolean;
  influencer_id: string;
  created_at: string;
}

export interface OrderFormData {
  giftUrl: string;
  message: string;
  influencerId: string;
  productDetails: ProductDetails;
  shippingAddress: InfluencerAddress;
}

// Gift-specific interface to clarify the purpose
export interface GiftRequest {
  id: string;
  sender_id: string;
  influencer_id: string;
  product_url: string;
  product_title?: string;
  product_price?: number;
  message?: string;
  status: string;
  created_at: string;
  admin_approved?: boolean;
  influencer_response?: string;
}
