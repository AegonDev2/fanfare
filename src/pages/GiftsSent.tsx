
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useGiftsSent } from "@/hooks/useGiftsSent";
import { GiftRequestCard } from "@/components/gifts/GiftRequestCard";
import { EmptyGiftsState } from "@/components/gifts/EmptyGiftsState";
import { LoadingGiftsState } from "@/components/gifts/LoadingGiftsState";
import FloatingHeader from '@/components/ui/floating-header';
import Navbar from '@/components/navigation/Navbar';

const GiftsSent = () => {
  const navigate = useNavigate();
  const [navOpen, setNavOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const {
    requests,
    loading,
    error,
    fetchSentGiftRequests
  } = useGiftsSent();

  // Get focus parameter from URL
  const focusId = searchParams.get('focus');

  // Handle focusing on specific request
  useEffect(() => {
    if (focusId && requests.length > 0) {
      setTimeout(() => {
        const element = document.getElementById(`gift-sent-${focusId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add('ring-2', 'ring-funky-purple', 'ring-opacity-50');
          setTimeout(() => {
            element.classList.remove('ring-2', 'ring-funky-purple', 'ring-opacity-50');
          }, 3000);
        }
      }, 100);
    }
  }, [focusId, requests]);

  const handleDetailsClick = (request: any) => {
    navigate('/track-order', { state: { orderId: request.id } });
  };

  useEffect(() => {
    console.log("GiftsSent - Component mounted, fetching sent gift requests");
    fetchSentGiftRequests();
  }, [fetchSentGiftRequests]);

  console.log("GiftsSent - Current state:", { 
    loading, 
    error, 
    requestsCount: requests.length,
    requests: requests.map(r => ({ id: r.id, status: r.status, title: r.product_title }))
  });

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

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-800 text-sm">
                  Error loading gifts: {error}
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => fetchSentGiftRequests()} 
                  className="mt-2"
                >
                  Try Again
                </Button>
              </div>
            )}

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
          </div>
        </div>
      </div>
    </>
  );
};

export default GiftsSent;
