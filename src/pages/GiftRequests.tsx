
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import FloatingHeader from '@/components/ui/floating-header';
import Navbar from '@/components/navigation/Navbar';
import { useGiftRequests } from '@/hooks/useGiftRequests';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Gift, Clock, History } from 'lucide-react';
import GiftRequestCard from '@/components/gift-requests/GiftRequestCard';
import { GiftsListSkeleton } from '@/components/loading/AppSkeleton';
import { ErrorFallback } from '@/components/error/ErrorFallback';
import { useUser } from '@/hooks/useUser';

export default function GiftRequests() {
  const [navOpen, setNavOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const { user } = useUser();
  const { requests: giftRequests, loading: isLoading, error, fetchRequests, getPendingRequests, getAcceptedRequests, getRejectedRequests, setRequests } = useGiftRequests();

  // Get URL parameters for tab and focus
  const urlTab = searchParams.get('tab') || 'pending';
  const focusId = searchParams.get('focus');

  // Handle focusing on specific request
  useEffect(() => {
    if (focusId && giftRequests.length > 0) {
      setTimeout(() => {
        const element = document.getElementById(`gift-request-${focusId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add('ring-2', 'ring-funky-purple', 'ring-opacity-50');
          setTimeout(() => {
            element.classList.remove('ring-2', 'ring-funky-purple', 'ring-opacity-50');
          }, 3000);
        }
      }, 100);
    }
  }, [focusId, giftRequests]);

  // Redirect if not influencer
  if (user && user.user_type !== 'influencer') {
    return (
      <>
        <FloatingHeader setNavOpen={setNavOpen} />
        <Navbar isOpen={navOpen} setIsOpen={setNavOpen} />
        <div className="min-h-screen bg-background pt-20 flex items-center justify-center">
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <Gift className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h3>
              <p className="text-gray-500">This page is only available to influencers.</p>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  const pendingRequests = getPendingRequests();
  const acceptedRequests = getAcceptedRequests();
  const rejectedRequests = getRejectedRequests();
  const historyRequests = [...acceptedRequests, ...rejectedRequests];

  if (isLoading) {
    return (
      <>
        <FloatingHeader setNavOpen={setNavOpen} />
        <Navbar isOpen={navOpen} setIsOpen={setNavOpen} />
        <div className="min-h-screen bg-background pt-20 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <div className="h-8 w-48 bg-muted animate-pulse rounded" />
              <div className="h-6 w-64 bg-muted animate-pulse rounded mt-2" />
            </div>
            <GiftsListSkeleton />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <FloatingHeader setNavOpen={setNavOpen} />
      <Navbar isOpen={navOpen} setIsOpen={setNavOpen} />
      
      <div className="min-h-screen bg-background pt-20 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-funky-purple to-funky-pink bg-clip-text text-transparent">
              Gift Requests
            </h1>
            <p className="text-gray-600 mt-2">View and manage your gift requests</p>
          </div>

          {error && (
            <ErrorFallback 
              error={error} 
              onRetry={fetchRequests}
              title="Failed to load gift requests"
              description="Unable to load your gift requests. Please try again."
              showHomeButton={false}
            />
          )}

          <Tabs defaultValue={urlTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pending" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Pending Approval ({pendingRequests.length})
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                History ({historyRequests.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="mt-6">
              {pendingRequests.length > 0 ? (
                <div className="grid gap-4">
                  {pendingRequests.map((request) => (
                    <GiftRequestCard 
                      key={request.id} 
                      request={request} 
                      onStatusChange={fetchRequests}
                      requests={giftRequests}
                      setRequests={setRequests}
                    />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="pt-6 text-center py-12">
                    <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No pending requests</h3>
                    <p className="text-gray-500">All your gift requests have been processed.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="history" className="mt-6">
              {historyRequests.length > 0 ? (
                <div className="grid gap-4">
                  {historyRequests.map((request) => (
                    <GiftRequestCard 
                      key={request.id} 
                      request={request} 
                      onStatusChange={fetchRequests}
                      requests={giftRequests}
                      setRequests={setRequests}
                    />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="pt-6 text-center py-12">
                    <History className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No request history</h3>
                    <p className="text-gray-500">Your processed gift requests will appear here.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
