
import { useDbCart, DbCartItem } from './useDbCart';

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
  id: string;
  quantity?: number;
}

export function useGiftCart() {
  const dbCart = useDbCart();
  
  // Convert DB cart items to format expected by the UI
  const items: CartItem[] = dbCart.cartItems.map((item: DbCartItem) => ({
    id: item.id,
    gift: {
      id: item.gift_id || undefined,
      name: item.gift_name,
      price: item.gift_price,
      image_url: item.gift_image_url,
      description: item.gift_description,
      gift_url: item.gift_url,
    },
    influencerId: item.influencer_id,
    message: item.message,
    quantity: 1 // Default quantity
  }));
  
  return {
    ...dbCart,
    items
  };
}

export default useGiftCart;
