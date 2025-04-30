
import Header from "@/components/landing/Header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import RequestCard from "@/components/gift-requests/RequestCard";
import { useGiftRequests } from "@/hooks/useGiftRequests";
import { useGiftRequestActions } from "@/hooks/useGiftRequestActions";

const GiftRequests = () => {
  const {
    requests,
    loading,
    setRequests,
    getPendingRequests,
    getAcceptedRequests,
    getRejectedRequests,
  } = useGiftRequests();

  const { updateRequestStatus } = useGiftRequestActions(requests, setRequests);

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
                    request={{
                      ...request,
                      status: request.status as "pending" | "accepted" | "rejected"
                    }}
                    onApprove={() => updateRequestStatus(request.id, 'accepted')}
                    onReject={() => updateRequestStatus(request.id, 'rejected')}
                  />
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="approved">
            {loading ? (
              <div className="text-center py-8">Loading approved requests...</div>
            ) : getAcceptedRequests().length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No approved gift requests.
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {getAcceptedRequests().map((request) => (
                  <RequestCard
                    key={request.id}
                    request={{
                      ...request,
                      status: request.status as "pending" | "accepted" | "rejected"
                    }}
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
                    request={{
                      ...request,
                      status: request.status as "pending" | "accepted" | "rejected"
                    }}
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

export default GiftRequests;
