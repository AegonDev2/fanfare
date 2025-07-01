
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ExternalLink,
  Calendar,
  DollarSign
} from "lucide-react";
import { format } from "date-fns";

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

interface OrderCardProps {
  order: OrderData;
  onStatusChange: (orderId: string, newStatus: string) => void;
}

export default function OrderCard({ order, onStatusChange }: OrderCardProps) {
  return (
    <Card className="shadow-sm border-gray-100 hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold line-clamp-1">
            {order.product_title}
          </CardTitle>
          <Badge 
            variant={
              order.status === 'pending' ? 'secondary' :
              order.status === 'accepted' ? 'default' :
              order.status === 'under process' ? 'outline' :
              order.status === 'completed' ? 'secondary' : 'secondary'
            }
            className={
              order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              order.status === 'accepted' ? 'bg-green-100 text-green-800' :
              order.status === 'under process' ? 'bg-blue-100 text-blue-800 border-blue-300' :
              order.status === 'completed' ? 'bg-green-100 text-green-800' : ''
            }
          >
            {order.status === 'under process' ? 'Processing' : 
             order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
          </Badge>
        </div>
        <p className="text-sm text-gray-500">Order ID: {order.id}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <ExternalLink className="h-4 w-4 text-gray-400" />
          <a 
            href={order.product_url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-blue-600 hover:underline truncate"
          >
            View Product
          </a>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-gray-400" />
            <span>₹{order.product_price}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span>{format(new Date(order.created_at), 'MMM dd, yyyy')}</span>
          </div>
        </div>

        {order.message && (
          <div className="text-sm">
            <span className="font-medium">Message:</span>
            <p className="text-gray-600 mt-1">{order.message}</p>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          {order.status === 'pending' && (
            <>
              <Button
                size="sm"
                onClick={() => onStatusChange(order.id, 'under process')}
                className="flex-1"
              >
                Accept & Process
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onStatusChange(order.id, 'rejected')}
              >
                Reject
              </Button>
            </>
          )}
          
          {order.status === 'under process' && (
            <Button
              size="sm"
              onClick={() => onStatusChange(order.id, 'completed')}
              className="w-full"
            >
              Mark as Completed
            </Button>
          )}

          <Button
            size="sm"
            variant="outline"
            onClick={() => window.open(`/admin/order/${order.id}`, '_blank')}
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
