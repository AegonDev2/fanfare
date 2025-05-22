import { useDbCart } from './useDbCart';

export interface CartItem {
  gift: {
    id?: string;
    name: string;
    price: number;
    image_url?: string;
    description?: string;
    is_featured?: boolean;
    created_at?: string;
    updated_at?: string;
    gift_url?: string;
  };
  influencerId: string;
  message?: string;
}

export function useGiftCart() {
  const dbCart = useDbCart();

  // Convert DB cart items to legacy format if needed
  return dbCart;
}

export default useGiftCart;
