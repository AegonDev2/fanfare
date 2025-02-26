
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import Header from "@/components/landing/Header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Gift, ThumbsUp, ThumbsDown } from "lucide-react";

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
  const [isNavOpen, setIsNavOpen] = useState(false);
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
    <div className="min-h-screen bg-[#9b87f5] relative">
      <Header setNavOpen={setIsNavOpen} />
      
      <div className="bg-[#F1F1F1] min-h-[calc(100vh-64px)] rounded-t-3xl pt-6 mt-16 relative z-10">
        <div className="container mx-auto px-4 pb-6">
          <Card className="mb-4 border-none shadow-lg bg-white rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-[#E5DEFF] p-2 rounded-xl">
                  <Gift className="w-5 h-5 text-[#9b87f5]" />
                </div>
                <div>
                  <h2 className="text-[#333333] font-medium">Pending Requests</h2>
                  <p className="text-sm text-[#555555]">
                    {giftRequests?.length || 0} requests waiting
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            {giftRequests?.map((request) => (
              <Card 
                key={request.id} 
                className="border-none shadow-md rounded-xl bg-white"
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#333333] truncate mb-1">
                        {request.sender?.email}
                      </p>
                      <h3 className="text-base font-semibold text-[#9b87f5] mb-1 truncate">
                        {request.product_title}
                      </h3>
                      <p className="text-sm text-[#555555] mb-2">
                        ₹{request.product_price}
                      </p>
                      <p className="text-sm text-[#555555] line-clamp-2">
                        {request.message}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      className="bg-[#9b87f5] hover:bg-[#7E69AB] text-white shadow-sm rounded-xl px-4 whitespace-nowrap"
                      onClick={() => setSelectedRequest(request)}
                    >
                      Review
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {(!giftRequests || giftRequests.length === 0) && (
              <div className="text-center py-12 bg-white rounded-xl shadow-md">
                <div className="bg-[#E5DEFF] w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Gift className="w-6 h-6 text-[#9b87f5]" />
                </div>
                <p className="text-[#555555] text-sm">No pending gift requests</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="w-[90%] max-w-md mx-auto rounded-2xl bg-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-[#333333]">
              Review Request
            </DialogTitle>
            <DialogDescription className="text-sm text-[#555555]">
              {selectedRequest?.product_title}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <label className="text-sm font-medium text-[#555555]">
              Response Message
            </label>
            <Input
              value={responseMessage}
              onChange={(e) => setResponseMessage(e.target.value)}
              placeholder="Add a personal message..."
              className="mt-2 border-[#D6BCFA] focus:border-[#9b87f5] rounded-xl"
            />
          </div>

          <DialogFooter className="flex-col gap-2">
            <Button
              onClick={() => handleResponse("accepted")}
              className="w-full bg-[#9b87f5] hover:bg-[#7E69AB] text-white rounded-xl h-11 flex items-center justify-center gap-2"
            >
              <ThumbsUp className="w-4 h-4" />
              Accept Request
            </Button>
            <Button 
              variant="destructive"
              onClick={() => handleResponse("rejected")}
              className="w-full bg-[#ea384c] hover:bg-red-600 text-white rounded-xl h-11 flex items-center justify-center gap-2"
            >
              <ThumbsDown className="w-4 h-4" />
              Reject Request
            </Button>
            <Button
              variant="outline"
              onClick={() => setSelectedRequest(null)}
              className="w-full border-[#D6BCFA] text-[#555555] hover:bg-[#E5DEFF] rounded-xl h-11"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GiftRequests;
