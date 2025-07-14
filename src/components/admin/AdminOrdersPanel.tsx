
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminOrders } from "@/hooks/useAdminOrders";
import { useOrderActions } from "@/hooks/useOrderActions";
import OrderStatsCards from "./OrderStatsCards";
import OrderTabsContent from "./OrderTabsContent";
import { useEffect } from "react";

export default function AdminOrdersPanel() {
  const { orders, isLoading, fetchAllOrders } = useAdminOrders();
  const { handleStatusChange } = useOrderActions(orders, fetchAllOrders);

  useEffect(() => {
    console.log("AdminOrdersPanel mounted, fetching orders...");
    fetchAllOrders();
  }, [fetchAllOrders]);

  console.log("AdminOrdersPanel render - orders:", orders?.length, "loading:", isLoading);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-funky-purple"></div>
      </div>
    );
  }

  const pendingOrders = orders.filter(o => o.status === 'under_process');
  const underProcessOrders = orders.filter(o => o.status === 'under_process'); // Same as pending for now
  const completedOrders = orders.filter(o => o.status === 'completed');
  const acceptedOrders = []; // We don't have accepted status in our current flow

  console.log("Order counts:", {
    pending: pendingOrders.length,
    processing: underProcessOrders.length,
    completed: completedOrders.length,
    accepted: acceptedOrders.length,
    total: orders.length
  });

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
