
import { Badge } from "@/components/ui/badge";
import { Clock, Package, X, Info, Check } from "lucide-react";

interface StatusBadgeProps {
  status: string;
}

export const STATUS_LABELS: Record<string, { label: string, color: string, icon: any }> = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  accepted: { label: "Accepted", color: "bg-blue-100 text-blue-800", icon: Package },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-800", icon: X },
  "under process": { label: "Processing", color: "bg-purple-100 text-purple-800", icon: Package },
  completed: { label: "Completed", color: "bg-green-100 text-green-800", icon: Check },
};

export const GiftStatusBadge = ({ status }: StatusBadgeProps) => {
  const statusInfo = STATUS_LABELS[status] || { label: status, color: "bg-gray-100 text-gray-800", icon: Info };
  const StatusIcon = statusInfo.icon;
  
  return (
    <div className="flex items-center">
      <Badge className={`${statusInfo.color} px-2 py-1`}>
        <StatusIcon className="h-3.5 w-3.5 mr-1" />
        {statusInfo.label}
      </Badge>
    </div>
  );
};
