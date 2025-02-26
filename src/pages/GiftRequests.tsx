
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
import { Gift } from "lucide-react";

type GiftRequest = {
  id: string;
  sender_id: string;
  influencer_id: string;
  product_url: string;
  product_title: string | null;
  product_price: number | null;
  message: string | null;
  status: 'pending' | 'accepted' | 'rejected' | 'ordered' | 'delivered';
  created_at: string | null;
  updated_at: string | null;
  sender: {
    email: string | null;
  } | null;
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
      return data as GiftRequest[];
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
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <div className="container mx-auto py-16 px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 mb-4">
            <Gift className="w-8 h-8 text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gift Requests</h1>
          <p className="text-lg text-gray-600">Manage your pending gift requests from fans</p>
        </div>

        {/* Requests Table Card */}
        <Card className="rounded-xl shadow-lg bg-white/80 backdrop-blur-sm border-purple-100">
          <CardHeader className="border-b border-purple-100/20 bg-gradient-to-r from-purple-50/50 to-transparent">
            <CardTitle className="text-xl text-gray-800">Pending Requests</CardTitle>
            <CardDescription>
              Review and respond to gift requests from your fans
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="rounded-lg overflow-hidden border border-purple-100/20">
              <Table>
                <TableHeader>
                  <TableRow className="bg-purple-50/50">
                    <TableHead className="font-semibold text-purple-900">From</TableHead>
                    <TableHead className="font-semibold text-purple-900">Product</TableHead>
                    <TableHead className="font-semibold text-purple-900">Price</TableHead>
                    <TableHead className="font-semibold text-purple-900">Message</TableHead>
                    <TableHead className="font-semibold text-purple-900">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {giftRequests?.map((request) => (
                    <TableRow key={request.id} className="hover:bg-purple-50/30 transition-colors">
                      <TableCell className="text-gray-700">{request.sender?.email}</TableCell>
                      <TableCell>
                        <a 
                          href={request.product_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-purple-600 hover:text-purple-800 hover:underline font-medium"
                        >
                          {request.product_title}
                        </a>
                      </TableCell>
                      <TableCell className="text-gray-700">₹{request.product_price}</TableCell>
                      <TableCell className="text-gray-700">{request.message}</TableCell>
                      <TableCell>
                        <Button 
                          size="sm" 
                          className="bg-purple-600 hover:bg-purple-700 text-white"
                          onClick={() => setSelectedRequest(request)}
                        >
                          Respond
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!giftRequests || giftRequests.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12 text-gray-500">
                        No pending gift requests
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Respond to Gift Request
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Choose whether to accept or reject this gift request
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <label className="text-sm font-medium text-gray-700">
              Message (optional)
            </label>
            <Input
              value={responseMessage}
              onChange={(e) => setResponseMessage(e.target.value)}
              placeholder="Add a personal message..."
              className="mt-2 border-purple-100 focus:border-purple-300 focus:ring-purple-200"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setSelectedRequest(null)}
              className="border-purple-200 hover:bg-purple-50"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={() => handleResponse("rejected")}
              className="bg-red-500 hover:bg-red-600"
            >
              Reject
            </Button>
            <Button
              onClick={() => handleResponse("accepted")}
              className="bg-purple-600 hover:bg-purple-700"
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
