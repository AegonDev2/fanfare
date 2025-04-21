
import { useEffect, useState } from "react";
import Header from "@/components/landing/Header";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import RequestCard from "@/components/gift-requests/RequestCard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { sendAdminNotification } from "@/utils/notifications";

interface GiftRequest {
  id: string;
  gift_item: string;
  product_url: string;
  product_title: string | null;
  product_price: number | null;
  message: string;
  created_at: string;
  status: "pending" | "accepted" | "rejected" | "ordered" | "delivered";
  sender: { id: string; email: string };
  influencer_id: string;
}

interface Address {
  name?: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone?: string;
}

interface InfluencerAddress {
  id: string;
  street_address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_primary: boolean;
  influencer_id: string;
  created_at: string;
  name?: string;
  address_line2?: string;
  phone?: string;
}

const InfluencerGiftRequests = () => {
  const [requests, setRequests] = useState<GiftRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchRequests();
    // Subscribe for real-time notification updates here if you want, for now just fetch initially
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      // Fetch gift requests where influencer is the current user
      const { data, error } = await supabase
        .from('gift_requests')
        .select(`
          id,
          product_url,
          product_title,
          product_price,
          message,
          created_at,
          status,
          influencer_id,
          sender_id
        `)
        .eq('influencer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const requestsWithSenders = await Promise.all(
        (data || []).map(async (request: any) => {
          const { data: senderData } = await supabase
            .from('profiles')
            .select('id, email')
            .eq('id', request.sender_id)
            .maybeSingle();

          return {
            ...request,
            gift_item: request.product_title || request.product_url,
            status: request.status,
            sender: {
              id: senderData?.id || request.sender_id,
              email: senderData?.email || "Unknown email"
            }
          };
        })
      );

      setRequests(requestsWithSenders as GiftRequest[]);
    } catch (error) {
      toast({ title: "Error", description: "Failed to load requests", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: "accepted" | "rejected") => {
    try {
      const { error } = await supabase
        .from('gift_requests')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      setRequests(prev =>
        prev.map(r => r.id === id ? { ...r, status } : r)
      );
      
      if (status === 'accepted') {
        const request = requests.find(r => r.id === id);
        
        if (request) {
          const { data: addressData, error: addressError } = await supabase
            .from('influencer_addresses')
            .select('*')
            .eq('influencer_id', request.influencer_id)
            .eq('is_primary', true)
            .single();

          if (addressError) {
            console.error('Error getting address:', addressError);
            throw new Error('Could not find shipping address');
          }

          const influencerAddress = addressData as InfluencerAddress;

          const shippingAddress: Address = {
            name: influencerAddress.name || "Recipient",
            address_line1: influencerAddress.street_address,
            address_line2: influencerAddress.address_line2 || "",
            city: influencerAddress.city,
            state: influencerAddress.state,
            postal_code: influencerAddress.postal_code,
            country: influencerAddress.country || "India",
            phone: influencerAddress.phone || "Not provided"
          };

          const { data: orderData, error: orderError } = await supabase
            .from('orders')
            .insert({
              influencer_id: request.influencer_id,
              user_id: request.sender.id,
              product_url: request.product_url,
              product_title: request.product_title || "Gift from fan",
              product_price: request.product_price,
              status: 'accepted',
              shipping_address: shippingAddress,
              message: request.message
            })
            .select()
            .single();

          if (orderError) {
            console.error('Error creating order:', orderError);
            throw new Error('Could not create order for admin');
          }

          // Notify admins about the new approved gift that needs processing
          await sendAdminNotification(
            'new_approved_gift', 
            `New gift order approved by influencer and ready for processing`, 
            orderData.id, 
            request.sender.id
          );
        }
      }

      toast({
        title: "Success",
        description: `Gift request ${status === 'accepted' ? 'approved' : 'rejected'} successfully!`,
      });
    } catch (error) {
      console.error(`Error ${status === 'accepted' ? 'approving' : 'rejecting'} gift request:`, error);
      toast({
        title: "Error",
        description: `Failed to ${status === 'accepted' ? 'approve' : 'reject'} gift request`,
        variant: "destructive",
      });
    }
  };

  const getRequestsByStatus = (status: GiftRequest["status"]) =>
    requests.filter(r => r.status === status);

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="container mx-auto p-4 pt-20">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">My Gift Requests</CardTitle>
            <CardDescription>Fan requests sent to you. Approve or reject as you like!</CardDescription>
          </CardHeader>
        </Card>

        <Tabs defaultValue="pending">
          <TabsList className="mb-4">
            <TabsTrigger value="pending">
              Pending
              {getRequestsByStatus("pending").length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {getRequestsByStatus("pending").length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="accepted">Accepted</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>
          <TabsContent value="pending">
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : getRequestsByStatus("pending").length === 0 ? (
              <Card><CardContent className="pt-6 text-center text-muted-foreground">No pending requests.</CardContent></Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {getRequestsByStatus("pending").map(request => (
                  <RequestCard
                    key={request.id}
                    request={request}
                    onApprove={() => updateStatus(request.id, "accepted")}
                    onReject={() => updateStatus(request.id, "rejected")}
                  />
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="accepted">
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : getRequestsByStatus("accepted").length === 0 ? (
              <Card><CardContent className="pt-6 text-center text-muted-foreground">No accepted requests.</CardContent></Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {getRequestsByStatus("accepted").map(request => (
                  <RequestCard
                    key={request.id}
                    request={request}
                    showActions={false}
                  />
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="rejected">
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : getRequestsByStatus("rejected").length === 0 ? (
              <Card><CardContent className="pt-6 text-center text-muted-foreground">No rejected requests.</CardContent></Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {getRequestsByStatus("rejected").map(request => (
                  <RequestCard
                    key={request.id}
                    request={request}
                    showActions={false}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default InfluencerGiftRequests;
