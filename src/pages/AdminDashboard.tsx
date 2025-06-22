import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/hooks/useUser";
import Header from "@/components/landing/Header";
import { 
  ShoppingBag, 
  Users, 
  TrendingUp, 
  AlertCircle,
  Package,
  Clock,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { format } from "date-fns";

interface OrderData {
  id: string;
  user_id: string;
  product_title: string;
  product_url: string;
  product_price: number;
  platform_fee: number;
  total_amount: number;
  created_at: string;
  status?: string;
  influencer_id?: string;
  message?: string;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { toast } = useToast();
  const [navOpen, setNavOpen] = useState(false);
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    activeInfluencers: 0,
    pendingOrders: 0
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    } else if (user.email !== 'admin@fanfare.com') {
      toast({
        title: "Unauthorized",
        description: "You do not have permission to access this page.",
        variant: "destructive"
      });
      navigate('/home');
    } else {
      fetchOrders();
      fetchStats();
    }
  }, [user, navigate, toast]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('gift_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setOrders(data || []);
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

  const fetchStats = async () => {
    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from('gift_requests')
        .select('*');

      if (ordersError) {
        throw ordersError;
      }

      const totalOrders = ordersData ? ordersData.length : 0;
      const totalRevenue = ordersData ? ordersData.reduce((sum, order) => sum + order.total_amount, 0) : 0;
      const pendingOrders = ordersData ? ordersData.filter(order => order.status === 'pending').length : 0;

      const { data: influencersData, error: influencersError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_type', 'influencer');

      if (influencersError) {
        throw influencersError;
      }

      const activeInfluencers = influencersData ? influencersData.length : 0;

      setStats({
        totalOrders,
        totalRevenue,
        activeInfluencers,
        pendingOrders
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch statistics.",
        variant: "destructive"
      });
    }
  };

  const pendingOrders = useMemo(() => {
    return orders.filter(order => order.status === 'pending');
  }, [orders]);

  const acceptedOrders = useMemo(() => {
    return orders.filter(order => order.status === 'accepted');
  }, [orders]);

  const rejectedOrders = useMemo(() => {
    return orders.filter(order => order.status === 'rejected');
  }, [orders]);

  const underProcessOrders = useMemo(() => {
    return orders.filter(order => order.status === 'under process');
  }, [orders]);

  const completedOrders = useMemo(() => {
    return orders.filter(order => order.status === 'completed');
  }, [orders]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header setNavOpen={setNavOpen} />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-funky-purple"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header setNavOpen={setNavOpen} />
      
      <div className="max-w-6xl mx-auto p-6 pt-20">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-funky-purple to-funky-pink bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-2">Manage orders, view statistics, and more</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-blue-600" />
                Total Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-800">{stats.totalOrders}</div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-800">₹{stats.totalRevenue.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 border-purple-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600" />
                Active Influencers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-800">{stats.activeInfluencers}</div>
            </CardContent>
          </Card>

          <Card className="bg-orange-50 border-orange-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                Pending Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-800">{stats.pendingOrders}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultvalue="pending" className="w-full">
          <TabsList>
            <TabsTrigger value="pending">Pending ({pendingOrders.length})</TabsTrigger>
            <TabsTrigger value="accepted">Accepted ({acceptedOrders.length})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({rejectedOrders.length})</TabsTrigger>
            <TabsTrigger value="underProcess">Under Process ({underProcessOrders.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedOrders.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending" className="mt-4">
            {pendingOrders.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingOrders.map(order => (
                  <Card key={order.id} className="shadow-sm border-gray-100 hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg font-semibold">{order.product_title}</CardTitle>
                        <Badge variant="secondary">Pending</Badge>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Order ID: {order.id}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-gray-700">
                        <p>Product URL: <a href={order.product_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{order.product_url}</a></p>
                        <p>Price: ₹{order.product_price}</p>
                        <p>Total Amount: ₹{order.total_amount}</p>
                        <p>Created At: {format(new Date(order.created_at), 'MMM dd, yyyy hh:mm a')}</p>
                      </div>
                      <Button onClick={() => navigate(`/admin/order/${order.id}`)} className="mt-4 w-full">
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="shadow-sm">
                <CardContent className="text-center py-8">
                  <ShoppingBag className="h-6 w-6 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500">No pending orders found.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="accepted" className="mt-4">
            {acceptedOrders.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {acceptedOrders.map(order => (
                  <Card key={order.id} className="shadow-sm border-gray-100 hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg font-semibold">{order.product_title}</CardTitle>
                        <Badge className="bg-green-100 text-green-800">Accepted</Badge>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Order ID: {order.id}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-gray-700">
                        <p>Product URL: <a href={order.product_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{order.product_url}</a></p>
                        <p>Price: ₹{order.product_price}</p>
                        <p>Total Amount: ₹{order.total_amount}</p>
                        <p>Created At: {format(new Date(order.created_at), 'MMM dd, yyyy hh:mm a')}</p>
                      </div>
                      <Button onClick={() => navigate(`/admin/order/${order.id}`)} className="mt-4 w-full">
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="shadow-sm">
                <CardContent className="text-center py-8">
                  <CheckCircle2 className="h-6 w-6 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500">No accepted orders found.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="rejected" className="mt-4">
            {rejectedOrders.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {rejectedOrders.map(order => (
                  <Card key={order.id} className="shadow-sm border-gray-100 hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg font-semibold">{order.product_title}</CardTitle>
                        <Badge className="bg-red-100 text-red-800">Rejected</Badge>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Order ID: {order.id}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-gray-700">
                        <p>Product URL: <a href={order.product_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{order.product_url}</a></p>
                        <p>Price: ₹{order.product_price}</p>
                        <p>Total Amount: ₹{order.total_amount}</p>
                        <p>Created At: {format(new Date(order.created_at), 'MMM dd, yyyy hh:mm a')}</p>
                      </div>
                      <Button onClick={() => navigate(`/admin/order/${order.id}`)} className="mt-4 w-full">
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="shadow-sm">
                <CardContent className="text-center py-8">
                  <XCircle className="h-6 w-6 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500">No rejected orders found.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="underProcess" className="mt-4">
            {underProcessOrders.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {underProcessOrders.map(order => (
                  <Card key={order.id} className="shadow-sm border-gray-100 hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg font-semibold">{order.product_title}</CardTitle>
                        <Badge className="bg-yellow-100 text-yellow-800">Under Process</Badge>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Order ID: {order.id}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-gray-700">
                        <p>Product URL: <a href={order.product_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{order.product_url}</a></p>
                        <p>Price: ₹{order.product_price}</p>
                        <p>Total Amount: ₹{order.total_amount}</p>
                        <p>Created At: {format(new Date(order.created_at), 'MMM dd, yyyy hh:mm a')}</p>
                      </div>
                      <Button onClick={() => navigate(`/admin/order/${order.id}`)} className="mt-4 w-full">
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="shadow-sm">
                <CardContent className="text-center py-8">
                  <Clock className="h-6 w-6 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500">No orders currently under process.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="completed" className="mt-4">
            {completedOrders.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {completedOrders.map(order => (
                  <Card key={order.id} className="shadow-sm border-gray-100 hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg font-semibold">{order.product_title}</CardTitle>
                        <Badge className="bg-green-100 text-green-800">Completed</Badge>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Order ID: {order.id}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-gray-700">
                        <p>Product URL: <a href={order.product_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{order.product_url}</a></p>
                        <p>Price: ₹{order.product_price}</p>
                        <p>Total Amount: ₹{order.total_amount}</p>
                        <p>Created At: {format(new Date(order.created_at), 'MMM dd, yyyy hh:mm a')}</p>
                      </div>
                      <Button onClick={() => navigate(`/admin/order/${order.id}`)} className="mt-4 w-full">
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="shadow-sm">
                <CardContent className="text-center py-8">
                  <Package className="h-6 w-6 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500">No completed orders found.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
