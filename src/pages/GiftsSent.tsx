import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import Header from "@/components/landing/Header";
import { useGiftsSent } from "@/hooks/useGiftsSent";
import { GiftRequestCard } from "@/components/gifts/GiftRequestCard";
import { GiftDetailsDialog } from "@/components/gifts/GiftDetailsDialog";
import { EmptyGiftsState } from "@/components/gifts/EmptyGiftsState";
import { LoadingGiftsState } from "@/components/gifts/LoadingGiftsState";
const GiftsSent = () => {
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
  return <div className="min-h-screen w-full bg-[var(--background)] bg-slate-50">
      <Header />
      <div className="container mx-auto pt-28 pb-10 px-4 py-[25px]">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Gifts Sent</h1>
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

          {loading ? <LoadingGiftsState /> : requests.length === 0 ? <EmptyGiftsState /> : <div className="grid grid-cols-1 gap-4">
              {requests.map(request => <GiftRequestCard key={request.id} request={request} onDetailsClick={handleDetailsClick} />)}
            </div>}

          <GiftDetailsDialog open={dialogOpen} onOpenChange={setDialogOpen} request={selectedRequest} />
        </div>
      </div>
    </div>;
};
export default GiftsSent;