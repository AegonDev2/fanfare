import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileBio from "@/components/profile/ProfileBio";
import SocialLinks from "@/components/profile/SocialLinks";
import Header from "@/components/landing/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useUser } from "@/hooks/useUser";
import { Gift, Edit } from "lucide-react";
import { useInfluencerProfile } from "@/hooks/useInfluencerProfile";

const isValidUUID = (uuid: string) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useUser();
  
  const isCurrentUserProfile = id ? user?.id === id : false;
  const profileId = id || user?.id;
  
  const {
    influencer,
    isLoading,
    error
  } = useInfluencerProfile(profileId);

  // This function is no longer used directly, but kept for backward compatibility
  const handleSendGift = async (giftItem: string, giftMessage: string) => {
    const {
      data: {
        user
      }
    } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to send gifts",
        variant: "destructive"
      });
      navigate("/auth");
      return;
    }
    const {
      error
    } = await supabase.from('gifts_to_influencers').insert({
      influencer_id: id,
      sender_id: user.id,
      gift_item: giftItem,
      message: giftMessage
    });
    if (error) {
      toast({
        title: "Error",
        description: "Failed to send gift. Please try again.",
        variant: "destructive"
      });
      return;
    }
    toast({
      title: "Success",
      description: "Gift sent successfully!"
    });
  };
  
  if (isLoading) {
    return <div className="min-h-screen bg-gray-100">
        <Header />
        <div className="container mx-auto px-4 py-8 pt-20">
          <div className="bg-white shadow-md rounded-lg p-6 animate-pulse">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-32 h-32 rounded-full bg-gray-200"></div>
              <div className="flex-1">
                <div className="h-8 w-48 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 w-40 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>;
  }
  
  if (error) {
    return <div className="min-h-screen bg-gray-100">
        <Header />
        <div className="container mx-auto px-4 py-8 pt-20">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error instanceof Error ? error.message : "Failed to load influencer profile"}
          </div>
        </div>
      </div>;
  }
  
  if (!influencer) {
    return <div className="min-h-screen bg-gray-100">
        <Header />
        <div className="container mx-auto px-4 py-8 pt-20">
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
            Influencer not found
          </div>
        </div>
      </div>;
  }
  
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="container mx-auto px-4 py-8 pt-20">
        <section className="shadow-md p-6 mb-6 rounded-3xl bg-neutral-300">
          <ProfileHeader 
            name={influencer.name} 
            platform={influencer.platform} 
            followers={influencer.followers} 
            profileImage={influencer.profile_image} 
            onSendGift={handleSendGift}
            profileId={influencer.id} 
          />
          
          <div className="flex flex-wrap gap-4 mt-4 mb-6">
            {isCurrentUserProfile && (
              <Button onClick={() => navigate('/edit-profile')} variant="outline" size="sm" className="flex items-center gap-2">
                <Edit size={16} /> Edit Profile
              </Button>
            )}
            
            {influencer.id && (
              <Button 
                onClick={() => navigate(`/wishlist/${influencer.id}`)}
                variant="secondary" 
                size="sm"
                className="flex items-center gap-2"
              >
                <Gift size={16} />
                {isCurrentUserProfile ? "Manage Wishlist" : "View Wishlist"}
              </Button>
            )}
          </div>
          
          <ProfileBio about={influencer.about || "No bio available."} hobbies={influencer.hobbies || []} />
          
          {/* Size & Preferences Section */}
          {(influencer.size_preferences || isCurrentUserProfile) && (
            <Card className="p-4 mt-6 bg-white">
              <h3 className="text-lg font-medium mb-2">Size & Preferences</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {influencer.size_preferences?.tshirt_size && (
                  <div>
                    <p className="text-xs text-gray-500">T-shirt Size</p>
                    <p className="font-medium">{influencer.size_preferences.tshirt_size}</p>
                  </div>
                )}
                
                {influencer.size_preferences?.pants_waist && (
                  <div>
                    <p className="text-xs text-gray-500">Pants Waist</p>
                    <p className="font-medium">{influencer.size_preferences.pants_waist}</p>
                  </div>
                )}
                
                {influencer.size_preferences?.pants_length && (
                  <div>
                    <p className="text-xs text-gray-500">Pants Length</p>
                    <p className="font-medium">{influencer.size_preferences.pants_length}</p>
                  </div>
                )}
                
                {influencer.size_preferences?.shoe_size && (
                  <div>
                    <p className="text-xs text-gray-500">Shoe Size</p>
                    <p className="font-medium">{influencer.size_preferences.shoe_size}</p>
                  </div>
                )}
              </div>
              
              {influencer.size_preferences?.food_preferences && influencer.size_preferences.food_preferences.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs text-gray-500 mb-1">Food Preferences</p>
                  <div className="flex flex-wrap gap-2">
                    {influencer.size_preferences.food_preferences.map((pref, index) => (
                      <span key={index} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                        {pref}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {isCurrentUserProfile && !influencer.size_preferences && (
                <div className="text-center py-2">
                  <p className="text-sm text-gray-500 mb-2">You haven't added size & preference information yet</p>
                  <Button 
                    onClick={() => navigate('/edit-profile')} 
                    variant="outline" 
                    size="sm"
                  >
                    Add Sizes & Preferences
                  </Button>
                </div>
              )}
            </Card>
          )}
          
          <SocialLinks 
            youtubeUrl={influencer.youtube_url} 
            instagramUrl={influencer.instagram_url} 
            twitterUrl={influencer.twitter_url} 
            facebookUrl={influencer.facebook_url} 
          />
        </section>
      </main>
    </div>
  );
};

export default Profile;
