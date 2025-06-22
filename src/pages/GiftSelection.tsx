
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Gift, ChevronRight, Loader2, X } from 'lucide-react';
import FloatingHeader from '@/components/ui/floating-header';
import Navbar from '@/components/navigation/Navbar';
import GiftSection from '@/components/landing/GiftSection';
import InfluencerSelector from '@/components/gift-selection/InfluencerSelector';
import GiftMessage from '@/components/gift-selection/GiftMessage';
import { useGiftItems, GiftItem } from '@/hooks/useGiftItems';
import { useUser } from '@/hooks/useUser';

interface WishlistItemData {
  url: string;
  title: string;
  price: number;
  imageUrl: string;
  influencerId: string;
}

export default function GiftSelection() {
  const [searchParams] = useSearchParams();
  const [gift, setGift] = useState<GiftItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedInfluencerId, setSelectedInfluencerId] = useState<string | null>(null);
  const [giftMessage, setGiftMessage] = useState('');
  const [activeTab, setActiveTab] = useState('gift');
  const [error, setError] = useState<boolean>(false);
  const [fetchAttempted, setFetchAttempted] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const isMounted = useRef(true);
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const { getGiftById } = useGiftItems();
  const { user } = useUser();
  
  const giftId = searchParams.get('gift');
  // Check for wishlist params
  const wishlistUrl = searchParams.get('wishlistUrl');
  const wishlistTitle = searchParams.get('title');
  const wishlistPrice = searchParams.get('price');
  const wishlistImageUrl = searchParams.get('imageUrl');
  const wishlistInfluencerId = searchParams.get('influencerId');
  
  // Handle wishlist item data
  useEffect(() => {
    if (wishlistUrl && wishlistTitle && isMounted.current) {
      const price = parseFloat(wishlistPrice || '0');
      
      // Create a GiftItem from wishlist data
      const wishlistGiftItem: GiftItem = {
        id: 'custom-wishlist-item',
        name: decodeURIComponent(wishlistTitle),
        price: isNaN(price) ? 0 : price,
        image_url: decodeURIComponent(wishlistImageUrl || ''),
        description: 'Item from influencer wishlist',
        is_featured: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        gift_url: decodeURIComponent(wishlistUrl),
      };
      
      setGift(wishlistGiftItem);
      setLoading(false);
      setFetchAttempted(true);
      
      // If influencer ID is provided, select it automatically
      if (wishlistInfluencerId) {
        setSelectedInfluencerId(decodeURIComponent(wishlistInfluencerId));
        setActiveTab('influencer');
      }
    }
  }, [wishlistUrl, wishlistTitle, wishlistPrice, wishlistImageUrl, wishlistInfluencerId]);
  
  // Use useCallback to memoize the loadGift function
  const loadGift = useCallback(async () => {
    // Skip if we already have wishlist data or no gift ID
    if ((wishlistUrl && wishlistTitle) || !giftId || !isMounted.current) {
      if (isMounted.current && !wishlistUrl) {
        setLoading(false);
        setFetchAttempted(true);
      }
      return;
    }
    
    try {
      if (isMounted.current) {
        setLoading(true);
        setError(false);
      }
      
      console.log("Fetching gift by ID:", giftId);
      const giftData = await getGiftById(giftId);
      console.log("Gift data received:", giftData);
      
      if (!isMounted.current) return;
      
      if (giftData) {
        setGift(giftData);
      } else {
        setError(true);
        toast({
          title: 'Gift Not Found',
          description: 'The requested gift could not be found',
          variant: 'destructive',
        });
      }
    } catch (err) {
      if (isMounted.current) {
        console.error('Error loading gift:', err);
        setError(true);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
        setFetchAttempted(true);
      }
    }
  }, [giftId, getGiftById, toast, wishlistUrl, wishlistTitle]);
  
  // Effect to load gift data on mount and giftId changes
  useEffect(() => {
    isMounted.current = true;
    
    // Only load if we haven't fetched or if giftId changes
    if (!fetchAttempted || giftId) {
      loadGift();
    }
    
    // Cleanup function
    return () => {
      isMounted.current = false;
    };
  }, [loadGift, fetchAttempted, giftId]);
  
  const handleGiftThis = useCallback(async () => {
    if (!gift) {
      toast({
        title: 'Error',
        description: 'No gift selected',
        variant: 'destructive',
      });
      return;
    }
    
    if (!selectedInfluencerId) {
      toast({
        title: 'Select an Influencer',
        description: 'Please select an influencer to send this gift to',
        variant: 'destructive',
      });
      setActiveTab('influencer');
      return;
    }

    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to send gifts',
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }
    
    console.log("handleGiftThis called with:", { gift, selectedInfluencerId, giftMessage });
    
    // Navigate to place order page with gift data
    const params = new URLSearchParams({
      gift: gift.gift_url || gift.image_url || '',
      influencer: selectedInfluencerId,
      giftId: gift.id,
      message: giftMessage || ''
    });
    
    navigate(`/place-order?${params.toString()}`);
    
  }, [gift, selectedInfluencerId, giftMessage, navigate, toast, user]);
  
  // Create loading and error UI components using memoization
  const loadingContent = useMemo(() => (
    <div className="min-h-screen bg-gray-100">
      <FloatingHeader setNavOpen={setNavOpen} />
      <Navbar isOpen={navOpen} setIsOpen={setNavOpen} />
      <div className="container mx-auto px-4 pt-20 flex flex-col items-center justify-center py-16">
        <Loader2 className="h-12 w-12 text-funky-purple animate-spin" />
        <p className="mt-4 text-lg text-gray-500">Loading gift details...</p>
      </div>
    </div>
  ), [navOpen]);
  
  const errorContent = useMemo(() => (
    <div className="min-h-screen bg-gray-100">
      <FloatingHeader setNavOpen={setNavOpen} />
      <Navbar isOpen={navOpen} setIsOpen={setNavOpen} />
      <div className="container mx-auto px-4 pt-20 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-red-500">Gift Not Found</CardTitle>
              <X className="h-5 w-5 text-red-500" />
            </div>
            <CardDescription>The requested gift could not be found or there was an error loading it.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => navigate('/')}>Back to Home</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  ), [navigate, navOpen]);

  // Early return for loading state
  if (loading) {
    return loadingContent;
  }
  
  // Early return for error state - only for regular gifts, not wishlist items
  if (error && !wishlistUrl && (!gift && giftId && fetchAttempted)) {
    return errorContent;
  }

  return (
    <>
      <FloatingHeader setNavOpen={setNavOpen} />
      <Navbar isOpen={navOpen} setIsOpen={setNavOpen} />
      
      <div className="min-h-screen bg-gray-100 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-6">
            <h1 className="text-2xl font-bold">Send a Gift</h1>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Gift Selection</CardTitle>
                  <CardDescription>
                    Select a gift to send to your favorite influencer
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {gift ? (
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="w-full md:w-1/3">
                        <div className="aspect-square rounded-lg overflow-hidden border bg-white">
                          <img
                            src={gift.image_url}
                            alt={gift.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">{gift.name}</h3>
                        <p className="text-lg font-medium text-funky-purple mb-4">₹{gift.price}</p>
                        
                        {gift.description && (
                          <p className="text-gray-600 mb-4">{gift.description}</p>
                        )}
                        
                        <div className="mt-auto">
                          <Button 
                            className="w-full md:w-auto bg-gradient-to-r from-funky-purple to-funky-pink text-white"
                            onClick={() => setActiveTab('influencer')}
                          >
                            Continue <ChevronRight className="h-4 w-4 ml-2" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 py-4">
                      Please select a gift from the options below
                    </p>
                  )}
                </CardContent>
              </Card>
              
              {/* Only show gift section if not coming from wishlist */}
              {!wishlistUrl && (
                <div className="mb-8">
                  <GiftSection />
                </div>
              )}
            </div>
            
            <div className="md:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Gift Details</CardTitle>
                </CardHeader>
                
                <CardContent>
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                      <TabsTrigger value="gift">
                        <Gift className="h-4 w-4 mr-2" />
                        Gift
                      </TabsTrigger>
                      <TabsTrigger value="influencer">
                        Influencer
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="gift">
                      {gift ? (
                        <div>
                          <div className="flex items-center gap-3 p-3 rounded-lg border border-funky-purple/20 bg-funky-purple/5 mb-4">
                            <div className="h-12 w-12 rounded-md overflow-hidden bg-white">
                              <img
                                src={gift.image_url}
                                alt={gift.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div>
                              <h4 className="font-medium">{gift.name}</h4>
                              <p className="text-sm text-funky-purple">₹{gift.price}</p>
                            </div>
                          </div>
                          
                          <Button 
                            className="w-full bg-gradient-to-r from-funky-purple to-funky-pink text-white"
                            onClick={() => setActiveTab('influencer')}
                          >
                            Select Influencer <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Gift className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500">No gift selected</p>
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="influencer">
                      <div className="space-y-6">
                        <InfluencerSelector
                          onSelect={setSelectedInfluencerId}
                          selectedInfluencerId={selectedInfluencerId || wishlistInfluencerId || null}
                        />
                        
                        {(selectedInfluencerId || wishlistInfluencerId) && (
                          <div className="pt-4">
                            <GiftMessage onChange={setGiftMessage} defaultValue={giftMessage} />
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
                
                <CardFooter>
                  <Button
                    className="w-full bg-gradient-to-r from-funky-purple to-funky-pink text-white"
                    onClick={handleGiftThis}
                    disabled={!gift || !selectedInfluencerId || !user}
                  >
                    <Gift className="h-4 w-4 mr-2" />
                    Gift This
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
