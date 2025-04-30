
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { GiftStatusBadge, STATUS_LABELS } from "./GiftStatusBadge";
import { formatDate, formatCurrency } from "@/utils/formatters";
import type { GiftRequest } from "@/hooks/useGiftsSent";

interface GiftDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: GiftRequest | null;
}

export const GiftDetailsDialog = ({ open, onOpenChange, request }: GiftDetailsDialogProps) => {
  if (!request) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Gift Request Details</DialogTitle>
          <DialogDescription>
            Complete information about your gift request
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">
                {request.product_title || "Gift Request"}
              </h3>
              <p className="text-sm text-gray-500">
                To: {request.influencer_name || "Influencer"}
              </p>
              <div className="mt-2">
                <GiftStatusBadge status={request.status} />
              </div>
            </div>

            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Gift</TableCell>
                  <TableCell>{request.product_title}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Price</TableCell>
                  <TableCell>
                    {formatCurrency(request.product_price)}
                  </TableCell>
                </TableRow>
                {request.platform_fee && (
                  <TableRow>
                    <TableCell className="font-medium">Platform Fee</TableCell>
                    <TableCell>{formatCurrency(request.platform_fee)}</TableCell>
                  </TableRow>
                )}
                {request.total_amount && (
                  <TableRow>
                    <TableCell className="font-medium">Total Amount</TableCell>
                    <TableCell>{formatCurrency(request.total_amount)}</TableCell>
                  </TableRow>
                )}
                <TableRow>
                  <TableCell className="font-medium">Date Requested</TableCell>
                  <TableCell>{formatDate(request.created_at)}</TableCell>
                </TableRow>
                {request.completed_at && (
                  <TableRow>
                    <TableCell className="font-medium">Date Completed</TableCell>
                    <TableCell>{formatDate(request.completed_at)}</TableCell>
                  </TableRow>
                )}
                {request.delivery_estimate && (
                  <TableRow>
                    <TableCell className="font-medium">Estimated Delivery</TableCell>
                    <TableCell>{formatDate(request.delivery_estimate)}</TableCell>
                  </TableRow>
                )}
                <TableRow>
                  <TableCell className="font-medium">Status</TableCell>
                  <TableCell>{STATUS_LABELS[request.status]?.label || request.status}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
            
            {request.message && (
              <div>
                <h4 className="font-medium mb-1">Your Message:</h4>
                <div className="bg-gray-50 rounded-md p-3 text-gray-700 text-sm">
                  {request.message}
                </div>
              </div>
            )}
            
            <div>
              <h4 className="font-medium mb-1">Product Link:</h4>
              <a
                href={request.product_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
              >
                View Product
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
