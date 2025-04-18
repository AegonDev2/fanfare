
export interface ProductDetails {
  name: string;
  price: number;
  priceInr: number;
  platformFee: number;
  image: string;
  id?: string;
  platform?: 'amazon' | 'flipkart';
}
