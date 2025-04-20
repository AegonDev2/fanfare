
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/landing/Header";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { ShoppingBag, CheckCircle, ExternalLink } from "lucide-react";
import { hasRole } from "@/utils/roleManager";

interface OrderDetails {
  id: string;
  status: string;
  created_at: string;
  product_url: string;
  product_title: string | null;
  product_price: number | null;
  fan_id?: string;
  fan_email?: string;
  influencer_id: string | null;
  influencer_name?: string;
  shipping_address?: any;
  message?: string;
  user_id?: string;
}

const AdminDashboard = () => {
  const [orders, setOrders] = useState<OrderDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAdminAccess();
    fetchAllOrders();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      // Check if user has admin role using the roleManager's hasRole function
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
      // Fetch all orders with accepted status where manual processing is needed
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*, influencer:influencer_id(*)')
        .in('status', ['accepted', 'processing', 'pending'])
        .order('created_at', { ascending: false });

      if (orderError) {
        throw orderError;
      }

      // Get additional data for each order
      const enrichedOrders = await Promise.all(
        (orderData || []).map(async (order) => {
          // Get fan information
          const { data: fanData } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', order.user_id)
            .maybeSingle();

          // Get influencer name
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
      // Update the order status to "processing" to indicate admin is working on it
      const { error } = await supabase
        .from('orders')
        .update({ status: "processing" })
        .eq('id', orderId);

      if (error) throw error;

      // Refresh orders list
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
      // Get the order details
      const order = orders.find(o => o.id === orderId);
      if (!order) {
        throw new Error("Order not found");
      }
      
      // Calculate total amount
      const totalAmount = (order.product_price || 0) + (order.platform_fee || 5.00);
      
      // Process payment from user's wallet
      const { data: paymentResult, error: paymentError } = await supabase.functions.invoke("execute_sql", {
        body: {
          sql_query: `SELECT process_gift_payment('${order.user_id}', ${totalAmount}, '${orderId}', 'Payment for ${order.product_title?.replace(/'/g, "''") || "gift order"}')`
        }
      });

      if (paymentError) {
        throw new Error(`Payment processing failed: ${paymentError.message}`);
      }
      
      console.log("Payment successfully processed:", paymentResult);

      // Update order status to "completed"
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: "completed",
          delivery_estimate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // Estimated delivery in 7 days
        })
        .eq('id', orderId);

      if (error) throw error;

      // Create notification for the influencer
      if (order.influencer_id) {
        await supabase.from("notifications").insert({
          recipient_id: order.influencer_id,
          type: "order_completed",
          message: `Your gift order has been processed and will be delivered soon!`,
          reference_id: orderId,
        });
      }
      
      // Create notification for the sender/fan
      if (order.user_id) {
        await supabase.from("notifications").insert({
          recipient_id: order.user_id,
          type: "payment_processed",
          message: `Your payment of ₹${totalAmount.toFixed(2)} for the gift has been processed.`,
          reference_id: orderId,
        });
      }

      // Refresh orders list
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

  const getPendingOrders = () => orders.filter(o => o.status === 'accepted');
  const getProcessingOrders = () => orders.filter(o => o.status === 'processing');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const renderOrderTable = (orderList: OrderDetails[]) => (
    <Table>
      <TableCaption>List of orders requiring manual processing</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Product</TableHead>
          <TableHead>Fan</TableHead>
          <TableHead>Influencer</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orderList.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
              No orders found in this category.
            </TableCell>
          </TableRow>
        ) : (
          orderList.map((order) => (
            <TableRow key={order.id} className="hover:bg-muted/50">
              <TableCell className="font-medium">{formatDate(order.created_at)}</TableCell>
              <TableCell>
                <div className="max-w-[200px]">
                  <div className="font-medium truncate">{order.product_title || "Product"}</div>
                  <div className="text-xs text-blue-600 hover:text-blue-800 flex items-center">
                    <a href={order.product_url} target="_blank" rel="noopener noreferrer">
                      View Product <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  </div>
                  <div className="text-xs mt-1">
                    {order.product_price ? `₹${order.product_price.toFixed(2)}` : ''}
                  </div>
                </div>
              </TableCell>
              <TableCell>{order.fan_email || "Unknown"}</TableCell>
              <TableCell>{order.influencer_name || "Unknown"}</TableCell>
              <TableCell>
                <Badge variant={order.status === 'accepted' ? 'outline' : 'secondary'}>
                  {order.status}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {order.status === 'accepted' ? (
                    <Button size="sm" onClick={() => handleOrderProcessing(order.id)}>
                      <ShoppingBag className="h-4 w-4 mr-1" />
                      Process
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => handleOrderComplete(order.id)}>
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Complete
                    </Button>
                  )}
                  <Button 
                    size="sm" 
                    variant="secondary"
                    onClick={() => navigate(`/admin/order-details/${order.id}`)}
                  >
                    Details
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <main className="container mx-auto p-4 pt-20">
          <div className="flex items-center justify-center h-64">
            <p>Loading admin dashboard...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="container mx-auto p-4 pt-20">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-600">Manage orders and manual fulfillment</p>
          </div>

          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="pending" className="relative">
                New Orders
                {getPendingOrders().length > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {getPendingOrders().length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="processing" className="relative">
                Processing
                {getProcessingOrders().length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {getProcessingOrders().length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending">
              {renderOrderTable(getPendingOrders())}
            </TabsContent>

            <TabsContent value="processing">
              {renderOrderTable(getProcessingOrders())}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
