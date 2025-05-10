
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ShoppingBag, CheckCircle, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDate } from "@/utils/formatters";
import type { OrderDetails } from "@/types/admin";

interface OrderListProps {
  orders: OrderDetails[];
  onComplete: (id: string) => void;
  type: 'pending' | 'completed';
}

export const OrderList = ({
  orders,
  onComplete,
  type
}: OrderListProps) => {
  const navigate = useNavigate();
  // Updated filtering: 'pending' tab shows 'under_process' orders, 'completed' tab shows 'completed' orders
  const filteredOrders = orders.filter(o => type === 'pending' ? o.status === 'under_process' : o.status === 'completed');
  console.log(`OrderList - Type: ${type}, Filtered orders: ${filteredOrders.length}`);

  return <Table>
      <TableCaption>List of {type === 'pending' ? 'orders requiring processing' : 'completed orders'}</TableCaption>
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
        {filteredOrders.length === 0 ? <TableRow>
            <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
              No orders found in this category.
            </TableCell>
          </TableRow> : filteredOrders.map(order => <TableRow key={order.id} className="hover:bg-muted/50">
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
                <Badge variant={order.status === 'under_process' ? 'outline' : 'secondary'}>
                  {order.status === 'under_process' ? 'New Order' : 'Completed'}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="secondary" onClick={() => navigate(`/admin/order/${order.id}`)}>
                    {order.status === 'under_process' ? 'Process' : 'View'}
                  </Button>
                </div>
              </TableCell>
            </TableRow>)}
      </TableBody>
    </Table>;
};
