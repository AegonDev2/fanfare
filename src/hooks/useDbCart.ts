
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/hooks/useUser';
import { GiftItem } from './useGiftItems';

export interface DbCartItem {
  id: string;
  cart_id: string;
  gift_id: string | null;
  gift_name: string;
  gift_price: number;
  gift_image_url?: string;
  gift_description?: string;
  gift_url?: string;
  influencer_id: string;
  message?: string;
  created_at: string;
  updated_at: string;
  quantity: number;
}

export interface DbCart {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  items: DbCartItem[];
}

export function useDbCart() {
  const [isLoading, setIsLoading] = useState(true);
  const [cartId, setCartId] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<DbCartItem[]>([]);
  const { user } = useUser();
  const { toast } = useToast();

  const fetchCart = useCallback(async () => {
    if (!user) {
      console.log("User not authenticated, can't fetch cart");
      setCartItems([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      console.log("Fetching cart for user:", user.id);
      
      // Try to get existing cart
      let { data: existingCart, error: cartError } = await supabase
        .from('user_cart')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (cartError && cartError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error("Error fetching cart:", cartError);
        throw cartError;
      }

      let userCartId: string;

      if (!existingCart) {
        // Create a new cart if none exists
        console.log("No existing cart found, creating new cart");
        const { data: newCart, error: createError } = await supabase
          .from('user_cart')
          .insert({ user_id: user.id })
          .select('id')
          .single();

        if (createError) {
          console.error("Error creating new cart:", createError);
          throw createError;
        }

        userCartId = newCart.id;
        console.log("New cart created with ID:", userCartId);
      } else {
        userCartId = existingCart.id;
        console.log("Existing cart found with ID:", userCartId);
      }

      setCartId(userCartId);

      // Fetch cart items
      const { data: items, error: itemsError } = await supabase
        .from('cart_items')
        .select('*')
        .eq('cart_id', userCartId);

      if (itemsError) {
        console.error("Error fetching cart items:", itemsError);
        throw itemsError;
      }

      console.log(`Fetched ${items?.length || 0} cart items:`, items);
      
      // Ensure each item has a quantity property with default 1
      const itemsWithQuantity = (items || []).map(item => ({
        ...item,
        quantity: item.quantity || 1
      }));
      
      setCartItems(itemsWithQuantity);
    } catch (error) {
      console.error("Error in fetchCart:", error);
      toast({
        title: 'Cart Error',
        description: 'Unable to load your cart. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  // Only run fetchCart when the user changes
  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setCartItems([]);
      setCartId(null);
    }
  }, [user, fetchCart]);

  const addToCart = useCallback(async (
    gift: GiftItem,
    influencerId: string,
    message?: string
  ) => {
    if (!user) {
      console.error("User not authenticated, cannot add to cart");
      toast({
        title: 'Authentication Required',
        description: 'Please log in to add items to your cart',
        variant: 'destructive',
      });
      return;
    }

    if (!cartId) {
      console.error("No cart ID available");
      toast({
        title: 'Cart Error',
        description: 'There was an issue with your cart. Please refresh the page.',
        variant: 'destructive',
      });
      return;
    }

    try {
      console.log("Adding to cart:", { gift, influencerId, message });
      
      const { data, error } = await supabase
        .from('cart_items')
        .insert({
          cart_id: cartId,
          gift_id: gift.id || null,
          gift_name: gift.name || 'Unknown Gift',
          gift_price: gift.price || 0,
          gift_image_url: gift.image_url || null,
          gift_description: gift.description || null,
          gift_url: gift.gift_url || null,
          influencer_id: influencerId,
          message: message || null,
          quantity: 1
        })
        .select();

      if (error) {
        console.error("Error adding to cart:", error);
        throw error;
      }

      console.log("Successfully added to cart:", data);

      // Refresh cart items
      fetchCart();
      
      toast({
        title: 'Added to Cart',
        description: `${gift.name} added to your cart`,
      });
    } catch (error: any) {
      console.error("Error in addToCart:", error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add item to cart',
        variant: 'destructive',
      });
    }
  }, [user, cartId, toast, fetchCart]);

  const removeFromCart = useCallback(async (itemId: string) => {
    try {
      console.log("Removing item from cart:", itemId);
      
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId);

      if (error) {
        console.error("Error removing from cart:", error);
        throw error;
      }

      // Refresh cart items
      fetchCart();
      
      toast({
        title: 'Removed from Cart',
        description: 'Item removed from your cart',
      });
    } catch (error: any) {
      console.error("Error in removeFromCart:", error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove item from cart',
        variant: 'destructive',
      });
    }
  }, [toast, fetchCart]);

  const clearCart = useCallback(async () => {
    if (!cartId) return;

    try {
      console.log("Clearing cart:", cartId);
      
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('cart_id', cartId);

      if (error) {
        console.error("Error clearing cart:", error);
        throw error;
      }

      // Refresh cart items
      fetchCart();
      
      toast({
        title: 'Cart Cleared',
        description: 'All items have been removed from your cart',
      });
    } catch (error: any) {
      console.error("Error in clearCart:", error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to clear cart',
        variant: 'destructive',
      });
    }
  }, [cartId, toast, fetchCart]);

  const checkout = useCallback(async () => {
    if (!cartId || !user || cartItems.length === 0) {
      console.error("Cannot checkout: missing cart ID, user, or empty cart");
      return null;
    }

    try {
      console.log("Processing checkout for cart:", cartId);
      
      // Calculate total amount
      const itemsTotal = cartItems.reduce((sum, item) => sum + Number(item.gift_price) * (item.quantity || 1), 0);
      const platformFee = cartItems.length * 5; // Assuming 5 per item
      const totalAmount = itemsTotal + platformFee;
      
      // Create order
      const { data: order, error: orderError } = await supabase
        .from('gift_orders')
        .insert({
          user_id: user.id,
          status: 'pending',
          platform_fee: platformFee,
          total_amount: totalAmount
        })
        .select()
        .single();

      if (orderError) {
        console.error("Error creating order:", orderError);
        throw orderError;
      }

      console.log("Order created:", order);
      
      // Add order items
      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        gift_name: item.gift_name,
        gift_price: item.gift_price,
        gift_image_url: item.gift_image_url,
        gift_description: item.gift_description,
        gift_url: item.gift_url || '',
        influencer_id: item.influencer_id,
        status: 'pending',
        message: item.message
      }));

      const { error: itemsError } = await supabase
        .from('gift_order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error("Error adding order items:", itemsError);
        throw itemsError;
      }

      // Clear the cart after successful checkout
      await clearCart();
      
      toast({
        title: 'Order Placed',
        description: 'Your order has been placed successfully',
      });

      return order.id;
    } catch (error: any) {
      console.error("Error in checkout:", error);
      toast({
        title: 'Checkout Failed',
        description: error.message || 'There was an error processing your order',
        variant: 'destructive',
      });
      return null;
    }
  }, [cartId, user, cartItems, clearCart, toast]);

  const updateCartItemQuantity = useCallback(async (itemId: string, quantity: number) => {
    try {
      if (quantity < 1) {
        return removeFromCart(itemId);
      }
      
      console.log(`Updating quantity for item ${itemId} to ${quantity}`);
      
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', itemId);

      if (error) {
        console.error("Error updating cart item quantity:", error);
        throw error;
      }

      // Update local state
      setCartItems(prevItems => 
        prevItems.map(item => 
          item.id === itemId ? { ...item, quantity } : item
        )
      );
      
    } catch (error: any) {
      console.error("Error in updateCartItemQuantity:", error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update quantity',
        variant: 'destructive',
      });
    }
  }, [toast, removeFromCart]);

  return {
    isLoading,
    cartItems,
    cartId,
    addToCart,
    removeFromCart,
    clearCart,
    checkout,
    refreshCart: fetchCart,
    cartCount: cartItems.length,
    updateCartItemQuantity
  };
}

export default useDbCart;
