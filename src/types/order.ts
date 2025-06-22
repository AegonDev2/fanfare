
export interface ProductDetails {
  id?: string;
  name: string;
  description: string;
  priceInr: number;
  platformFee: number;
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
