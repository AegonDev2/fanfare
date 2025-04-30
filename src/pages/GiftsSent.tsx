
import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import Header from "@/components/landing/Header";
import { Package, Info, Calendar, Clock, Check, X } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface GiftRequest {
  id: string;
  product_url: string;
  product_title: string | null;
  product_price: number | null;
  message: string | null;
  created_at: string;
  status: 'pending' | 'accepted' | 'rejected' | 'under process' | 'completed';
  influencer: { 
    name: string 
  } | null;
  platform_fee?: number | null;
  total_amount?: number | null;
  completed_at?: string | null;
  delivery_estimate?: string | null;
}

const STATUS_LABELS: Record<string, { label: string, color: string, icon: any }> = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  accepted: { label: "Accepted", color: "bg-blue-100 text-blue-800", icon: Package },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-800", icon: X },
  "under process": { label: "Processing", color: "bg-purple-100 text-purple-800", icon: Package },
  completed: { label: "Completed", color: "bg-green-100 text-green-800", icon: Check },
};

const GiftsSent = () => {
  const { toast } = useToast();
  const [requests, setRequests] = useState<GiftRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<GiftRequest | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchSentGiftRequests = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) {
        setRequests([]);
        setLoading(false);
        return;
      }
      
      // Fetch gift requests with all status information
      const { data, error } = await supabase
        .from("gift_requests")
        .select(`
          id,
          product_url,
          product_title,
          product_price,
          message,
          created_at,
          status,
          platform_fee,
          total_amount,
          completed_at,
          delivery_estimate,
          influencer:influencer_id(name)
        `)
        .eq("sender_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching gift requests:", error);
        throw error;
      }

      // Format data
      if (data) {
        const formattedRequests = data.map(item => ({
          ...item,
          influencer: item.influencer || { name: "Unknown Influencer" }
        }));
        
        setRequests(formattedRequests);
      }
    } catch (error: any) {
      toast({
        title: "Error loading gifts",
        description: error.message,
        variant: "destructive",
      });
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchSentGiftRequests();
  }, [fetchSentGiftRequests]);

  const handleDetailsClick = (request: GiftRequest) => {
    setSelectedRequest(request);
    setDialogOpen(true);
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount == null) return "N/A";
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const renderStatusBadge = (status: string) => {
    const statusInfo = STATUS_LABELS[status] || { label: status, color: "bg-gray-100 text-gray-800", icon: Info };
    const StatusIcon = statusInfo.icon;
    
    return (
      <div className="flex items-center">
        <Badge className={`${statusInfo.color} px-2 py-1`}>
          <StatusIcon className="h-3.5 w-3.5 mr-1" />
          {statusInfo.label}
        </Badge>
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full bg-[var(--background)]">
      <Header />
      <div className="container mx-auto pt-28 pb-10 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Gifts Sent</h1>
              <p className="text-gray-600 mt-1">
                Track and manage all your gift requests
              </p>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={() => fetchSentGiftRequests()}
                disabled={loading}
              >
                Refresh
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-pulse text-center">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Loading your gift requests...</p>
              </div>
            </div>
          ) : requests.length === 0 ? (
            <Card className="p-12 text-center bg-white shadow-sm">
              <CardContent className="pt-6">
                <Package className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold mb-2">No Gifts Found</h3>
                <p className="text-gray-600">You haven't sent any gifts yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {requests.map((request) => (
                <Card key={request.id} className="overflow-hidden bg-white shadow-sm transition-all hover:shadow">
                  <CardContent className="p-0">
                    <div className="p-6 flex flex-col md:flex-row justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <h3 className="font-semibold text-lg truncate">
                            {request.product_title || "Gift Request"}
                          </h3>
                          <div className="ml-4 flex-shrink-0">
                            {renderStatusBadge(request.status)}
                          </div>
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          To: {request.influencer?.name || "Influencer"}
                        </div>
                        {request.message && (
                          <p className="mt-2 text-sm text-gray-700 line-clamp-2">
                            "{request.message}"
                          </p>
                        )}
                        {request.product_price && (
                          <div className="mt-2 text-sm font-medium">
                            Price: {formatCurrency(request.product_price)}
                          </div>
                        )}
                        <div className="flex items-center mt-4 space-x-4 text-xs text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="h-3.5 w-3.5 mr-1 text-gray-400" />
                            Requested on {formatDate(request.created_at)}
                          </div>
                          {request.delivery_estimate && (
                            <div className="flex items-center">
                              <Calendar className="h-3.5 w-3.5 mr-1 text-gray-400" />
                              Expected delivery: {formatDate(request.delivery_estimate)}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center md:items-start">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full md:w-auto"
                          onClick={() => handleDetailsClick(request)}
                        >
                          <Info className="h-4 w-4 mr-1" />
                          Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Details Dialog */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Gift Request Details</DialogTitle>
                <DialogDescription>
                  Complete information about your gift request
                </DialogDescription>
              </DialogHeader>
              {selectedRequest && (
                <div className="py-4">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {selectedRequest.product_title || "Gift Request"}
                      </h3>
                      <p className="text-sm text-gray-500">
                        To: {selectedRequest.influencer?.name || "Influencer"}
                      </p>
                      <div className="mt-2">
                        {renderStatusBadge(selectedRequest.status)}
                      </div>
                    </div>

                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">Gift</TableCell>
                          <TableCell>{selectedRequest.product_title}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Price</TableCell>
                          <TableCell>
                            {formatCurrency(selectedRequest.product_price)}
                          </TableCell>
                        </TableRow>
                        {selectedRequest.platform_fee && (
                          <TableRow>
                            <TableCell className="font-medium">Platform Fee</TableCell>
                            <TableCell>{formatCurrency(selectedRequest.platform_fee)}</TableCell>
                          </TableRow>
                        )}
                        {selectedRequest.total_amount && (
                          <TableRow>
                            <TableCell className="font-medium">Total Amount</TableCell>
                            <TableCell>{formatCurrency(selectedRequest.total_amount)}</TableCell>
                          </TableRow>
                        )}
                        <TableRow>
                          <TableCell className="font-medium">Date Requested</TableCell>
                          <TableCell>{formatDate(selectedRequest.created_at)}</TableCell>
                        </TableRow>
                        {selectedRequest.completed_at && (
                          <TableRow>
                            <TableCell className="font-medium">Date Completed</TableCell>
                            <TableCell>{formatDate(selectedRequest.completed_at)}</TableCell>
                          </TableRow>
                        )}
                        {selectedRequest.delivery_estimate && (
                          <TableRow>
                            <TableCell className="font-medium">Estimated Delivery</TableCell>
                            <TableCell>{formatDate(selectedRequest.delivery_estimate)}</TableCell>
                          </TableRow>
                        )}
                        <TableRow>
                          <TableCell className="font-medium">Status</TableCell>
                          <TableCell>{STATUS_LABELS[selectedRequest.status]?.label || selectedRequest.status}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                    
                    {selectedRequest.message && (
                      <div>
                        <h4 className="font-medium mb-1">Your Message:</h4>
                        <div className="bg-gray-50 rounded-md p-3 text-gray-700 text-sm">
                          {selectedRequest.message}
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <h4 className="font-medium mb-1">Product Link:</h4>
                      <a
                        href={selectedRequest.product_url}
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
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default GiftsSent;
