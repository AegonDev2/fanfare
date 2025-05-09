
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Gift, ShoppingCart, ChevronRight, Loader2 } from 'lucide-react';
import Header from '@/components/landing/Header';
import GiftSection from '@/components/landing/GiftSection';
import InfluencerSelector from '@/components/gift-selection/InfluencerSelector';
import GiftMessage from '@/components/gift-selection/GiftMessage';
import { useGiftItems, GiftItem } from '@/hooks/useGiftItems';
import { useGiftCart } from '@/hooks/useGiftCart';

export default function GiftSelection() {
  const [searchParams] = useSearchParams();
  const [gift, setGift] = useState<GiftItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedInfluencerId, setSelectedInfluencerId] = useState<string | null>(null);
  const [giftMessage, setGiftMessage] = useState('');
  const [activeTab, setActiveTab] = useState('gift');
  const { toast } = useToast();
  const navigate = useNavigate();
  const { getGiftById } = useGiftItems();
  const { addToCart, cartCount } = useGiftCart();
  
  const giftId = searchParams.get('gift');
  
  useEffect(() => {
    async function loadGift() {
      if (!giftId) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const giftData = await getGiftById(giftId);
        
        if (giftData) {
          setGift(giftData);
        } else {
          toast({
            title: 'Gift Not Found',
            description: 'The requested gift could not be found',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Error loading gift:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadGift();
  }, [giftId, getGiftById, toast]);

  const handleAddToCart = () => {
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
    
    addToCart(gift, selectedInfluencerId, giftMessage);
    
    // Clear selection state
    setSelectedInfluencerId(null);
    setGiftMessage('');
    
    // Redirect to cart if user wants to proceed
    navigate('/gift-cart');
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <div className="container mx-auto px-4 pt-20 flex flex-col items-center justify-center py-16">
          <Loader2 className="h-12 w-12 text-funky-purple animate-spin" />
          <p className="mt-4 text-lg text-gray-500">Loading gift details...</p>
        </div>
      </div>
    );
  }
  
  if (!gift && giftId) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <div className="container mx-auto px-4 pt-20 py-8">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-red-500">Gift Not Found</CardTitle>
              <CardDescription>The requested gift could not be found.</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button onClick={() => navigate('/')}>Back to Home</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="container mx-auto px-4 pt-20 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Send a Gift</h1>
          
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => navigate('/gift-cart')}
          >
            <ShoppingCart className="h-4 w-4" />
            <span>Cart</span>
            {cartCount > 0 && (
              <Badge variant="secondary" className="ml-1 bg-funky-purple text-white">
                {cartCount}
              </Badge>
            )}
          </Button>
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
            
            <div className="mb-8">
              <GiftSection />
            </div>
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
                        selectedInfluencerId={selectedInfluencerId}
                      />
                      
                      {selectedInfluencerId && (
                        <div className="pt-4">
                          <GiftMessage onChange={setGiftMessage} defaultValue={giftMessage} />
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
              
              <CardFooter className="flex flex-col space-y-4">
                <Button
                  className="w-full bg-gradient-to-r from-funky-purple to-funky-pink text-white"
                  onClick={handleAddToCart}
                  disabled={!gift || !selectedInfluencerId}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate('/gift-cart')}
                >
                  View Cart ({cartCount})
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
