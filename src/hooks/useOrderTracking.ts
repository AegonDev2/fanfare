
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigation } from "@/components/navigation/useNavigation";
import type { TrackingOrder, OrderStatus } from "@/types/tracking";
import { useOrderUpdates } from "./useOrderUpdates";

export const useOrderTracking = (specificOrderId?: string) => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<TrackingOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, userRole } = useNavigation();

  const mapDatabaseStatusToTrackingStatus = (dbStatus: string): OrderStatus => {
    switch (dbStatus) {
      case 'pending_admin_approval':
        return 'waiting_admin_approval';
      case 'approved_waiting_influencer':
        return 'waiting_acceptance';
      case 'accepted':
        return 'accepted';
      case 'completed':
        return 'completed';
      case 'rejected_by_admin':
      case 'rejected_by_influencer':
        return 'rejected';
      case 'cancelled_by_user':
        return 'cancelled';
      default:
        return 'order_placed';
    }
  };

  const determineCanCancel = (order: TrackingOrder): boolean => {
    // Fan can cancel only if order is in early stages and user is a fan
    if (userRole !== 'fan') return false;
    
    return ['order_placed', 'waiting_admin_approval', 'waiting_acceptance'].includes(order.status);
  };

  const fetchOrders = async () => {
    if (!user) {
      setOrders([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      console.log("Fetching orders from unified orders table for user:", user.id, "role:", userRole, "specificOrderId:", specificOrderId);

      // Build query based on whether we need a specific order or all orders
      let query = supabase
        .from('orders')
        .select('*');

      if (specificOrderId) {
        // If specific order ID is provided, fetch only that order and verify user has permission
        query = query
          .eq('id', specificOrderId)
          .eq(userRole === 'fan' ? 'user_id' : 'influencer_id', user.id);
      } else {
        // Fetch all orders for the user
        query = query
          .eq(userRole === 'fan' ? 'user_id' : 'influencer_id', user.id)
          .order('created_at', { ascending: false });
      }

      const { data: allOrders, error } = await query;

      if (error) {
        console.error("Error fetching orders:", error);
        throw error;
      }

      console.log("Fetched orders:", allOrders);

      if (allOrders) {
        // Get unique influencer IDs to fetch their data
        const influencerIds = [...new Set(allOrders.map(order => order.influencer_id).filter(Boolean))];
        
        // Fetch influencer data separately
        let influencerData: any[] = [];
        if (influencerIds.length > 0) {
          const { data: influencers } = await supabase
            .from('influencer_profiles')
            .select('id, name')
            .in('id', influencerIds);
          
          influencerData = influencers || [];
        }

        const mappedOrders: TrackingOrder[] = allOrders.map((order: any) => {
          const influencer = influencerData.find(inf => inf.id === order.influencer_id);
          
          return {
            id: order.id,
            status: mapDatabaseStatusToTrackingStatus(order.status),
            created_at: order.created_at,
            product_url: order.product_url,
            product_title: order.product_title,
            product_price: order.product_price,
            total_amount: order.total_amount,
            message: order.message,
            influencer_message: order.influencer_message,
            delivery_estimate: order.delivery_estimate,
            completed_at: order.completed_at,
            rejected_at: order.cancelled_at, // Map cancelled_at to rejected_at for cancelled orders
            rejection_reason: order.rejection_reason,
            user_id: order.user_id,
            influencer_id: order.influencer_id,
            influencer: influencer ? { id: influencer.id, name: influencer.name } : null,
            can_cancel: false // Will be set below
          };
        });

        // Set can_cancel property for each order
        mappedOrders.forEach(order => {
          order.can_cancel = determineCanCancel(order);
        });

        setOrders(mappedOrders);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      toast({
        title: "Error loading orders",
        description: (err as Error).message || String(err),
        variant: "destructive",
      });
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId: string) => {
    try {
      // Find the order in our current state
      const order = orders.find(o => o.id === orderId);
      if (!order) {
        throw new Error("Order not found");
      }

      // Check if cancellation is allowed based on mapped status
      const cancellableStatuses = ['waiting_admin_approval', 'waiting_acceptance'];
      if (!cancellableStatuses.includes(order.status)) {
        throw new Error("This order cannot be cancelled. Only pending orders can be cancelled.");
      }

      // Check if user owns the order
      if (order.user_id !== user?.id) {
        throw new Error("You can only cancel your own orders");
      }

      // Update the order status to cancelled in the unified orders table
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: 'cancelled_by_user',
          cancelled_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .eq('user_id', user?.id); // Add user_id check for extra security
      
      if (error) {
        console.error("Database error:", error);
        throw new Error("Failed to cancel order: " + error.message);
      }

      toast({
        title: "Order Cancelled",
        description: "Your order has been successfully cancelled",
      });

      // Refresh orders
      await fetchOrders();
    } catch (error: any) {
      console.error("Cancel order error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to cancel the order",
        variant: "destructive"
      });
    }
  };

  const handleOrderUpdate = useCallback((orderId: string, updatedFields: any) => {
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === orderId 
          ? { ...order, ...updatedFields }
          : order
      )
    );
  }, []);

  useOrderUpdates(handleOrderUpdate);

  useEffect(() => {
    fetchOrders();
  }, [user, userRole, specificOrderId]);

  return {
    orders,
    loading,
    fetchOrders,
    cancelOrder
  };
};
