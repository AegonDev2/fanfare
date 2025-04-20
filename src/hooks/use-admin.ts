
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { hasRole } from "@/utils/roleManager";
import type { OrderDetails } from "@/types/admin";

export const useAdmin = () => {
  const [orders, setOrders] = useState<OrderDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      const isAdmin = await hasRole(user.id, 'admin');
      
      if (!isAdmin) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to view this page.",
          variant: "destructive"
        });
        navigate('/');
        return;
      }

      setUserRole('admin');
    } catch (error) {
      console.error("Authentication error:", error);
      navigate('/auth');
    }
  };

  const fetchAllOrders = async () => {
    setIsLoading(true);
    try {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*, influencer:influencer_id(*)')
        .in('status', ['accepted', 'processing', 'pending'])
        .order('created_at', { ascending: false });

      if (orderError) {
        throw orderError;
      }

      const enrichedOrders = await Promise.all(
        (orderData || []).map(async (order) => {
          const { data: fanData } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', order.user_id)
            .maybeSingle();

          const influencerName = order.influencer?.name || "Unknown";
          
          return {
            ...order,
            fan_email: fanData?.email || "Unknown",
            influencer_name: influencerName,
          };
        })
      );

      setOrders(enrichedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast({
        title: "Error",
        description: "Failed to load orders. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOrderProcessing = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: "processing" })
        .eq('id', orderId);

      if (error) throw error;

      fetchAllOrders();
      
      toast({
        title: "Order Status Updated",
        description: "Order marked as processing",
      });
    } catch (error) {
      console.error("Error updating order status:", error);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive"
      });
    }
  };

  const handleOrderComplete = async (orderId: string) => {
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order) {
        throw new Error("Order not found");
      }
      
      const totalAmount = (order.product_price || 0) + (order.platform_fee || 5.00);
      
      const { data: paymentResult, error: paymentError } = await supabase.functions.invoke("execute_sql", {
        body: {
          sql_query: `SELECT process_gift_payment('${order.user_id}', ${totalAmount}, '${orderId}', 'Payment for ${order.product_title?.replace(/'/g, "''") || "gift order"}')`
        }
      });

      if (paymentError) {
        throw new Error(`Payment processing failed: ${paymentError.message}`);
      }
      
      console.log("Payment successfully processed:", paymentResult);

      const { error } = await supabase
        .from('orders')
        .update({ 
          status: "completed",
          delivery_estimate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;

      if (order.influencer_id) {
        await supabase.from("notifications").insert({
          recipient_id: order.influencer_id,
          type: "order_completed",
          message: `Your gift order has been processed and will be delivered soon!`,
          reference_id: orderId,
        });
      }
      
      if (order.user_id) {
        await supabase.from("notifications").insert({
          recipient_id: order.user_id,
          type: "payment_processed",
          message: `Your payment of ₹${totalAmount.toFixed(2)} for the gift has been processed.`,
          reference_id: orderId,
        });
      }

      fetchAllOrders();
      
      toast({
        title: "Order Completed",
        description: "Order has been processed and payment has been collected",
      });
    } catch (error) {
      console.error("Error completing order:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to complete the order",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    checkAdminAccess();
    fetchAllOrders();
  }, []);

  return {
    orders,
    isLoading,
    userRole,
    handleOrderProcessing,
    handleOrderComplete
  };
};
