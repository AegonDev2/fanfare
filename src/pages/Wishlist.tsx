import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@/hooks/useUser";
import { useInfluencerWishlist, WishlistItem } from "@/hooks/useInfluencerWishlist";
import WishlistGrid from "@/components/wishlist/WishlistGrid";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Gift, User } from "lucide-react";
import FloatingHeader from '@/components/ui/floating-header';
import Navbar from '@/components/navigation/Navbar';
const Wishlist = () => {
  const {
    id: influencerId
  } = useParams<{
    id: string;
  }>();
  const {
    user
  } = useUser();
  const {
    toast
  } = useToast();
  const [influencerName, setInfluencerName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [navOpen, setNavOpen] = useState(false);
  const userId = influencerId || (user?.user_type === 'influencer' ? user.id : null);
  const isOwner = user?.id === userId;
  const {
    wishlist,
    isLoading: isLoadingWishlist,
    addWishlistItem,
    removeWishlistItem
  } = useInfluencerWishlist(userId || '');
  useEffect(() => {
    const fetchInfluencerInfo = async () => {
      if (!userId) return;
      try {
        const {
          data,
          error
        } = await supabase.from("influencer_profiles").select("name").eq("id", userId).maybeSingle();
        if (error) throw error;
        setInfluencerName(data?.name || null);
      } catch (error) {
        console.error("Error fetching influencer info:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInfluencerInfo();
  }, [userId]);
  const handleRequestGift = (item: WishlistItem) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to send a gift",
        variant: "destructive"
      });
      return;
    }

    // Use the direct product URL for custom wishlist items
    window.location.href = `/gift-selection?wishlistUrl=${encodeURIComponent(item.product_url)}&influencerId=${encodeURIComponent(userId || '')}&title=${encodeURIComponent(item.product_title)}&price=${item.product_price || 0}&imageUrl=${encodeURIComponent(item.product_image_url || '')}`;
  };

  // Helper function wrapper for addWishlistItem that returns void
  const handleAddWishlistItem = async (item: any): Promise<void> => {
    try {
      await addWishlistItem(item);
    } catch (error) {
      console.error("Error adding wishlist item:", error);
    }
  };
  if (!userId) {
    return <>
        <FloatingHeader setNavOpen={setNavOpen} />
        <Navbar isOpen={navOpen} setIsOpen={setNavOpen} />
        <div className="min-h-screen w-full bg-gradient-to-br from-white to-gray-100 pt-20">
          <div className="container mx-auto py-6 px-4">
            <Card className="border-funky-purple/10 shadow-lg backdrop-blur-md bg-white/90">
              <CardContent className="pt-6 text-center">
                <p className="text-gray-600">No influencer selected. Please go to an influencer's profile to view their wishlist.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </>;
  }
  return <>
      <FloatingHeader setNavOpen={setNavOpen} />
      <Navbar isOpen={navOpen} setIsOpen={setNavOpen} />
      <div className="min-h-screen w-full bg-gradient-to-br from-white to-gray-100 pt-20">
        <div className="container mx-auto py-6 px-4 pb-24">
          <Card className="mb-8 border-funky-purple/10 shadow-lg backdrop-blur-md bg-white/90">
            <CardHeader className="flex flex-row justify-between items-center">
              <div>
                <CardTitle className="text-2xl bg-clip-text text-transparent bg-gradient-to-r from-funky-purple to-funky-pink">
                  {isOwner ? "Your Wishlist" : `${influencerName || "Influencer"}'s Wishlist`}
                </CardTitle>
                <CardDescription>
                  {isOwner ? "Manage items you'd like your fans to gift you" : `Browse items that ${influencerName || "this influencer"} would like to receive`}
                </CardDescription>
              </div>
              
              {!isOwner && userId}
            </CardHeader>
          </Card>

          <WishlistGrid wishlist={wishlist} isLoading={isLoading || isLoadingWishlist} isOwner={isOwner} onAddItem={isOwner ? handleAddWishlistItem : undefined} onRemoveItem={isOwner ? removeWishlistItem : undefined} onRequestGift={!isOwner ? handleRequestGift : undefined} />
        </div>
      </div>
    </>;
};
export default Wishlist;