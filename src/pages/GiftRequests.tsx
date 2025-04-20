
import { useState, useEffect } from "react";
import Header from "@/components/landing/Header";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { CheckIcon, XIcon, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface GiftRequest {
  id: string;
  gift_item: string;
  product_url: string;
  message: string;
  created_at: string;
  status: 'pending' | 'accepted' | 'rejected' | 'ordered' | 'delivered';
  sender: {
    id: string;
    email: string;
  };
  influencer_id: string;
  product_title: string | null;
  product_price: number | null;
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

const GiftRequests = () => {
  const [requests, setRequests] = useState<GiftRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchGiftRequests();
  }, []);

  const fetchGiftRequests = async () => {
    try {
      setLoading(true);
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
          sender:sender_id (id, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (data) {
        const typedRequests = data.map(item => ({
          ...item,
          gift_item: item.product_title || item.product_url,
          status: (item.status as 'pending' | 'accepted' | 'rejected' | 'ordered' | 'delivered') || 'pending',
          // Ensure sender has correct shape
          sender: {
            id: item.sender.id || '',
            email: item.sender.email || ''
          }
        }));
        setRequests(typedRequests as GiftRequest[]);
      }
    } catch (error) {
      console.error('Error fetching gift requests:', error);
      toast({
        title: "Error",
        description: "Failed to load gift requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (id: string, status: 'accepted' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('gift_requests')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      setRequests(prev => 
        prev.map(request => 
          request.id === id ? { ...request, status } : request
        )
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

          // Cast addressData to InfluencerAddress type
          const influencerAddress = addressData as InfluencerAddress;

          // Create a properly formatted shipping address object
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

          // Create order for admin with product URL
          const { error: orderError } = await supabase
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
            });

          if (orderError) {
            console.error('Error creating order:', orderError);
            throw new Error('Could not create order for admin');
          }

          // Send notification to admin
          await supabase.functions.invoke('send-notification', {
            body: {
              type: 'new_approved_gift',
              recipientId: null, // Will be handled by edge function for admins
              senderId: request.sender.id,
              giftRequestId: request.id,
              message: `New gift order approved by influencer and ready for processing`
            }
          });
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

  const getPendingRequests = () => requests.filter(r => r.status === 'pending');
  const getApprovedRequests = () => requests.filter(r => r.status === 'approved');
  const getRejectedRequests = () => requests.filter(r => r.status === 'rejected');

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="container mx-auto p-4 pt-20">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">Gift Requests</CardTitle>
            <CardDescription>
              Manage gifts that fans want to send you
            </CardDescription>
          </CardHeader>
        </Card>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="pending" className="relative">
              Pending
              {getPendingRequests().length > 0 && (
                <Badge variant="destructive" className="ml-2 absolute -top-2 -right-2">
                  {getPendingRequests().length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            {loading ? (
              <div className="text-center py-8">Loading pending requests...</div>
            ) : getPendingRequests().length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No pending gift requests.
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {getPendingRequests().map((request) => (
                  <RequestCard 
                    key={request.id}
                    request={request}
                    onApprove={() => updateRequestStatus(request.id, 'approved')}
                    onReject={() => updateRequestStatus(request.id, 'rejected')}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="approved">
            {loading ? (
              <div className="text-center py-8">Loading approved requests...</div>
            ) : getApprovedRequests().length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No approved gift requests.
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {getApprovedRequests().map((request) => (
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
              <div className="text-center py-8">Loading rejected requests...</div>
            ) : getRejectedRequests().length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No rejected gift requests.
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {getRejectedRequests().map((request) => (
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

interface RequestCardProps {
  request: GiftRequest;
  onApprove?: () => void;
  onReject?: () => void;
  showActions?: boolean;
}

const RequestCard = ({ request, onApprove, onReject, showActions = true }: RequestCardProps) => {
  const formattedDate = new Date(request.created_at).toLocaleDateString();
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{request.product_title || "Gift Request"}</CardTitle>
          <Badge variant={
            request.status === 'pending' ? 'outline' : 
            request.status === 'approved' ? 'default' : 'destructive'
          }>
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
      {showActions && request.status === 'pending' && (
        <CardFooter className="flex justify-between pt-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-red-600 hover:text-red-800 hover:bg-red-100"
            onClick={onReject}
          >
            <XIcon className="mr-1 h-4 w-4" /> Reject
          </Button>
          <Button 
            variant="default" 
            size="sm"
            onClick={onApprove}
          >
            <CheckIcon className="mr-1 h-4 w-4" /> Approve
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default GiftRequests;
