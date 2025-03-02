
export interface ProductDetails {
  name: string;
  description: string;
  price: number;
  priceInr: number;
  platformFee: number;
  image: string;
  originalPrice?: number;
  hasDiscount?: boolean;
  id?: string;
  platform?: 'amazon' | 'flipkart';
}

export interface InfluencerAddress {
  id: string;
  influencer_id?: string;
  name?: string; // Made optional
  street_address: string;
  address_line1?: string; // Optional for backward compatibility
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone?: string; // Made optional
  is_primary?: boolean;
  created_at?: string;
}

export interface EcommerceOrder {
  platform: 'amazon' | 'flipkart';
  productUrl: string;
  quantity: number;
  useStoredAddress: boolean;
}
