
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
import { Heart, List, Star, User, AlertCircle, Instagram, Youtube, Twitter, Facebook } from 'lucide-react';
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

  // Helper function to safely convert error to string
  const getErrorMessage = (error: unknown): string => {
    if (!error) return '';
    
    if (typeof error === 'string') return error;
    
    if (error && typeof error === 'object') {
      // Handle Supabase error objects
      if ('message' in error && typeof error.message === 'string') {
        return error.message;
      }
      // Handle other error objects
      if ('toString' in error && typeof error.toString === 'function') {
        return error.toString();
      }
      // Fallback for any object
      return JSON.stringify(error);
    }
    
    return 'Unknown error occurred';
  };

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
          .maybeSingle();

        if (error) {
          console.error('Error fetching profile:', error);
          setProfileCheckError(`Failed to load profile: ${getErrorMessage(error)}`);
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
        setProfileCheckError(`Error loading profile: ${getErrorMessage(error)}`);
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
  const errorMessage = profileCheckError || getErrorMessage(influencerError) || getErrorMessage(fanError);
  
  if (errorMessage) {
    return (
      <>
        <FloatingHeader setNavOpen={setNavOpen} />
        <Navbar isOpen={navOpen} setIsOpen={setNavOpen} />
        
        <div className="min-h-screen bg-background pt-20 p-4 flex items-center justify-center">
          <div className="text-center max-w-md">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Error</h2>
            <p className="text-gray-600 mb-4">
              {errorMessage || "Unable to load profile information"}
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
        
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/5 pt-20">
          <div className="max-w-7xl mx-auto px-6 py-8">
            {/* Main Profile Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column - Profile Image & Main Info */}
              <div className="lg:col-span-1">
                <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-white/20 h-fit">
                  {/* Profile Image */}
                  <div className="relative group mb-6">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-all duration-500 scale-110"></div>
                    <img 
                      src={influencer.profile_image || '/placeholder.svg'} 
                      alt={`${influencer.name}'s profile`}
                      className="relative w-48 h-48 mx-auto rounded-full object-cover shadow-2xl border-4 border-white/80 transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>

                  {/* Name & Basic Info */}
                  <div className="text-center space-y-4">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      {influencer.name}
                    </h1>
                    
                    <div className="flex flex-wrap justify-center gap-2">
                      <Badge variant="outline" className="px-3 py-1 border-primary/30 text-primary">
                        {influencer.platform}
                      </Badge>
                      {influencer.category && (
                        <Badge variant="secondary" className="px-3 py-1">
                          {influencer.category}
                        </Badge>
                      )}
                    </div>

                    {/* Followers Count */}
                    <div className="bg-primary/5 rounded-xl p-4">
                      <p className="text-muted-foreground text-sm mb-1">Followers</p>
                      <p className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        {influencer.followers.toLocaleString()}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                      {!isCurrentUserProfile ? (
                        <>
                          <Button 
                            size="lg"
                            className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white"
                            onClick={() => navigate(`/place-order?influencer=${influencer.id}`)}
                          >
                            <Heart className="h-4 w-4 mr-2" />
                            Send Gift
                          </Button>
                          <Button 
                            variant="outline"
                            size="lg"
                            className="w-full border-secondary/30 text-secondary hover:bg-secondary/10"
                            onClick={() => navigate(`/wishlist/${influencer.id}`)}
                          >
                            <List className="h-4 w-4 mr-2" />
                            View Wishlist
                          </Button>
                        </>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="lg"
                          className="w-full border-primary/30 text-primary hover:bg-primary/10"
                          onClick={() => navigate('/edit-profile')}
                        >
                          <User className="h-4 w-4 mr-2" />
                          Edit Profile
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Middle & Right Columns - Content */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* About & Hobbies Row */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {/* About */}
                  {influencer.about && (
                    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                      <h3 className="text-xl font-bold text-foreground mb-4 flex items-center">
                        <Star className="h-5 w-5 mr-2 text-primary" />
                        About
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {influencer.about}
                      </p>
                    </div>
                  )}

                  {/* Hobbies & Interests */}
                  {influencer.hobbies && influencer.hobbies.length > 0 && (
                    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                      <h3 className="text-xl font-bold text-foreground mb-4">Interests</h3>
                      <div className="flex flex-wrap gap-2">
                        {influencer.hobbies.map((hobby, index) => (
                          <Badge 
                            key={index} 
                            variant="secondary" 
                            className="px-3 py-1 rounded-full bg-primary/10 text-primary border-primary/20"
                          >
                            {hobby}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Size Preferences & Social Links Row */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  
                  {/* Size Preferences */}
                  {influencer.size_preferences && (
                    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                      <h3 className="text-xl font-bold text-foreground mb-4">Size Preferences</h3>
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        {influencer.size_preferences.tshirt_size && (
                          <div className="bg-primary/5 rounded-lg p-3 text-center">
                            <p className="text-xs text-muted-foreground mb-1">T-Shirt</p>
                            <p className="font-semibold text-primary">{influencer.size_preferences.tshirt_size}</p>
                          </div>
                        )}
                        {influencer.size_preferences.pants_waist && (
                          <div className="bg-primary/5 rounded-lg p-3 text-center">
                            <p className="text-xs text-muted-foreground mb-1">Waist</p>
                            <p className="font-semibold text-primary">{influencer.size_preferences.pants_waist}</p>
                          </div>
                        )}
                        {influencer.size_preferences.pants_length && (
                          <div className="bg-primary/5 rounded-lg p-3 text-center">
                            <p className="text-xs text-muted-foreground mb-1">Length</p>
                            <p className="font-semibold text-primary">{influencer.size_preferences.pants_length}</p>
                          </div>
                        )}
                        {influencer.size_preferences.shoe_size && (
                          <div className="bg-primary/5 rounded-lg p-3 text-center">
                            <p className="text-xs text-muted-foreground mb-1">Shoe</p>
                            <p className="font-semibold text-primary">{influencer.size_preferences.shoe_size}</p>
                          </div>
                        )}
                      </div>
                      
                      {/* Food Preferences */}
                      {influencer.size_preferences.food_preferences && influencer.size_preferences.food_preferences.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-foreground mb-2">Food Preferences</h4>
                          <div className="flex flex-wrap gap-2">
                            {influencer.size_preferences.food_preferences.map((pref, index) => (
                              <Badge 
                                key={index} 
                                variant="outline" 
                                className="border-secondary/30 text-secondary px-2 py-1 text-xs"
                              >
                                {pref}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Social Links */}
                  {(influencer.instagram_url || influencer.youtube_url || influencer.twitter_url || influencer.facebook_url) && (
                    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                      <h3 className="text-xl font-bold text-foreground mb-4">Connect</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {influencer.instagram_url && (
                          <a
                            href={influencer.instagram_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-4 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl text-sm"
                          >
                            <Instagram className="h-4 w-4" />
                            <span className="font-medium">Instagram</span>
                          </a>
                        )}
                        {influencer.youtube_url && (
                          <a
                            href={influencer.youtube_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl text-sm"
                          >
                            <Youtube className="h-4 w-4" />
                            <span className="font-medium">YouTube</span>
                          </a>
                        )}
                        {influencer.twitter_url && (
                          <a
                            href={influencer.twitter_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white px-4 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl text-sm"
                          >
                            <Twitter className="h-4 w-4" />
                            <span className="font-medium">Twitter</span>
                          </a>
                        )}
                        {influencer.facebook_url && (
                          <a
                            href={influencer.facebook_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl text-sm"
                          >
                            <Facebook className="h-4 w-4" />
                            <span className="font-medium">Facebook</span>
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
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
