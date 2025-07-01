
import { Card, CardContent } from "@/components/ui/card";
import { 
  Package,
  Clock,
  CheckCircle2,
  User
} from "lucide-react";

interface OrderStatsCardsProps {
  pendingCount: number;
  processingCount: number;
  completedCount: number;
  totalCount: number;
}

export default function OrderStatsCards({ 
  pendingCount, 
  processingCount, 
  completedCount, 
  totalCount 
}: OrderStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="text-sm font-medium text-yellow-800">Pending</p>
              <p className="text-2xl font-bold text-yellow-900">{pendingCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-blue-800">Processing</p>
              <p className="text-2xl font-bold text-blue-900">{processingCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-800">Completed</p>
              <p className="text-2xl font-bold text-green-900">{completedCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-purple-50 border-purple-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-purple-600" />
            <div>
              <p className="text-sm font-medium text-purple-800">Total Orders</p>
              <p className="text-2xl font-bold text-purple-900">{totalCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
