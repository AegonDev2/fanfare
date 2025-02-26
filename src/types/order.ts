
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
  street_address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_primary?: boolean;
}

export interface EcommerceOrder {
  platform: 'amazon' | 'flipkart';
  productUrl: string;
  quantity: number;
  useStoredAddress: boolean;
}
