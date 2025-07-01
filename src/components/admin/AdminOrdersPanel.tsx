
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  ExternalLink,
  User,
  Calendar,
  DollarSign
} from "lucide-react";
import { format } from "date-fns";

interface OrderData {
  id: string;
  user_id?: string;
  sender_id?: string;
  product_title: string;
  product_url: string;
  product_price: number;
  platform_fee?: number;
  total_amount?: number;
  created_at: string;
  status?: string;
  influencer_id?: string;
  message?: string;
  fan_email?: string;
  fan_name?: string;
  influencer_name?: string;
}

export default function AdminOrdersPanel() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      // Fetch from gift_requests table (main orders)
      const { data: giftRequests, error: giftError } = await supabase
        .from('gift_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (giftError) throw giftError;

      // Fetch from orders_under_process
      const { data: underProcessOrders, error: underProcessError } = await supabase
        .from('orders_under_process')
        .select('*')
        .order('created_at', { ascending: false });

      if (underProcessError) throw underProcessError;

      // Fetch from orders_completed
      const { data: completedOrders, error: completedError } = await supabase
        .from('orders_completed')
        .select('*')
        .order('created_at', { ascending: false });

      if (completedError) throw completedError;

      // Combine and transform all orders
      const allOrders: OrderData[] = [
        ...(giftRequests || []).map(item => ({
          id: item.id,
          user_id: item.sender_id,
          product_title: item.product_title || 'Unknown Product',
          product_url: item.product_url,
          product_price: item.product_price || 0,
          platform_fee: 5.00,
          total_amount: (item.product_price || 0) + 5.00,
          created_at: item.created_at,
          status: item.status,
          influencer_id: item.influencer_id,
          message: item.message,
        })),
        ...(underProcessOrders || []).map(item => ({
          id: item.id,
          user_id: item.user_id,
          product_title: item.product_title || 'Unknown Product',
          product_url: item.product_url,
          product_price: item.product_price || 0,
          platform_fee: item.platform_fee || 5.00,
          total_amount: item.total_amount || 0,
          created_at: item.created_at,
          status: 'under_process',
          influencer_id: item.influencer_id,
          message: item.message,
        })),
        ...(completedOrders || []).map(item => ({
          id: item.id,
          user_id: item.user_id,
          product_title: item.product_title || 'Unknown Product',
          product_url: item.product_url,
          product_price: item.product_price || 0,
          platform_fee: item.platform_fee || 5.00,
          total_amount: item.total_amount || 0,
          created_at: item.created_at,
          status: 'completed',
          influencer_id: item.influencer_id,
          message: item.message,
        }))
      ];

      // Sort by created_at descending
      allOrders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setOrders(allOrders);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch orders.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      if (newStatus === 'under_process') {
        // Move from gift_requests to orders_under_process
        const order = orders.find(o => o.id === orderId);
        if (!order) throw new Error('Order not found');

        const { error: insertError } = await supabase
          .from('orders_under_process')
          .insert({
            id: orderId,
            user_id: order.user_id,
            influencer_id: order.influencer_id,
            product_url: order.product_url,
            product_title: order.product_title,
            product_price: order.product_price,
            platform_fee: order.platform_fee,
            total_amount: order.total_amount,
            message: order.message,
            created_at: order.created_at
          });

        if (insertError) throw insertError;

        // Update gift_requests status
        const { error: updateError } = await supabase
          .from('gift_requests')
          .update({ status: 'under_process' })
          .eq('id', orderId);

        if (updateError) throw updateError;

      } else if (newStatus === 'completed') {
        // Use the database function to move order to completed
        const { error } = await supabase.rpc('move_order_to_completed', {
          order_id: orderId,
          p_delivery_estimate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        });

        if (error) throw error;

        // Update gift_requests status
        const { error: updateError } = await supabase
          .from('gift_requests')
          .update({ 
            status: 'completed',
            completed_at: new Date().toISOString()
          })
          .eq('id', orderId);

        if (updateError) throw updateError;
      }

      toast({
        title: "Success",
        description: `Order status updated to ${newStatus}`,
      });

      fetchOrders();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update order status",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const underProcessOrders = orders.filter(o => o.status === 'under_process');
  const completedOrders = orders.filter(o => o.status === 'completed');
  const acceptedOrders = orders.filter(o => o.status === 'accepted');

  const OrderCard = ({ order }: { order: OrderData }) => (
    <Card className="shadow-sm border-gray-100 hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold line-clamp-1">
            {order.product_title}
          </CardTitle>
          <Badge 
            variant={
              order.status === 'pending' ? 'secondary' :
              order.status === 'accepted' ? 'default' :
              order.status === 'under_process' ? 'outline' :
              order.status === 'completed' ? 'secondary' : 'secondary'
            }
            className={
              order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              order.status === 'accepted' ? 'bg-green-100 text-green-800' :
              order.status === 'under_process' ? 'bg-blue-100 text-blue-800 border-blue-300' :
              order.status === 'completed' ? 'bg-green-100 text-green-800' : ''
            }
          >
            {order.status === 'under_process' ? 'Processing' : 
             order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
          </Badge>
        </div>
        <p className="text-sm text-gray-500">Order ID: {order.id}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <ExternalLink className="h-4 w-4 text-gray-400" />
          <a 
            href={order.product_url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-blue-600 hover:underline truncate"
          >
            View Product
          </a>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-gray-400" />
            <span>₹{order.product_price}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span>{format(new Date(order.created_at), 'MMM dd, yyyy')}</span>
          </div>
        </div>

        {order.message && (
          <div className="text-sm">
            <span className="font-medium">Message:</span>
            <p className="text-gray-600 mt-1">{order.message}</p>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          {order.status === 'pending' && (
            <>
              <Button
                size="sm"
                onClick={() => handleStatusChange(order.id, 'under_process')}
                className="flex-1"
              >
                Accept & Process
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleStatusChange(order.id, 'rejected')}
              >
                Reject
              </Button>
            </>
          )}
          
          {order.status === 'under_process' && (
            <Button
              size="sm"
              onClick={() => handleStatusChange(order.id, 'completed')}
              className="w-full"
            >
              Mark as Completed
            </Button>
          )}

          <Button
            size="sm"
            variant="outline"
            onClick={() => window.open(`/admin/order/${order.id}`, '_blank')}
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-funky-purple"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-yellow-800">Pending</p>
                <p className="text-2xl font-bold text-yellow-900">{pendingOrders.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-800">Processing</p>
                <p className="text-2xl font-bold text-blue-900">{underProcessOrders.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-800">Completed</p>
                <p className="text-2xl font-bold text-green-900">{completedOrders.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-purple-800">Total Orders</p>
                <p className="text-2xl font-bold text-purple-900">{orders.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pendingOrders.length})</TabsTrigger>
          <TabsTrigger value="processing">Processing ({underProcessOrders.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedOrders.length})</TabsTrigger>
          <TabsTrigger value="accepted">Accepted ({acceptedOrders.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          {pendingOrders.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingOrders.map(order => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">No pending orders</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="processing" className="mt-6">
          {underProcessOrders.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {underProcessOrders.map(order => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">No orders currently processing</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          {completedOrders.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {completedOrders.map(order => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <CheckCircle2 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">No completed orders</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="accepted" className="mt-6">
          {acceptedOrders.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {acceptedOrders.map(order => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <CheckCircle2 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">No accepted orders</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
