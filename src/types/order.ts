
export interface ProductDetails {
  name: string;
  price: number;
  priceInr: number;
  platformFee: number;
  image: string;
  id?: string;
  platform?: 'amazon' | 'flipkart' | 'other';
  description?: string;
}

export interface InfluencerAddress {
  id: string;
  name?: string;
  street_address: string;
  address_line1?: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone?: string;
  is_primary: boolean;
  influencer_id: string;
  created_at: string;
}
