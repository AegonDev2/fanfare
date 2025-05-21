
import { useState, useEffect, useCallback } from 'react';
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
  
  // Load cart from localStorage once on component mount
  useEffect(() => {
    const loadCart = () => {
      try {
        const savedCart = localStorage.getItem('giftCart');
        console.log("Initial loading from localStorage:", savedCart);
        
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          console.log("Parsed cart from localStorage:", parsedCart);
          
          // Validate parsed cart
          if (Array.isArray(parsedCart)) {
            setCartItems(parsedCart);
            console.log("Cart loaded successfully with items:", parsedCart.length);
          } else {
            console.error("Invalid cart format in localStorage, resetting");
            localStorage.removeItem('giftCart');
          }
        } else {
          console.log("No cart found in localStorage");
        }
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        localStorage.removeItem('giftCart'); // Reset corrupted data
      } finally {
        setIsInitialized(true);
      }
    };
    
    loadCart();
  }, []);

  // Save cart to localStorage whenever it changes, but only after initial load
  useEffect(() => {
    if (!isInitialized) {
      return; // Skip saving during initialization
    }
    
    try {
      console.log("Saving to localStorage, items count:", cartItems.length);
      localStorage.setItem('giftCart', JSON.stringify(cartItems));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [cartItems, isInitialized]);

  // Function to add item to cart
  const addToCart = useCallback((gift: GiftItem, influencerId: string, message?: string) => {
    console.log("addToCart called with:", { 
      giftId: gift.id,
      giftName: gift.name,
      influencerId,
      messageLength: message?.length
    });
    
    // Create a sanitized gift object to ensure it can be serialized
    const sanitizedGift = {
      ...gift,
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
    console.log("Prepared new cart item:", newItem);
    
    // Add new item to cart
    setCartItems(prev => {
      const newCart = [...prev, newItem];
      console.log("Updated cart will have items:", newCart.length);
      return newCart;
    });
    
    // Verify localStorage update
    setTimeout(() => {
      const currentStorage = localStorage.getItem('giftCart');
      const parsedStorage = currentStorage ? JSON.parse(currentStorage) : [];
      console.log("Verification - localStorage items count:", parsedStorage.length);
    }, 100);
    
    toast({
      title: 'Added to Cart',
      description: `${gift.name} added to your gift cart`,
    });
  }, [toast]);

  // Function to remove item from cart
  const removeFromCart = useCallback((index: number) => {
    console.log("Removing item at index:", index);
    setCartItems(prev => {
      const newCart = [...prev];
      newCart.splice(index, 1);
      console.log("Cart after removal, items count:", newCart.length);
      return newCart;
    });
    
    toast({
      title: 'Removed from Cart',
      description: 'Item removed from your gift cart',
    });
  }, [toast]);

  // Function to clear the cart
  const clearCart = useCallback(() => {
    console.log("Clearing cart");
    setCartItems([]);
    localStorage.removeItem('giftCart');
    
    toast({
      title: 'Cart Cleared',
      description: 'All items have been removed from your cart',
    });
  }, [toast]);

  return {
    cartItems,
    addToCart,
    removeFromCart,
    clearCart,
    cartCount: cartItems.length,
  };
}

export default useGiftCart;
