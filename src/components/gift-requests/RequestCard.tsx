
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, CheckIcon, XIcon } from "lucide-react";

interface RequestCardProps {
  request: {
    id: string;
    gift_item: string;
    product_url: string;
    product_title: string | null;
    product_price: number | null;
    message: string;
    created_at: string;
    status: "pending" | "accepted" | "rejected" | "ordered" | "delivered";
    sender: { id: string; email: string };
  };
  onApprove?: () => void;
  onReject?: () => void;
  showActions?: boolean;
}

const RequestCard = ({
  request,
  onApprove,
  onReject,
  showActions = true,
}: RequestCardProps) => {
  const formattedDate = new Date(request.created_at).toLocaleDateString();

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{request.product_title || "Gift Request"}</CardTitle>
          <Badge
            variant={
              request.status === "pending"
                ? "outline"
                : request.status === "accepted"
                ? "default"
                : "destructive"
            }
          >
            {request.status}
          </Badge>
        </div>
        <CardDescription>From: {request.sender.email}</CardDescription>
      </CardHeader>
      <CardContent>
        <a
          href={request.product_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 flex items-center mb-3"
        >
          View Product <ExternalLink className="ml-1 h-3 w-3" />
        </a>

        {request.product_price && (
          <p className="text-sm font-medium mb-2">
            Price: ₹{request.product_price.toFixed(2)}
          </p>
        )}

        <p className="text-gray-700 mb-2">
          {request.message || <span className="text-gray-400 italic">No message</span>}
        </p>
        <p className="text-xs text-gray-500">Requested on {formattedDate}</p>
      </CardContent>
      {showActions && request.status === "pending" && (
        <CardFooter className="flex justify-between pt-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-red-600 hover:text-red-800 hover:bg-red-100"
            onClick={onReject}
          >
            <XIcon className="mr-1 h-4 w-4" /> Reject
          </Button>
          <Button variant="default" size="sm" onClick={onApprove}>
            <CheckIcon className="mr-1 h-4 w-4" /> Approve
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default RequestCard;

