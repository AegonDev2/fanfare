
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useOrdersData } from "@/hooks/useOrdersData";
import OrderStatsCards from "./OrderStatsCards";
import OrderTabsContent from "./OrderTabsContent";

export default function AdminOrdersPanel() {
  const { orders, loading, handleStatusChange } = useOrdersData();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-funky-purple"></div>
      </div>
    );
  }

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const underProcessOrders = orders.filter(o => o.status === 'under process');
  const completedOrders = orders.filter(o => o.status === 'completed');
  const acceptedOrders = orders.filter(o => o.status === 'accepted');

  return (
    <div className="space-y-6">
      <OrderStatsCards
        pendingCount={pendingOrders.length}
        processingCount={underProcessOrders.length}
        completedCount={completedOrders.length}
        totalCount={orders.length}
      />

      <Tabs defaultValue="pending" className="w-full">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pendingOrders.length})</TabsTrigger>
          <TabsTrigger value="processing">Processing ({underProcessOrders.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedOrders.length})</TabsTrigger>
          <TabsTrigger value="accepted">Accepted ({acceptedOrders.length})</TabsTrigger>
        </TabsList>

        <OrderTabsContent orders={orders} onStatusChange={handleStatusChange} />
      </Tabs>
    </div>
  );
}
