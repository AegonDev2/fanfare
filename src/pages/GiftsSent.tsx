
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useGiftsSent } from "@/hooks/useGiftsSent";
import { GiftRequestCard } from "@/components/gifts/GiftRequestCard";
import { GiftDetailsDialog } from "@/components/gifts/GiftDetailsDialog";
import { EmptyGiftsState } from "@/components/gifts/EmptyGiftsState";
import { LoadingGiftsState } from "@/components/gifts/LoadingGiftsState";
import FloatingHeader from '@/components/ui/floating-header';
import Navbar from '@/components/navigation/Navbar';

const GiftsSent = () => {
  const [navOpen, setNavOpen] = useState(false);
  const {
    requests,
    loading,
    fetchSentGiftRequests,
    selectedRequest,
    dialogOpen,
    setDialogOpen,
    handleDetailsClick
  } = useGiftsSent();

  useEffect(() => {
    fetchSentGiftRequests();
  }, [fetchSentGiftRequests]);

  return (
    <>
      <FloatingHeader setNavOpen={setNavOpen} />
      <Navbar isOpen={navOpen} setIsOpen={setNavOpen} />
      <div className="min-h-screen w-full bg-[var(--background)] bg-rose-100 pt-20">
        <div className="container mx-auto py-6 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Gifts Sent</h1>
                <p className="text-gray-600 mt-1">
                  Track and manage all your gift requests
                </p>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => fetchSentGiftRequests()} disabled={loading}>
                  Refresh
                </Button>
              </div>
            </div>

            {loading ? (
              <LoadingGiftsState />
            ) : requests.length === 0 ? (
              <EmptyGiftsState />
            ) : (
              <div className="grid grid-cols-1 gap-4 pb-20">
                {requests.map(request => (
                  <GiftRequestCard 
                    key={request.id} 
                    request={request} 
                    onDetailsClick={handleDetailsClick} 
                  />
                ))}
              </div>
            )}

            <GiftDetailsDialog 
              open={dialogOpen} 
              onOpenChange={setDialogOpen} 
              request={selectedRequest} 
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default GiftsSent;
