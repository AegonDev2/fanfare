
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/hooks/useUser';

export interface CartItem {
  id: string;
  user_id: string;
  gift_id: string | null;
  gift_name: string;
  gift_price: number;
  gift_image_url: string | null;
  gift_description: string | null;
  gift_url: string | null;
  influencer_id: string;
  message: string | null;
  quantity: number;
  created_at: string;
  updated_at: string;
}

export function useCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useUser();
  const { toast } = useToast();

  const fetchCartItems = useCallback(async () => {
    if (!user) {
      console.log("User not authenticated, can't fetch cart");
      setCartItems([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      console.log("Fetching cart items for user:", user.id);
      
      const { data, error } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching cart items:", error);
        throw error;
      }

      console.log("Fetched cart items:", data);
      setCartItems(data || []);
    } catch (error) {
      console.error("Error in fetchCartItems:", error);
      toast({
        title: 'Error',
        description: 'Failed to load cart items',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchCartItems();
  }, [fetchCartItems]);

  const addToCart = useCallback(async (item: {
    gift_id?: string;
    gift_name: string;
    gift_price: number;
    gift_image_url?: string;
    gift_description?: string;
    gift_url?: string;
    influencer_id: string;
    message?: string;
  }) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to add items to your cart',
        variant: 'destructive',
      });
      return;
    }

    try {
      console.log("Adding item to cart:", item);
      
      // Check if item already exists in cart
      const existingItem = cartItems.find(
        cartItem => 
          cartItem.gift_name === item.gift_name && 
          cartItem.influencer_id === item.influencer_id &&
          cartItem.gift_url === item.gift_url
      );

      if (existingItem) {
        // Update quantity instead of adding duplicate
        await updateQuantity(existingItem.id, existingItem.quantity + 1);
        toast({
          title: 'Updated Cart',
          description: `${item.gift_name} quantity updated in your cart`,
        });
        return;
      }

      // Insert new item with proper data structure
      const insertData = {
        user_id: user.id,
        gift_id: item.gift_id || null,
        gift_name: item.gift_name,
        gift_price: Number(item.gift_price),
        gift_image_url: item.gift_image_url || null,
        gift_description: item.gift_description || null,
        gift_url: item.gift_url || null,
        influencer_id: item.influencer_id,
        message: item.message || null,
        quantity: 1
      };

      console.log("Inserting cart item:", insertData);

      const { data, error } = await supabase
        .from('cart_items')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error("Error adding to cart:", error);
        throw error;
      }

      console.log("Item added to cart successfully:", data);
      
      // Refresh cart items
      await fetchCartItems();
      
      toast({
        title: 'Added to Cart',
        description: `${item.gift_name} has been added to your cart`,
      });
    } catch (error: any) {
      console.error("Error in addToCart:", error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add item to cart',
        variant: 'destructive',
      });
    }
  }, [user, toast, fetchCartItems, cartItems]);

  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    if (quantity < 1) {
      return removeFromCart(itemId);
    }

    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to update cart',
        variant: 'destructive',
      });
      return;
    }

    try {
      console.log(`Updating quantity for item ${itemId} to ${quantity}`);
      
      const { error } = await supabase
        .from('cart_items')
        .update({ 
          quantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId)
        .eq('user_id', user.id);

      if (error) {
        console.error("Error updating quantity:", error);
        throw error;
      }

      // Update local state optimistically
      setCartItems(prev => 
        prev.map(item => 
          item.id === itemId ? { ...item, quantity } : item
        )
      );

      console.log(`Successfully updated quantity for item ${itemId}`);
    } catch (error: any) {
      console.error("Error in updateQuantity:", error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update quantity',
        variant: 'destructive',
      });
    }
  }, [user, toast]);

  const removeFromCart = useCallback(async (itemId: string) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to remove items',
        variant: 'destructive',
      });
      return;
    }

    try {
      console.log("Removing item from cart:", itemId);
      
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId)
        .eq('user_id', user.id);

      if (error) {
        console.error("Error removing from cart:", error);
        throw error;
      }

      // Update local state immediately
      setCartItems(prev => prev.filter(item => item.id !== itemId));
      
      toast({
        title: 'Removed from Cart',
        description: 'Item has been removed from your cart',
      });
      
      console.log(`Successfully removed item ${itemId} from cart`);
    } catch (error: any) {
      console.error("Error in removeFromCart:", error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove item from cart',
        variant: 'destructive',
      });
    }
  }, [user, toast]);

  const clearCart = useCallback(async () => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to clear cart',
        variant: 'destructive',
      });
      return;
    }

    try {
      console.log("Clearing cart for user:", user.id);
      
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error("Error clearing cart:", error);
        throw error;
      }

      setCartItems([]);
      
      toast({
        title: 'Cart Cleared',
        description: 'All items have been removed from your cart',
      });
      
      console.log("Successfully cleared cart");
    } catch (error: any) {
      console.error("Error in clearCart:", error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to clear cart',
        variant: 'destructive',
      });
    }
  }, [user, toast]);

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.gift_price * item.quantity), 0);
  const platformFee = cartItems.length > 0 ? cartItems.length * 5 : 0;
  const total = subtotal + platformFee;
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return {
    cartItems,
    isLoading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    refreshCart: fetchCartItems,
    subtotal,
    platformFee,
    total,
    itemCount
  };
}
