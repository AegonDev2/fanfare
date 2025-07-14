
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '@/hooks/useUser';
import { useInfluencerProfile } from '@/hooks/useInfluencerProfile';
import { useFanProfile } from '@/hooks/useFanProfile';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import FloatingHeader from '@/components/ui/floating-header';
import Navbar from '@/components/navigation/Navbar';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileBio from '@/components/profile/ProfileBio';
import SocialLinks from '@/components/profile/SocialLinks';
import FanProfile from '@/components/profile/FanProfile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, List, Star, User, AlertCircle } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";

export default function Profile() {
  const { id } = useParams<{ id: string }>();
  const { user } = useUser();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [navOpen, setNavOpen] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [userType, setUserType] = useState<string | null>(null);
  const [profileCheckError, setProfileCheckError] = useState<string | null>(null);

  // Determine the profile ID to load
  const profileId = id || user?.id;
  const isCurrentUserProfile = !id || id === user?.id;

  const { 
    influencer, 
    isLoading: influencerLoading, 
    error: influencerError 
  } = useInfluencerProfile(profileId || '');

  const { 
    fanProfile, 
    isLoading: fanLoading, 
    error: fanError 
  } = useFanProfile(profileId || '');

  useEffect(() => {
    const checkUserType = async () => {
      if (!profileId) {
        setProfileCheckError('No profile ID provided');
        return;
      }

      try {
        console.log('Checking user type for profile ID:', profileId);
        
        // Get user type from profiles table
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('user_type, name, email')
          .eq('id', profileId)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          setProfileCheckError(`Failed to load profile: ${error.message}`);
          return;
        }

        if (!profile) {
          setProfileCheckError('Profile not found');
          return;
        }

        console.log('Profile found:', profile);
        setUserType(profile.user_type);
        setProfileCheckError(null);
      } catch (error: any) {
        console.error('Error checking user type:', error);
        setProfileCheckError(`Error loading profile: ${error.message}`);
      }
    };

    if (profileId) {
      checkUserType();
    }
  }, [profileId]);

  useEffect(() => {
    if (!user && !profileLoaded) return;
    
    const handleProfileLoad = async () => {
      try {
        if (!profileId) {
          toast({
            title: "Profile Not Found",
            description: "Unable to load profile information",
            variant: "destructive"
          });
          navigate('/');
          return;
        }

        // For current user, check if they need to create a profile
        if (isCurrentUserProfile && user && userType) {
          if (userType === 'influencer' && !influencer && !influencerLoading && !influencerError) {
            console.log('Redirecting to create influencer profile');
            navigate('/create-influencer-profile');
            return;
          } else if (userType === 'fan' && !fanProfile && !fanLoading && !fanError) {
            console.log('Redirecting to create fan profile');
            navigate('/create-fan-profile');
            return;
          }
        }

        setProfileLoaded(true);
      } catch (error) {
        console.error('Error in profile loading:', error);
        toast({
          title: "Error",
          description: "Failed to load profile",
          variant: "destructive"
        });
      }
    };

    if (userType !== null && !profileCheckError) {
      handleProfileLoad();
    }
  }, [user, profileId, isCurrentUserProfile, influencer, influencerLoading, fanProfile, fanLoading, navigate, toast, profileLoaded, userType, influencerError, fanError, profileCheckError]);

  // Show loading state
  if (influencerLoading || fanLoading || !profileLoaded || userType === null) {
    return (
      <>
        <FloatingHeader setNavOpen={setNavOpen} />
        <Navbar isOpen={navOpen} setIsOpen={setNavOpen} />
        
        <div className="min-h-screen bg-background pt-20 p-4">
          <div className="max-w-4xl mx-auto space-y-6">
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-48 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>
        </div>
      </>
    );
  }

  // Handle error states
  if (profileCheckError || influencerError || fanError) {
    return (
      <>
        <FloatingHeader setNavOpen={setNavOpen} />
        <Navbar isOpen={navOpen} setIsOpen={setNavOpen} />
        
        <div className="min-h-screen bg-background pt-20 p-4 flex items-center justify-center">
          <div className="text-center max-w-md">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Error</h2>
            <p className="text-gray-600 mb-4">
              {profileCheckError || influencerError || fanError || "Unable to load profile information"}
            </p>
            <div className="space-x-2">
              <Button 
                onClick={() => window.location.reload()}
                variant="outline"
              >
                Try Again
              </Button>
              <Button 
                onClick={() => navigate('/')}
                className="bg-funky-purple hover:bg-funky-purple/90"
              >
                Go Home
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Show influencer profile if user type is influencer
  if (userType === 'influencer' && influencer) {
    return (
      <>
        <FloatingHeader setNavOpen={setNavOpen} />
        <Navbar isOpen={navOpen} setIsOpen={setNavOpen} />
        
        <div className="min-h-screen bg-background pt-20">
          <div className="max-w-4xl mx-auto p-4 space-y-6">
            <ProfileHeader 
              name={influencer.name}
              platform={influencer.platform}
              followers={influencer.followers}
              profileImage={influencer.profile_image || '/placeholder.svg'}
              onSendGift={async () => {}}
              profileId={influencer.id}
            />
            
            <ProfileBio 
              about={influencer.about || ''}
              hobbies={influencer.hobbies || []}
            />
            
            {/* Additional Profile Information */}
            <Card className="bg-white/80 backdrop-blur-sm border border-funky-purple/10">
              <CardHeader>
                <CardTitle className="text-lg bg-clip-text text-transparent bg-gradient-to-r from-funky-purple to-funky-pink">
                  Profile Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Platform</h4>
                    <Badge variant="secondary" className="bg-funky-purple/10 text-funky-purple">
                      {influencer.platform}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Followers</h4>
                    <p className="text-lg font-semibold text-funky-purple">
                      {influencer.followers.toLocaleString()}
                    </p>
                  </div>
                  {influencer.category && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Category</h4>
                      <Badge variant="outline" className="border-funky-pink/30 text-funky-pink">
                        {influencer.category}
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Size Preferences - Only show if available */}
                {influencer.size_preferences && (
                  <div className="mt-6">
                    <h4 className="font-medium text-gray-700 mb-3">Size Preferences</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {influencer.size_preferences.tshirt_size && (
                        <div className="p-2 bg-funky-purple/5 rounded-lg">
                          <p className="text-xs text-gray-600">T-Shirt</p>
                          <p className="font-medium">{influencer.size_preferences.tshirt_size}</p>
                        </div>
                      )}
                      {influencer.size_preferences.pants_waist && (
                        <div className="p-2 bg-funky-purple/5 rounded-lg">
                          <p className="text-xs text-gray-600">Pants Waist</p>
                          <p className="font-medium">{influencer.size_preferences.pants_waist}</p>
                        </div>
                      )}
                      {influencer.size_preferences.pants_length && (
                        <div className="p-2 bg-funky-purple/5 rounded-lg">
                          <p className="text-xs text-gray-600">Pants Length</p>
                          <p className="font-medium">{influencer.size_preferences.pants_length}</p>
                        </div>
                      )}
                      {influencer.size_preferences.shoe_size && (
                        <div className="p-2 bg-funky-purple/5 rounded-lg">
                          <p className="text-xs text-gray-600">Shoe Size</p>
                          <p className="font-medium">{influencer.size_preferences.shoe_size}</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Food Preferences */}
                    {influencer.size_preferences.food_preferences && influencer.size_preferences.food_preferences.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Food Preferences</p>
                        <div className="flex flex-wrap gap-2">
                          {influencer.size_preferences.food_preferences.map((pref, index) => (
                            <Badge key={index} variant="outline" className="border-funky-pink/30 text-funky-pink">
                              {pref}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <SocialLinks 
              instagramUrl={influencer.instagram_url}
              youtubeUrl={influencer.youtube_url}
              twitterUrl={influencer.twitter_url}
              facebookUrl={influencer.facebook_url}
            />

            {/* Wishlist Button - Only show for fans viewing other profiles */}
            {!isCurrentUserProfile && (
              <Card className="bg-white/80 backdrop-blur-sm border border-funky-purple/10">
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <div className="flex items-center justify-center gap-2 text-funky-purple">
                      <Heart className="h-5 w-5" />
                      <h3 className="text-lg font-semibold">Want to send a gift?</h3>
                    </div>
                    <p className="text-gray-600 max-w-md mx-auto">
                      Check out {influencer.name}'s wishlist to see what they'd love to receive from their fans!
                    </p>
                    <Button 
                      onClick={() => navigate(`/wishlist/${influencer.id}`)}
                      className="bg-gradient-to-r from-funky-purple to-funky-pink hover:from-funky-pink hover:to-funky-purple text-white"
                    >
                      <List className="h-4 w-4 mr-2" />
                      View Wishlist
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </>
    );
  }

  // Show fan profile if user type is fan
  if (userType === 'fan' && fanProfile) {
    return (
      <>
        <FloatingHeader setNavOpen={setNavOpen} />
        <Navbar isOpen={navOpen} setIsOpen={setNavOpen} />
        
        <div className="min-h-screen bg-background pt-20">
          <div className="max-w-4xl mx-auto p-4 space-y-6">
            <FanProfile 
              profile={fanProfile}
              isCurrentUserProfile={isCurrentUserProfile}
            />
          </div>
        </div>
      </>
    );
  }

  // Fallback - profile not found
  return (
    <>
      <FloatingHeader setNavOpen={setNavOpen} />
      <Navbar isOpen={navOpen} setIsOpen={setNavOpen} />
      
      <div className="min-h-screen bg-background pt-20 p-4 flex items-center justify-center">
        <div className="text-center">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h2>
          <p className="text-gray-600 mb-4">The requested profile could not be found or is incomplete</p>
          <Button 
            onClick={() => navigate('/')}
            className="bg-funky-purple hover:bg-funky-purple/90"
          >
            Go Home
          </Button>
        </div>
      </div>
    </>
  );
}
