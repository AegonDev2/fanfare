
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigation } from "@/components/navigation/useNavigation";
import type { TrackingOrder, OrderStatus } from "@/types/tracking";

export const useOrderTracking = () => {
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
      console.log("Fetching orders from unified orders table for user:", user.id, "role:", userRole);

      // Fetch from the unified orders table
      const { data: allOrders, error } = await supabase
        .from('orders')
        .select('*')
        .eq(userRole === 'fan' ? 'user_id' : 'influencer_id', user.id)
        .order('created_at', { ascending: false });

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

      // Check if cancellation is allowed
      if (!order.can_cancel) {
        throw new Error("This order cannot be cancelled");
      }

      // Update the order status to cancelled in the unified orders table
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: 'cancelled_by_user',
          cancelled_at: new Date().toISOString()
        })
        .eq('id', orderId);
      
      if (error) throw error;

      toast({
        title: "Order Cancelled",
        description: "Your order has been successfully cancelled",
      });

      // Refresh orders
      await fetchOrders();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to cancel the order",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user, userRole]);

  return {
    orders,
    loading,
    fetchOrders,
    cancelOrder
  };
};
