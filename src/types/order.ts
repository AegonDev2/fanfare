
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
  name: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string;
  is_primary?: boolean;
  street_address?: string; // Keep for backward compatibility
}

export interface EcommerceOrder {
  platform: 'amazon' | 'flipkart';
  productUrl: string;
  quantity: number;
  useStoredAddress: boolean;
}
