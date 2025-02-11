
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
}

export interface InfluencerAddress {
  id: string;
  street_address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}
