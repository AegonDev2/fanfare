
import Header from "@/components/landing/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { OrderList } from "@/components/admin/OrderList";
import { useAdmin } from "@/hooks/use-admin";
import { useEffect, useState } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

const AdminDashboard = () => {
  const {
    orders,
    isLoading,
    userRole,
    fetchAllOrders,
    handleOrderComplete
  } = useAdmin();
  
  const [loadError, setLoadError] = useState<boolean>(false);

  // Refresh orders when dashboard loads
  useEffect(() => {
    // Initial fetch
    fetchAllOrders().catch(() => {
      setLoadError(true);
    });
    
    // Set up a polling interval to check for new orders every 30 seconds
    const interval = setInterval(() => {
      fetchAllOrders().catch(() => {
        setLoadError(true);
      });
    }, 30000);
    
    return () => clearInterval(interval);
  }, [fetchAllOrders]);

  // Orders with status under_process need admin attention (now mapped to "New Orders" tab)
  const getNewOrders = () => orders.filter(o => o.status === 'under_process');
  // Orders with status completed
  const getCompletedOrders = () => orders.filter(o => o.status === 'completed');

  const handleRetry = async () => {
    setLoadError(false);
    await fetchAllOrders().catch(() => {
      setLoadError(true);
    });
  };

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
            <div className="flex justify-between items-center">
              <p className="text-gray-600">Manage orders and manual fulfillment</p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleRetry}
                className="flex items-center gap-1"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh Orders
              </Button>
            </div>
          </div>

          {loadError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Connection Error</AlertTitle>
              <AlertDescription className="flex flex-col gap-2">
                <p>Unable to load orders. Please check your connection and try again.</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRetry}
                  className="w-fit flex items-center gap-1"
                >
                  <RefreshCw className="h-4 w-4" />
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {!loadError && (orders.length === 0 || (getNewOrders().length === 0 && getCompletedOrders().length === 0)) && (
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
                {getNewOrders().length > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {getNewOrders().length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="completed" className="relative">
                Completed
                {getCompletedOrders().length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {getCompletedOrders().length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending">
              <OrderList 
                orders={orders}
                onComplete={handleOrderComplete}
                type="pending"
              />
            </TabsContent>

            <TabsContent value="completed">
              <OrderList 
                orders={orders}
                onComplete={handleOrderComplete}
                type="completed"
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
