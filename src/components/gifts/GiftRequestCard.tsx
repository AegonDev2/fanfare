
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Info } from "lucide-react";
import { GiftStatusBadge } from "./GiftStatusBadge";
import { formatDate, formatCurrency } from "@/utils/formatters";
import type { GiftRequest } from "@/hooks/useGiftsSent";

interface GiftRequestCardProps {
  request: GiftRequest;
  onDetailsClick: (request: GiftRequest) => void;
}

export const GiftRequestCard = ({ request, onDetailsClick }: GiftRequestCardProps) => {
  const getDisplayStatus = (status: string) => {
    switch (status) {
      case 'pending_admin_approval':
        return 'pending';
      case 'approved_waiting_influencer':
        return 'under process';
      case 'accepted':
        return 'accepted';
      case 'rejected_by_admin':
      case 'rejected_by_influencer':
        return 'rejected';
      case 'completed':
        return 'completed';
      case 'cancelled_by_user':
        return 'cancelled';
      default:
        return status;
    }
  };

  return (
    <Card key={request.id} className="overflow-hidden bg-white shadow-sm transition-all hover:shadow">
      <CardContent className="p-0">
        <div className="p-6 flex flex-col md:flex-row justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-lg truncate">
                {request.product_title || "Gift Request"}
              </h3>
              <div className="ml-4 flex-shrink-0">
                <GiftStatusBadge status={getDisplayStatus(request.status)} />
              </div>
            </div>
            <div className="text-sm text-gray-500 mt-1">
              To: {request.influencer_name || "Influencer"}
            </div>
            {request.message && (
              <p className="mt-2 text-sm text-gray-700 line-clamp-2">
                "{request.message}"
              </p>
            )}
            {request.product_price && (
              <div className="mt-2 text-sm font-medium">
                Price: {formatCurrency(request.product_price)}
              </div>
            )}
            <div className="flex items-center mt-4 space-x-4 text-xs text-gray-500">
              <div className="flex items-center">
                <Calendar className="h-3.5 w-3.5 mr-1 text-gray-400" />
                Requested on {formatDate(request.created_at)}
              </div>
              {request.delivery_estimate && (
                <div className="flex items-center">
                  <Calendar className="h-3.5 w-3.5 mr-1 text-gray-400" />
                  Expected delivery: {formatDate(request.delivery_estimate)}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center md:items-start">
            <Button
              variant="outline"
              size="sm"
              className="w-full md:w-auto"
              onClick={() => onDetailsClick(request)}
            >
              <Info className="h-4 w-4 mr-1" />
              Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
