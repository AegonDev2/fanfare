
export interface ExtractedProduct {
  name: string | null;
  price: string | null;
  image: string | null;
  description: string | null;
  platform?: 'amazon' | 'flipkart';
}
