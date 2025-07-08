
import { useState } from 'react';
import FloatingHeader from '@/components/ui/floating-header';
import Navbar from '@/components/navigation/Navbar';
import { useGiftRequests } from '@/hooks/useGiftRequests';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Gift } from 'lucide-react';
import GiftRequestCard from '@/components/gift-requests/GiftRequestCard';

export default function GiftRequests() {
  const [navOpen, setNavOpen] = useState(false);
  const { requests: giftRequests, loading: isLoading, error, fetchRequests } = useGiftRequests();

  if (isLoading) {
    return (
      <>
        <FloatingHeader setNavOpen={setNavOpen} />
        <Navbar isOpen={navOpen} setIsOpen={setNavOpen} />
        <div className="min-h-screen bg-background pt-20 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
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
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <p className="text-red-800">Error loading gift requests: {error.message}</p>
              </CardContent>
            </Card>
          )}

          {giftRequests && giftRequests.length > 0 ? (
            <div className="grid gap-4">
              {giftRequests.map((request) => (
                <GiftRequestCard 
                  key={request.id} 
                  request={request} 
                  onStatusChange={fetchRequests}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <Gift className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No gift requests yet</h3>
                <p className="text-gray-500">Your gift requests will appear here once you start receiving them.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
