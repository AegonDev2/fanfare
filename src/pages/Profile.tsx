
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "@/hooks/useUser";
import { useInfluencerProfile } from "@/hooks/useInfluencerProfile";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import FloatingHeader from '@/components/ui/floating-header';
import Navbar from '@/components/navigation/Navbar';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileBio from '@/components/profile/ProfileBio';
import SocialLinks from '@/components/profile/SocialLinks';
import FanProfile from '@/components/profile/FanProfile';
import { Skeleton } from "@/components/ui/skeleton";

export default function Profile() {
  const { id } = useParams();
  const { user } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [navOpen, setNavOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const profileId = id || user?.id;
  const isCurrentUserProfile = profileId === user?.id;

  const { influencer, isLoading: influencerLoading } = useInfluencerProfile(profileId || '');

  useEffect(() => {
    const fetchProfile = async () => {
      if (!profileId) return;

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', profileId)
          .single();

        if (error) throw error;

        setUserProfile(profile);

        // If it's the current user and they don't have a profile, redirect to create profile
        if (isCurrentUserProfile && !profile) {
          navigate('/create-fan-profile');
          return;
        }

        // If profile doesn't exist and it's not current user, show error
        if (!profile) {
          toast({
            title: "Profile not found",
            description: "The requested profile does not exist.",
            variant: "destructive",
          });
          navigate('/home');
          return;
        }

        // Check if current user needs to create their profile based on user type
        if (isCurrentUserProfile && user) {
          if (profile.user_type === 'influencer' && !influencer) {
            navigate('/create-influencer-profile');
            return;
          }
          if (profile.user_type === 'fan') {
            // Fan profile exists in profiles table, no need for separate influencer profile
            return;
          }
        }

      } catch (error: any) {
        console.error('Error fetching profile:', error);
        toast({
          title: "Error",
          description: "Failed to load profile",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [profileId, user, navigate, toast, isCurrentUserProfile, influencer]);

  if (isLoading || influencerLoading) {
    return (
      <>
        <FloatingHeader setNavOpen={setNavOpen} />
        <Navbar isOpen={navOpen} setIsOpen={setNavOpen} />
        
        <div className="min-h-screen bg-background pt-20 p-4">
          <div className="max-w-4xl mx-auto space-y-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </>
    );
  }

  if (!userProfile) {
    return (
      <>
        <FloatingHeader setNavOpen={setNavOpen} />
        <Navbar isOpen={navOpen} setIsOpen={setNavOpen} />
        
        <div className="min-h-screen bg-background pt-20 p-4 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2">Profile not found</h2>
            <p className="text-gray-600">The requested profile does not exist.</p>
          </div>
        </div>
      </>
    );
  }

  // Show fan profile for fan users
  if (userProfile.user_type === 'fan') {
    return (
      <>
        <FloatingHeader setNavOpen={setNavOpen} />
        <Navbar isOpen={navOpen} setIsOpen={setNavOpen} />
        <FanProfile profile={userProfile} isCurrentUserProfile={isCurrentUserProfile} />
      </>
    );
  }

  // Show influencer profile for influencer users
  if (userProfile.user_type === 'influencer' && influencer) {
    return (
      <>
        <FloatingHeader setNavOpen={setNavOpen} />
        <Navbar isOpen={navOpen} setIsOpen={setNavOpen} />
        
        <div className="min-h-screen bg-gradient-to-br from-white to-gray-100 pb-24">
          <main className="container mx-auto px-4 py-6">
            <ProfileHeader influencer={influencer} isCurrentUserProfile={isCurrentUserProfile} />
            <ProfileBio influencer={influencer} />
            <SocialLinks influencer={influencer} />
          </main>
        </div>
      </>
    );
  }

  return (
    <>
      <FloatingHeader setNavOpen={setNavOpen} />
      <Navbar isOpen={navOpen} setIsOpen={setNavOpen} />
      
      <div className="min-h-screen bg-background pt-20 p-4 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Profile Incomplete</h2>
          <p className="text-gray-600">Please complete your profile setup.</p>
        </div>
      </div>
    </>
  );
}
