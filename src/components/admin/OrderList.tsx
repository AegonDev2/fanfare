
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { ShoppingBag, CheckCircle, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDate } from "@/utils/formatters";
import type { OrderDetails } from "@/types/admin";

interface OrderListProps {
  orders: OrderDetails[];
  onProcess: (id: string) => void;
  onComplete: (id: string) => void;
  type: 'pending' | 'processing';
}

export const OrderList = ({ orders, onProcess, onComplete, type }: OrderListProps) => {
  const navigate = useNavigate();
  const filteredOrders = orders.filter(o => 
    type === 'pending' ? o.status === 'accepted' : o.status === 'processing'
  );

  return (
    <Table>
      <TableCaption>List of orders requiring manual processing</TableCaption>
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
        {filteredOrders.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
              No orders found in this category.
            </TableCell>
          </TableRow>
        ) : (
          filteredOrders.map((order) => (
            <TableRow key={order.id} className="hover:bg-muted/50">
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
                <Badge variant={order.status === 'accepted' ? 'outline' : 'secondary'}>
                  {order.status}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {order.status === 'accepted' ? (
                    <Button size="sm" onClick={() => onProcess(order.id)}>
                      <ShoppingBag className="h-4 w-4 mr-1" />
                      Process
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => onComplete(order.id)}>
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Complete
                    </Button>
                  )}
                  <Button 
                    size="sm" 
                    variant="secondary"
                    onClick={() => navigate(`/admin/order-details/${order.id}`)}
                  >
                    Details
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};
