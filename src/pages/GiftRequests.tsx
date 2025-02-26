import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
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
  const isMobile = useIsMobile();
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
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white pb-20 md:pb-0">
      <div className="container mx-auto py-8 md:py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-full bg-purple-100 mb-3 md:mb-4 animate-fade-in">
            <Gift className="w-6 h-6 md:w-8 md:h-8 text-purple-600" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 tracking-tight lg:text-4xl">
            Your Gift Requests
          </h1>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto px-4">
            Review and manage gift requests from your fans. Accept or reject requests and provide personalized responses.
          </p>
          <div className="mt-4 md:mt-6 flex justify-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-purple-50 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-purple-400"></div>
              <span className="text-xs md:text-sm text-purple-700">Pending Requests</span>
            </div>
          </div>
        </div>

        <Card className="rounded-xl shadow-lg bg-white/80 backdrop-blur-sm border-purple-100">
          <CardHeader className="border-b border-purple-100/20 bg-gradient-to-r from-purple-50/50 to-transparent p-4 md:p-6">
            <CardTitle className="text-lg md:text-xl text-gray-800">Pending Requests</CardTitle>
            <CardDescription className="text-sm md:text-base">
              Review and respond to gift requests from your fans
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 md:p-6">
            <div className="rounded-lg overflow-x-auto border border-purple-100/20">
              <Table>
                <TableHeader>
                  <TableRow className="bg-purple-50/50">
                    <TableHead className="font-semibold text-purple-900 text-xs md:text-sm">From</TableHead>
                    {!isMobile && (
                      <>
                        <TableHead className="font-semibold text-purple-900 text-xs md:text-sm">Product</TableHead>
                        <TableHead className="font-semibold text-purple-900 text-xs md:text-sm">Price</TableHead>
                      </>
                    )}
                    <TableHead className="font-semibold text-purple-900 text-xs md:text-sm">Message</TableHead>
                    <TableHead className="font-semibold text-purple-900 text-xs md:text-sm">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {giftRequests?.map((request) => (
                    <TableRow key={request.id} className="hover:bg-purple-50/30 transition-colors">
                      <TableCell className="text-gray-700 text-xs md:text-sm py-3 md:py-4">
                        {request.sender?.email}
                      </TableCell>
                      {!isMobile && (
                        <>
                          <TableCell className="text-xs md:text-sm">
                            <a 
                              href={request.product_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-purple-600 hover:text-purple-800 hover:underline font-medium"
                            >
                              {request.product_title}
                            </a>
                          </TableCell>
                          <TableCell className="text-gray-700 text-xs md:text-sm">₹{request.product_price}</TableCell>
                        </>
                      )}
                      <TableCell className="text-gray-700 text-xs md:text-sm">
                        {isMobile ? (
                          <div>
                            <p className="font-medium text-purple-600 mb-1">{request.product_title}</p>
                            <p className="text-sm text-gray-600 mb-1">₹{request.product_price}</p>
                            <p className="text-xs">{request.message}</p>
                          </div>
                        ) : (
                          request.message
                        )}
                      </TableCell>
                      <TableCell>
                        <Button 
                          size={isMobile ? "sm" : "default"}
                          className="bg-purple-600 hover:bg-purple-700 text-white shadow-sm w-full md:w-auto text-xs md:text-sm py-1.5 h-auto"
                          onClick={() => setSelectedRequest(request)}
                        >
                          Respond
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!giftRequests || giftRequests.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={isMobile ? 3 : 5} className="text-center py-8 md:py-12">
                        <div className="flex flex-col items-center gap-2 text-gray-500">
                          <Gift className="w-6 h-6 md:w-8 md:h-8 text-gray-400" />
                          <p className="text-sm md:text-base">No pending gift requests</p>
                        </div>
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
        <DialogContent className="w-[95%] max-w-md mx-auto rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-lg md:text-xl font-semibold text-gray-900">
              Respond to Gift Request
            </DialogTitle>
            <DialogDescription className="text-sm md:text-base text-gray-600">
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

          <DialogFooter className="flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
            <Button
              variant="outline"
              onClick={() => setSelectedRequest(null)}
              className="w-full sm:w-auto border-purple-200 hover:bg-purple-50"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={() => handleResponse("rejected")}
              className="w-full sm:w-auto bg-red-500 hover:bg-red-600"
            >
              Reject
            </Button>
            <Button
              onClick={() => handleResponse("accepted")}
              className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700"
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
