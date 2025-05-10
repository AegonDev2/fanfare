
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface WishlistItem {
  id: string;
  influencer_id: string;
  product_title: string;
  product_url: string;
  product_image_url?: string;
  product_price?: number;
  comment?: string;
  created_at: string;
  updated_at: string;
}

export const useInfluencerWishlist = (influencerId: string) => {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchWishlist = async () => {
    if (!influencerId) {
      setWishlist([]);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
      console.log("Fetching wishlist for influencer:", influencerId);
      const { data, error } = await supabase
        .from("influencer_wishlist")
        .select("*")
        .eq("influencer_id", influencerId)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      console.log("Wishlist data received:", data);
      setWishlist(data || []);
    } catch (error: any) {
      console.error("Error fetching wishlist:", error);
      toast({
        title: "Error loading wishlist",
        description: error.message || "Failed to load wishlist items",
        variant: "destructive",
      });
      setWishlist([]);
    } finally {
      setIsLoading(false);
    }
  };

  const addWishlistItem = async (item: Omit<WishlistItem, "id" | "influencer_id" | "created_at" | "updated_at">) => {
    try {
      const { data, error } = await supabase
        .from("influencer_wishlist")
        .insert([{
          influencer_id: influencerId,
          ...item
        }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      setWishlist(prev => [data, ...prev]);
      toast({
        title: "Item added",
        description: "Wishlist item has been added successfully",
      });
      
      return data;
    } catch (error: any) {
      console.error("Error adding wishlist item:", error);
      toast({
        title: "Error adding item",
        description: error.message || "Failed to add wishlist item",
        variant: "destructive",
      });
      throw error;
    }
  };

  const removeWishlistItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from("influencer_wishlist")
        .delete()
        .eq("id", itemId);

      if (error) {
        throw error;
      }

      setWishlist(prev => prev.filter(item => item.id !== itemId));
      toast({
        title: "Item removed",
        description: "Wishlist item has been removed successfully",
      });
    } catch (error: any) {
      console.error("Error removing wishlist item:", error);
      toast({
        title: "Error removing item",
        description: error.message || "Failed to remove wishlist item",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [influencerId]);

  return {
    wishlist,
    isLoading,
    fetchWishlist,
    addWishlistItem,
    removeWishlistItem
  };
};
