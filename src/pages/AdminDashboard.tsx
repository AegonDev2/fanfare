
import Header from "@/components/landing/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { OrderList } from "@/components/admin/OrderList";
import { useAdmin } from "@/hooks/use-admin";
import { useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const AdminDashboard = () => {
  const {
    orders,
    isLoading,
    userRole,
    fetchAllOrders,
    handleOrderProcessing,
    handleOrderComplete
  } = useAdmin();

  // Refresh orders when dashboard loads
  useEffect(() => {
    // Initial fetch
    fetchAllOrders();
    
    // Set up a polling interval to check for new orders every 30 seconds
    const interval = setInterval(() => {
      fetchAllOrders();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [fetchAllOrders]);

  const getPendingOrders = () => orders.filter(o => o.status === 'accepted');
  const getProcessingOrders = () => orders.filter(o => o.status === 'processing');

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

          {orders.length === 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No orders to process</AlertTitle>
              <AlertDescription>
                There are currently no orders that need admin attention.
              </AlertDescription>
            </Alert>
          )}

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
              <OrderList 
                orders={orders}
                onProcess={handleOrderProcessing}
                onComplete={handleOrderComplete}
                type="pending"
              />
            </TabsContent>

            <TabsContent value="processing">
              <OrderList 
                orders={orders}
                onProcess={handleOrderProcessing}
                onComplete={handleOrderComplete}
                type="processing"
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
