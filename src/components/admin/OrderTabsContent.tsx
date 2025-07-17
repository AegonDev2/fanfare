
import { Card, CardContent } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { 
  Clock,
  Package,
  CheckCircle2
} from "lucide-react";
import AdminOrderCard from "./AdminOrderCard";
import type { OrderDetails } from "@/types/admin";

interface OrderTabsContentProps {
  orders: OrderDetails[];
  onStatusChange: (orderId: string, newStatus: string) => void;
}

export default function OrderTabsContent({ orders, onStatusChange }: OrderTabsContentProps) {
  // Filter orders by status using the new unified status system
  const pendingOrders = orders.filter(o => o.status === 'pending_admin_approval');
  const underProcessOrders = orders.filter(o => o.status === 'approved_waiting_influencer');
  const acceptedOrders = orders.filter(o => o.status === 'accepted');
  const completedOrders = orders.filter(o => o.status === 'completed');

  console.log("OrderTabsContent - Filtering orders:", {
    total: orders.length,
    pending: pendingOrders.length,
    processing: underProcessOrders.length,
    accepted: acceptedOrders.length,
    completed: completedOrders.length
  });

  const EmptyState = ({ icon: Icon, message }: { icon: any, message: string }) => (
    <Card>
      <CardContent className="text-center py-8">
        <Icon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-500">{message}</p>
      </CardContent>
    </Card>
  );

  const OrderGrid = ({ orders }: { orders: OrderDetails[] }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {orders.map(order => (
        <AdminOrderCard key={order.id} order={order} onStatusChange={onStatusChange} />
      ))}
    </div>
  );

  return (
    <>
      <TabsContent value="pending" className="mt-6">
        {pendingOrders.length > 0 ? (
          <OrderGrid orders={pendingOrders} />
        ) : (
          <EmptyState icon={Clock} message="No pending orders" />
        )}
      </TabsContent>

      <TabsContent value="processing" className="mt-6">
        {underProcessOrders.length > 0 ? (
          <OrderGrid orders={underProcessOrders} />
        ) : (
          <EmptyState icon={Package} message="No orders currently processing" />
        )}
      </TabsContent>

      <TabsContent value="accepted" className="mt-6">
        {acceptedOrders.length > 0 ? (
          <OrderGrid orders={acceptedOrders} />
        ) : (
          <EmptyState icon={CheckCircle2} message="No accepted orders" />
        )}
      </TabsContent>

      <TabsContent value="completed" className="mt-6">
        {completedOrders.length > 0 ? (
          <OrderGrid orders={completedOrders} />
        ) : (
          <EmptyState icon={CheckCircle2} message="No completed orders" />
        )}
      </TabsContent>
    </>
  );
}
