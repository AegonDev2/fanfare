
export interface ExtractedProduct {
  name: string | null;
  price: string | null;
  image: string | null;
  description: string | null;
  platform?: 'amazon' | 'flipkart';
  hasDiscount?: boolean;
  originalPrice?: string | null;
  availability?: string | null;
  rating?: number | null;
  reviewCount?: number | null;
}
