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

  const mapDatabaseStatusToTrackingStatus = (
    tableName: string, 
    dbOrder: any
  ): OrderStatus => {
    switch (tableName) {
      case 'orders_under_process':
        return 'waiting_admin_approval';
      case 'gift_requests':
        if (dbOrder.admin_approved && !dbOrder.influencer_response) {
          return 'waiting_acceptance';
        }
        if (dbOrder.status === 'accepted') {
          return 'accepted';
        }
        if (dbOrder.status === 'rejected') {
          return 'rejected';
        }
        if (dbOrder.status === 'completed') {
          return 'completed';
        }
        return 'order_placed';
      case 'orders_completed':
        return 'completed';
      case 'orders_rejected':
        return 'rejected';
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
      let allOrders: TrackingOrder[] = [];

      // Fetch from orders_under_process (waiting admin approval)
      const { data: underProcessOrders, error: underProcessError } = await supabase
        .from('orders_under_process')
        .select(`
          *,
          influencer:influencer_profiles(id, name)
        `)
        .eq(userRole === 'fan' ? 'user_id' : 'influencer_id', user.id)
        .order('created_at', { ascending: false });

      if (!underProcessError && underProcessOrders) {
        const mappedOrders = underProcessOrders.map((order: any) => ({
          ...order,
          status: mapDatabaseStatusToTrackingStatus('orders_under_process', order),
          can_cancel: determineCanCancel({
            ...order,
            status: mapDatabaseStatusToTrackingStatus('orders_under_process', order)
          } as TrackingOrder)
        }));
        allOrders.push(...mappedOrders);
      }

      // Fetch from gift_requests (various statuses)
      const { data: giftRequests, error: giftRequestsError } = await supabase
        .from('gift_requests')
        .select(`
          *,
          influencer:influencer_profiles(id, name)
        `)
        .eq(userRole === 'fan' ? 'sender_id' : 'influencer_id', user.id)
        .order('created_at', { ascending: false });

      if (!giftRequestsError && giftRequests) {
        const mappedRequests = giftRequests.map((request: any) => ({
          id: request.id,
          status: mapDatabaseStatusToTrackingStatus('gift_requests', request),
          created_at: request.created_at,
          product_url: request.product_url,
          product_title: request.product_title,
          product_price: request.product_price,
          total_amount: request.product_price ? request.product_price + 5 : null,
          message: request.message,
          delivery_estimate: request.delivery_estimate,
          completed_at: request.completed_at,
          rejection_reason: request.influencer_response === 'rejected' ? 'Rejected by influencer' : null,
          user_id: request.sender_id,
          influencer_id: request.influencer_id,
          influencer: request.influencer,
          can_cancel: determineCanCancel({
            id: request.id,
            status: mapDatabaseStatusToTrackingStatus('gift_requests', request),
            user_id: request.sender_id,
            influencer_id: request.influencer_id
          } as TrackingOrder)
        }));
        allOrders.push(...mappedRequests);
      }

      // Fetch from orders_completed
      const { data: completedOrders, error: completedError } = await supabase
        .from('orders_completed')
        .select(`
          *
        `)
        .eq(userRole === 'fan' ? 'user_id' : 'influencer_id', user.id)
        .order('created_at', { ascending: false });

      if (!completedError && completedOrders) {
        const mappedCompleted = completedOrders.map((order: any) => ({
          ...order,
          status: mapDatabaseStatusToTrackingStatus('orders_completed', order),
          can_cancel: false
        }));
        allOrders.push(...mappedCompleted);
      }

      // Fetch from orders_rejected
      const { data: rejectedOrders, error: rejectedError } = await supabase
        .from('orders_rejected')
        .select(`
          *
        `)
        .eq(userRole === 'fan' ? 'user_id' : 'influencer_id', user.id)
        .order('created_at', { ascending: false });

      if (!rejectedError && rejectedOrders) {
        const mappedRejected = rejectedOrders.map((order: any) => ({
          id: order.id,
          status: mapDatabaseStatusToTrackingStatus('orders_rejected', order),
          created_at: order.created_at,
          product_url: order.product_url,
          product_title: order.product_title,
          product_price: order.product_price,
          total_amount: order.total_amount,
          message: order.message,
          rejected_at: order.rejected_at,
          rejection_reason: order.rejection_reason,
          user_id: order.user_id,
          influencer_id: order.influencer_id,
          can_cancel: false
        }));
        allOrders.push(...mappedRejected);
      }

      // Remove duplicates based on original order ID and sort by creation date
      const uniqueOrders = allOrders.filter((order, index, self) => 
        index === self.findIndex(o => o.id === order.id)
      ).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setOrders(uniqueOrders);
    } catch (err) {
      console.error("Error fetching orders:", err);
      toast({
        title: "Error loading orders",
        description: (err as Error).message || String(err),
        variant: "destructive",
      });
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

      // Determine which table to cancel from based on current status
      if (order.status === 'waiting_admin_approval') {
        // Delete from orders_under_process
        const { error } = await supabase
          .from('orders_under_process')
          .delete()
          .eq('id', orderId);
        
        if (error) throw error;
      } else if (order.status === 'waiting_acceptance') {
        // Update gift_request status to cancelled
        const { error } = await supabase
          .from('gift_requests')
          .update({ status: 'rejected', influencer_response: 'cancelled_by_fan' })
          .eq('id', orderId);
        
        if (error) throw error;
      }

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