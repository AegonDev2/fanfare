import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Gift, Calendar, DollarSign, User, ExternalLink, Clock, Truck } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
interface GiftRequest {
  id: string;
  sender_id: string;
  influencer_id: string;
  product_url: string;
  product_title: string | null;
  product_price: number | null;
  message: string | null;
  status: string;
  created_at: string;
  admin_approved: boolean;
  admin_approved_at: string | null;
  influencer_response: string | null;
  influencer_response_at: string | null;
  // Additional fields from joins
  sender_name?: string;
  sender_email?: string;
}
interface GiftRequestCardProps {
  request: GiftRequest;
  onStatusChange: () => void;
}
export default function GiftRequestCard({
  request,
  onStatusChange
}: GiftRequestCardProps) {
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const handleAccept = async () => {
    setLoading(true);
    try {
      // Update order status directly using the unified orders table
      const { error } = await supabase
        .from('orders')
        .update({
          status: 'accepted',
          influencer_response: 'accepted',
          influencer_response_at: new Date().toISOString()
        })
        .eq('id', request.id);

      if (error) throw error;

      toast({
        title: "Request Accepted",
        description: "Gift request accepted successfully!"
      });
      
      onStatusChange();
    } catch (error: any) {
      console.error("Error accepting request:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to accept request",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a rejection reason",
        variant: "destructive"
      });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          status: 'rejected_by_influencer',
          influencer_response: 'rejected',
          influencer_response_at: new Date().toISOString(),
          rejection_reason: rejectionReason
        })
        .eq('id', request.id);
        
      if (error) throw error;
      toast({
        title: "Request Rejected",
        description: "Gift request has been rejected"
      });
      setShowRejectDialog(false);
      setRejectionReason("");
      onStatusChange();
    } catch (error: any) {
      console.error("Error rejecting request:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to reject request",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const getStatusBadge = () => {
    if (!request.admin_approved) {
      return <Badge variant="outline" className="bg-gray-100 text-gray-600">Pending Admin</Badge>;
    }
    switch (request.status) {
      case 'pending_admin_approval':
        return <Badge variant="outline" className="bg-gray-100 text-gray-600">Pending Admin</Badge>;
      case 'approved_waiting_influencer':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Awaiting Response</Badge>;
      case 'accepted':
        return <Badge variant="default" className="bg-green-100 text-green-800">Accepted</Badge>;
      case 'rejected_by_influencer':
      case 'rejected_by_admin':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'completed':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Completed</Badge>;
      default:
        return <Badge variant="secondary">{request.status}</Badge>;
    }
  };
  const showActionButtons = request.admin_approved && request.status === 'approved_waiting_influencer' && !request.influencer_response;
  const showTrackingButton = true; // Always show tracking button to see progress

  const handleTrackOrder = () => {
    navigate(`/track-order?order=${request.id}`);
  };
  return <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-funky-purple" />
            {request.product_title || 'Gift Request'}
          </CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {request.message && <div className="text-sm">
              <span className="font-medium">Message from fan:</span>
              <p className="text-gray-600 mt-1">{request.message}</p>
            </div>}
          
          <div className="flex items-center gap-2 text-sm">
            <ExternalLink className="h-4 w-4 text-gray-400" />
            <a href={request.product_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">
              View Product
            </a>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {format(new Date(request.created_at), 'MMM dd, yyyy')}
            </div>
            
            {request.product_price && <div className="flex items-center gap-1">
                
                <span className="font-medium">₹{request.product_price}</span>
              </div>}
          </div>

          {request.sender_name && <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-gray-400" />
              <span>From: {request.sender_name}</span>
            </div>}

          {request.admin_approved && <div className="flex items-center gap-2 text-sm text-green-600">
              <Clock className="h-4 w-4" />
              <span>Admin approved on {format(new Date(request.admin_approved_at!), 'MMM dd, yyyy')}</span>
            </div>}

          {showActionButtons && <div className="flex gap-2 pt-3 border-t">
              <Button onClick={handleAccept} disabled={loading} className="flex-1">
                {loading ? "Processing..." : "Accept Gift"}
              </Button>
              
              <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" disabled={loading}>
                    Reject
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Reject Gift Request</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Please provide a reason for rejecting this gift request:
                    </p>
                    <Textarea placeholder="Enter rejection reason..." value={rejectionReason} onChange={e => setRejectionReason(e.target.value)} />
                    <div className="flex gap-2">
                      <Button onClick={handleReject} variant="destructive" disabled={!rejectionReason.trim() || loading}>
                        {loading ? "Processing..." : "Reject Request"}
                      </Button>
                      <Button onClick={() => setShowRejectDialog(false)} variant="outline">
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>}

          {showTrackingButton && <div className="pt-3 border-t">
              <Button onClick={handleTrackOrder} variant="outline" className="w-full flex items-center gap-2">
                <Truck className="h-4 w-4" />
                Track Order
              </Button>
            </div>}
        </div>
      </CardContent>
    </Card>;
}