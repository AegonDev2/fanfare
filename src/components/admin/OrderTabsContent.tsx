
import { Card, CardContent } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { 
  Clock,
  Package,
  CheckCircle2
} from "lucide-react";
import AdminOrderCard from "./AdminOrderCard";

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

interface OrderTabsContentProps {
  orders: OrderData[];
  onStatusChange: (orderId: string, newStatus: string) => void;
}

export default function OrderTabsContent({ orders, onStatusChange }: OrderTabsContentProps) {
  const pendingOrders = orders.filter(o => o.status === 'pending');
  const underProcessOrders = orders.filter(o => o.status === 'under process');
  const completedOrders = orders.filter(o => o.status === 'completed');
  const acceptedOrders = orders.filter(o => o.status === 'accepted');

  const EmptyState = ({ icon: Icon, message }: { icon: any, message: string }) => (
    <Card>
      <CardContent className="text-center py-8">
        <Icon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-500">{message}</p>
      </CardContent>
    </Card>
  );

  const OrderGrid = ({ orders }: { orders: OrderData[] }) => (
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

      <TabsContent value="completed" className="mt-6">
        {completedOrders.length > 0 ? (
          <OrderGrid orders={completedOrders} />
        ) : (
          <EmptyState icon={CheckCircle2} message="No completed orders" />
        )}
      </TabsContent>

      <TabsContent value="accepted" className="mt-6">
        {acceptedOrders.length > 0 ? (
          <OrderGrid orders={acceptedOrders} />
        ) : (
          <EmptyState icon={CheckCircle2} message="No accepted orders" />
        )}
      </TabsContent>
    </>
  );
}
