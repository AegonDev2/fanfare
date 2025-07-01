
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '@/hooks/useUser';
import { useInfluencerProfile } from '@/hooks/useInfluencerProfile';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import FloatingHeader from '@/components/ui/floating-header';
import Navbar from '@/components/navigation/Navbar';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileBio from '@/components/profile/ProfileBio';
import SocialLinks from '@/components/profile/SocialLinks';
import FanProfile from '@/components/profile/FanProfile';

export default function Profile() {
  const { id } = useParams<{ id: string }>();
  const { user } = useUser();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [navOpen, setNavOpen] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);

  // Determine the profile ID to load
  const profileId = id || user?.id;
  const isCurrentUserProfile = !id || id === user?.id;

  const { 
    influencer, 
    isLoading: influencerLoading, 
    error: influencerError 
  } = useInfluencerProfile(profileId || '');

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

        if (isCurrentUserProfile && user && !influencer && !influencerLoading) {
          // Check if current user needs to create a profile
          const userType = user.user_metadata?.user_type;
          
          if (userType === 'influencer') {
            navigate('/create-influencer-profile');
            return;
          } else if (userType === 'fan') {
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

    handleProfileLoad();
  }, [user, profileId, isCurrentUserProfile, influencer, influencerLoading, navigate, toast, profileLoaded]);

  // Show loading state
  if (influencerLoading || !profileLoaded) {
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
  if (influencerError) {
    return (
      <>
        <FloatingHeader setNavOpen={setNavOpen} />
        <Navbar isOpen={navOpen} setIsOpen={setNavOpen} />
        
        <div className="min-h-screen bg-background pt-20 p-4 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Error</h2>
            <p className="text-gray-600 mb-4">Unable to load profile information</p>
            <button 
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-funky-purple text-white rounded-md hover:bg-funky-purple/90"
            >
              Go Home
            </button>
          </div>
        </div>
      </>
    );
  }

  // Show influencer profile if found
  if (influencer) {
    return (
      <>
        <FloatingHeader setNavOpen={setNavOpen} />
        <Navbar isOpen={navOpen} setIsOpen={setNavOpen} />
        
        <div className="min-h-screen bg-background pt-20">
          <div className="max-w-4xl mx-auto p-4 space-y-6">
            <ProfileHeader 
              profileId={influencer.id}
              isCurrentUserProfile={isCurrentUserProfile}
            />
            <ProfileBio profileId={influencer.id} />
            <SocialLinks profileId={influencer.id} />
          </div>
        </div>
      </>
    );
  }

  // Show fan profile or redirect to create profile
  if (isCurrentUserProfile && user) {
    const userType = user.user_metadata?.user_type;
    
    if (userType === 'fan') {
      return (
        <>
          <FloatingHeader setNavOpen={setNavOpen} />
          <Navbar isOpen={navOpen} setIsOpen={setNavOpen} />
          
          <div className="min-h-screen bg-background pt-20">
            <div className="max-w-4xl mx-auto p-4 space-y-6">
              <FanProfile userId={user.id} />
            </div>
          </div>
        </>
      );
    }
  }

  // Fallback - profile not found
  return (
    <>
      <FloatingHeader setNavOpen={setNavOpen} />
      <Navbar isOpen={navOpen} setIsOpen={setNavOpen} />
      
      <div className="min-h-screen bg-background pt-20 p-4 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h2>
          <p className="text-gray-600 mb-4">The requested profile could not be found</p>
          <button 
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-funky-purple text-white rounded-md hover:bg-funky-purple/90"
          >
            Go Home
          </button>
        </div>
      </div>
    </>
  );
}
