
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
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Load cart from localStorage only once on component mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('giftCart');
      console.log("Checking localStorage for cart:", savedCart);
      
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        console.log("Loading cart from localStorage:", parsedCart);
        setCartItems(parsedCart);
      }
      setIsInitialized(true);
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      setIsInitialized(true);
    }
  }, []);

  // Save cart to localStorage whenever it changes, but only after initial load
  useEffect(() => {
    if (!isInitialized) {
      return; // Skip saving during initialization to prevent overwriting
    }
    
    try {
      console.log("Saving cart to localStorage:", cartItems);
      localStorage.setItem('giftCart', JSON.stringify(cartItems));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [cartItems, isInitialized]);

  const addToCart = (gift: GiftItem, influencerId: string, message?: string) => {
    console.log("Adding to cart:", { gift, influencerId, message });
    
    // Create a sanitized gift object to ensure it can be serialized
    const sanitizedGift = {
      ...gift,
      // Ensure all properties are serializable
      id: gift.id || "",
      name: gift.name || "",
      price: gift.price || 0,
      image_url: gift.image_url || "",
      description: gift.description || "",
      is_featured: gift.is_featured || false,
      created_at: gift.created_at || new Date().toISOString(),
      updated_at: gift.updated_at || new Date().toISOString(),
      gift_url: gift.gift_url || "",
    };
    
    const newItem = { gift: sanitizedGift, influencerId, message };
    console.log("New cart item to be added:", newItem);
    
    // Add new item to cart
    setCartItems(prev => {
      const newCart = [...prev, newItem];
      console.log("Updated cart items:", newCart);
      return newCart;
    });
    
    // Double-check that the item was added to localStorage
    setTimeout(() => {
      const currentStorage = localStorage.getItem('giftCart');
      console.log("Verifying localStorage after add:", currentStorage);
    }, 100);
    
    toast({
      title: 'Added to Cart',
      description: `${gift.name} added to your gift cart`,
    });
  };

  const removeFromCart = (index: number) => {
    console.log("Removing item at index:", index);
    setCartItems(prev => {
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
    console.log("Clearing cart");
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
