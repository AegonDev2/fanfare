
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { GiftItem } from './useGiftItems';

export interface CartItem {
  gift: GiftItem;
  influencerId: string;
  message?: string;
}

export function useGiftCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { toast } = useToast();
  
  // Load cart from localStorage on component mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('giftCart');
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('giftCart', JSON.stringify(cartItems));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [cartItems]);

  const addToCart = (gift: GiftItem, influencerId: string, message?: string) => {
    setCartItems((prev) => [...prev, { gift, influencerId, message }]);
    
    toast({
      title: 'Added to Cart',
      description: `${gift.name} added to your gift cart`,
    });
  };

  const removeFromCart = (index: number) => {
    setCartItems((prev) => {
      const newCart = [...prev];
      newCart.splice(index, 1);
      return newCart;
    });
    
    toast({
      title: 'Removed from Cart',
      description: 'Item removed from your gift cart',
    });
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('giftCart');
    
    toast({
      title: 'Cart Cleared',
      description: 'All items have been removed from your cart',
    });
  };

  return {
    cartItems,
    addToCart,
    removeFromCart,
    clearCart,
    cartCount: cartItems.length,
  };
}

export default useGiftCart;
