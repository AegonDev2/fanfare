
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
import { CheckIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface GiftRequest {
  id: string;
  gift_item: string;
  message: string;
  created_at: string;
  status: 'pending' | 'approved' | 'rejected';
  sender: {
    id: string;
    email: string;
  };
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
      // In a real app, this would filter by the current influencer's ID
      const { data, error } = await supabase
        .from('gifts_to_influencers')
        .select(`
          id,
          gift_item,
          message,
          created_at,
          status,
          sender:sender_id (id, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Make sure we're only setting data that matches our GiftRequest type
      if (data) {
        const typedRequests: GiftRequest[] = data.map(item => ({
          ...item,
          // Ensure status is one of the allowed values
          status: (item.status as 'pending' | 'approved' | 'rejected') || 'pending'
        }));
        setRequests(typedRequests);
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

  const updateRequestStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('gifts_to_influencers')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setRequests(prev => 
        prev.map(request => 
          request.id === id ? { ...request, status } : request
        )
      );

      toast({
        title: "Success",
        description: `Gift request ${status === 'approved' ? 'approved' : 'rejected'} successfully!`,
      });
    } catch (error) {
      console.error(`Error ${status === 'approved' ? 'approving' : 'rejecting'} gift request:`, error);
      toast({
        title: "Error",
        description: `Failed to ${status === 'approved' ? 'approve' : 'reject'} gift request`,
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
          <CardTitle className="text-lg">{request.gift_item}</CardTitle>
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
