
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/landing/Header";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, CheckCircle, ClipboardCopy, ShoppingBag } from "lucide-react";

interface OrderDetails {
  id: string;
  status: string;
  created_at: string;
  product_url: string;
  product_title: string | null;
  product_price: number | null;
  platform_fee: number | null;
  total_amount: number | null;
  message?: string | null;
  fan_id?: string;
  fan_email?: string;
  influencer_id: string | null;
  influencer_name?: string;
  shipping_address?: any;
}

const AdminOrderDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAdminAccess();
    if (id) {
      fetchOrderDetails(id);
    }
  }, [id]);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      // Check if user has admin role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (roleError) {
        console.error("Error checking role:", roleError);
        navigate('/');
        return;
      }

      if (roleData?.role !== 'admin') {
        toast({
          title: "Access Denied",
          description: "You don't have permission to view this page.",
          variant: "destructive"
        });
        navigate('/');
      }
    } catch (error) {
      console.error("Authentication error:", error);
      navigate('/auth');
    }
  };

  const fetchOrderDetails = async (orderId: string) => {
    setIsLoading(true);
    try {
      // Fetch order details
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*, influencer:influencer_id(*)')
        .eq('id', orderId)
        .single();

      if (orderError) {
        throw orderError;
      }

      // Get fan profile information
      const { data: fanData } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', orderData.user_id)
        .maybeSingle();

      const enrichedOrder = {
        ...orderData,
        fan_email: fanData?.email,
        influencer_name: orderData.influencer?.name || "Unknown",
      };

      setOrder(enrichedOrder);
    } catch (error) {
      console.error("Error fetching order details:", error);
      toast({
        title: "Error",
        description: "Failed to load order details.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOrderProcessing = async () => {
    if (!order) return;
    try {
      // Update the order status to "processing" to indicate admin is working on it
      const { error } = await supabase
        .from('orders')
        .update({ status: "processing" })
        .eq('id', order.id);

      if (error) throw error;

      // Refresh order details
      fetchOrderDetails(order.id);
      
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

  const handleOrderComplete = async () => {
    if (!order) return;
    try {
      // Update order status to "completed" once the admin has manually placed the order
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: "completed",
          delivery_estimate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // Estimated delivery in 7 days
        })
        .eq('id', order.id);

      if (error) throw error;

      // Create notification for the influencer
      if (order.influencer_id) {
        await supabase.from("notifications").insert({
          recipient_id: order.influencer_id,
          type: "order_completed",
          message: `Your gift order has been processed and will be delivered soon!`,
          reference_id: order.id,
        });
      }

      // Refresh order details
      fetchOrderDetails(order.id);
      
      toast({
        title: "Order Completed",
        description: "Order has been marked as completed",
      });
    } catch (error) {
      console.error("Error completing order:", error);
      toast({
        title: "Error",
        description: "Failed to complete the order",
        variant: "destructive"
      });
    }
  };

  const copyToClipboard = (text: string, description: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: description,
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const formatPrice = (price?: number | null) => {
    if (price == null) return "N/A";
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(price);
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <main className="container mx-auto p-4 pt-20">
          <div className="flex items-center justify-center h-64">
            <p>Loading order details...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <main className="container mx-auto p-4 pt-20">
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <p className="text-xl">Order not found</p>
            <Button onClick={() => navigate('/admin')}>Back to Dashboard</Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="container mx-auto p-4 pt-20">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate('/admin')} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Order Details</h1>
              <p className="text-gray-600">Order ID: {order.id}</p>
            </div>
            <Badge 
              variant={
                order.status === "accepted" ? "outline" :
                order.status === "processing" ? "secondary" :
                order.status === "completed" ? "default" : "destructive"
              }
              className="text-sm py-1 px-3"
            >
              {order.status}
            </Badge>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Information</CardTitle>
                <CardDescription>Details about the ordered product</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold">Product Name</h3>
                  <p>{order.product_title || "Not specified"}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold">Product URL</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <a 
                      href={order.product_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline max-w-[80%] truncate"
                    >
                      {order.product_url}
                    </a>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => copyToClipboard(order.product_url, "URL copied to clipboard")}
                    >
                      <ClipboardCopy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <h3 className="font-semibold">Product Price</h3>
                    <p>{formatPrice(order.product_price)}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Platform Fee</h3>
                    <p>{formatPrice(order.platform_fee)}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Total</h3>
                    <p className="font-bold">{formatPrice(order.total_amount)}</p>
                  </div>
                </div>

                {order.message && (
                  <div>
                    <h3 className="font-semibold">Gift Message</h3>
                    <p className="italic text-gray-700">"{order.message}"</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Shipping Information</CardTitle>
                <CardDescription>Where the product should be delivered</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.shipping_address ? (
                  <>
                    <div>
                      <h3 className="font-semibold">Recipient Name</h3>
                      <p>{order.shipping_address.name || order.influencer_name || "Not specified"}</p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold">Address</h3>
                      <p>
                        {order.shipping_address.address_line1 || order.shipping_address.street_address || ""}
                        {order.shipping_address.address_line2 ? `, ${order.shipping_address.address_line2}` : ""}
                      </p>
                      <p>
                        {order.shipping_address.city}, {order.shipping_address.state}, {order.shipping_address.postal_code}
                      </p>
                      <p>{order.shipping_address.country || "India"}</p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold">Contact</h3>
                      <p>{order.shipping_address.phone || "Not provided"}</p>
                    </div>
                    
                    <div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => copyToClipboard(
                          `${order.shipping_address.name || order.influencer_name}\n${order.shipping_address.address_line1 || order.shipping_address.street_address || ""} ${order.shipping_address.address_line2 || ""}\n${order.shipping_address.city}, ${order.shipping_address.state}, ${order.shipping_address.postal_code}\n${order.shipping_address.country || "India"}\nPhone: ${order.shipping_address.phone || "Not provided"}`,
                          "Address copied to clipboard"
                        )}
                      >
                        <ClipboardCopy className="h-4 w-4 mr-2" /> Copy Full Address
                      </Button>
                    </div>
                  </>
                ) : (
                  <p>No shipping address information available</p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Details</CardTitle>
                <CardDescription>Basic information about this order</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold">Order Date</h3>
                  <p>{formatDate(order.created_at)}</p>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-semibold">Fan</h3>
                  <p>{order.fan_email || "Unknown"}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold">Influencer</h3>
                  <p>{order.influencer_name || "Unknown"}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
                <CardDescription>Process this order</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  After manually placing the order on the e-commerce website, update the status here.
                </p>
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                {order.status === 'accepted' && (
                  <Button 
                    className="w-full" 
                    onClick={handleOrderProcessing}
                  >
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Mark As Processing
                  </Button>
                )}
                
                {order.status === 'processing' && (
                  <Button 
                    className="w-full" 
                    onClick={handleOrderComplete}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark As Completed
                  </Button>
                )}
                
                {order.status === 'completed' && (
                  <p className="text-green-600 font-medium text-center">
                    This order has been completed
                  </p>
                )}
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminOrderDetails;
