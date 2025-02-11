
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type GiftRequest = {
  id: string;
  sender_id: string;
  influencer_id: string;
  product_url: string;
  product_title: string | null;
  product_price: number | null;
  message: string | null;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string | null;
  updated_at: string | null;
  sender: {
    email: string;
  };
}

const GiftRequests = () => {
  const [selectedRequest, setSelectedRequest] = useState<GiftRequest | null>(null);
  const [responseMessage, setResponseMessage] = useState("");
  const { toast } = useToast();

  const { data: giftRequests, refetch } = useQuery({
    queryKey: ["gift-requests"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("gift_requests")
        .select(`
          *,
          sender:profiles!gift_requests_sender_id_fkey(email)
        `)
        .eq("influencer_id", user.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as unknown as GiftRequest[];
    }
  });

  const handleResponse = async (status: "accepted" | "rejected") => {
    if (!selectedRequest) return;

    try {
      const { error } = await supabase
        .from("gift_requests")
        .update({
          status,
          response_message: responseMessage
        })
        .eq("id", selectedRequest.id);

      if (error) throw error;

      toast({
        title: `Request ${status}`,
        description: `Gift request has been ${status} successfully.`,
      });

      setSelectedRequest(null);
      setResponseMessage("");
      refetch();
    } catch (error) {
      console.error("Error updating gift request:", error);
      toast({
        title: "Error",
        description: "Failed to update gift request status.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Gift Requests</CardTitle>
          <CardDescription>
            Manage your pending gift requests from fans
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>From</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {giftRequests?.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>{request.sender.email}</TableCell>
                  <TableCell>
                    <a 
                      href={request.product_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      {request.product_title}
                    </a>
                  </TableCell>
                  <TableCell>₹{request.product_price}</TableCell>
                  <TableCell>{request.message}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="default"
                        onClick={() => setSelectedRequest(request)}
                      >
                        Respond
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {(!giftRequests || giftRequests.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    No pending gift requests
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Respond to Gift Request</DialogTitle>
            <DialogDescription>
              Choose whether to accept or reject this gift request
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <label className="text-sm font-medium">
              Message (optional)
            </label>
            <Input
              value={responseMessage}
              onChange={(e) => setResponseMessage(e.target.value)}
              placeholder="Add a personal message..."
              className="mt-2"
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSelectedRequest(null)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={() => handleResponse("rejected")}
            >
              Reject
            </Button>
            <Button
              onClick={() => handleResponse("accepted")}
            >
              Accept
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GiftRequests;
