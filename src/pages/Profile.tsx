import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileBio from "@/components/profile/ProfileBio";
import SocialLinks from "@/components/profile/SocialLinks";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useUser } from "@/hooks/useUser";
import { Gift, Edit } from "lucide-react";
import { useInfluencerProfile } from "@/hooks/useInfluencerProfile";
import { motion } from "framer-motion";
const isValidUUID = (uuid: string) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};
const Profile = () => {
  const {
    id
  } = useParams();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const {
    user
  } = useUser();
  const isCurrentUserProfile = id ? user?.id === id : false;
  const profileId = id || user?.id;
  const {
    influencer,
    isLoading,
    error
  } = useInfluencerProfile(profileId);
  const foodPreferenceColors: Record<string, string> = {
    "Vegetarian": "green",
    "Vegan": "emerald",
    "Non-Vegetarian": "red",
    "Pescatarian": "blue",
    "Gluten-Free": "amber",
    "Dairy-Free": "indigo",
    "Keto": "purple",
    "Paleo": "orange"
  };

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
    return <div className="min-h-screen bg-gradient-to-br from-white to-gray-100">
        <div className="container mx-auto px-4 py-6">
          <div className="bg-white/90 backdrop-blur-sm shadow-md rounded-lg p-6 animate-pulse border border-funky-purple/10">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-32 h-32 rounded-full bg-funky-purple/20"></div>
              <div className="flex-1">
                <div className="h-8 w-48 bg-funky-purple/20 rounded mb-2"></div>
                <div className="h-4 w-32 bg-funky-purple/10 rounded mb-2"></div>
                <div className="h-4 w-40 bg-funky-purple/10 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>;
  }
  if (error) {
    return <div className="min-h-screen bg-gradient-to-br from-white to-gray-100">
        <div className="container mx-auto px-4 py-6">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error instanceof Error ? error.message : "Failed to load influencer profile"}
          </div>
        </div>
      </div>;
  }
  if (!influencer) {
    return <div className="min-h-screen bg-gradient-to-br from-white to-gray-100">
        <div className="container mx-auto px-4 py-6">
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
            Influencer not found
          </div>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gradient-to-br from-white to-gray-100 pb-24">
      <main className="container mx-auto px-4 py-6 bg-rose-100">
        <motion.section className="shadow-md p-6 mb-8 rounded-3xl bg-white/80 backdrop-blur-sm border border-funky-purple/10" initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.5
      }}>
          <ProfileHeader name={influencer.name} platform={influencer.platform} followers={influencer.followers} profileImage={influencer.profile_image} onSendGift={handleSendGift} profileId={influencer.id} />
          
          <div className="flex flex-wrap gap-4 mt-6 mb-8">
            {isCurrentUserProfile && <Button onClick={() => navigate('/edit-profile')} variant="outline" size="sm" className="flex items-center gap-2 border-funky-purple/20 hover:bg-funky-purple/10 text-funky-purple">
                <Edit size={16} /> Edit Profile
              </Button>}
            
            {influencer.id && <Button onClick={() => navigate(`/wishlist/${influencer.id}`)} variant="default" size="sm" className="flex items-center gap-2 bg-gradient-to-r from-funky-purple to-funky-pink hover:from-funky-pink hover:to-funky-purple">
                <Gift size={16} />
                {isCurrentUserProfile ? "Manage Wishlist" : "View Wishlist"}
              </Button>}
          </div>
          
          <ProfileBio about={influencer.about || "No bio available."} hobbies={influencer.hobbies || []} />
          
          {/* Size & Preferences Section */}
          {(influencer.size_preferences || isCurrentUserProfile) && <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.5,
          delay: 0.2
        }}>
              <Card className="p-6 mt-8 bg-white/90 backdrop-blur-sm shadow-md border border-funky-purple/10">
                <h3 className="text-lg font-medium mb-4 bg-clip-text text-transparent bg-gradient-to-r from-funky-purple to-funky-pink">Size & Preferences</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {influencer.size_preferences?.tshirt_size && <div className="p-3 rounded-lg bg-funky-purple/5 border border-funky-purple/10">
                      <p className="text-xs text-gray-500 mb-1">T-shirt Size</p>
                      <p className="font-medium text-funky-purple">{influencer.size_preferences.tshirt_size}</p>
                    </div>}
                  
                  {influencer.size_preferences?.pants_waist && <div className="p-3 rounded-lg bg-funky-pink/5 border border-funky-pink/10">
                      <p className="text-xs text-gray-500 mb-1">Pants Waist</p>
                      <p className="font-medium text-funky-pink">{influencer.size_preferences.pants_waist}</p>
                    </div>}
                  
                  {influencer.size_preferences?.pants_length && <div className="p-3 rounded-lg bg-funky-blue/5 border border-funky-blue/10">
                      <p className="text-xs text-gray-500 mb-1">Pants Length</p>
                      <p className="font-medium text-funky-blue">{influencer.size_preferences.pants_length}</p>
                    </div>}
                  
                  {influencer.size_preferences?.shoe_size && <div className="p-3 rounded-lg bg-funky-orange/5 border border-funky-orange/10">
                      <p className="text-xs text-gray-500 mb-1">Shoe Size</p>
                      <p className="font-medium text-funky-orange">{influencer.size_preferences.shoe_size}</p>
                    </div>}
                </div>
                
                {influencer.size_preferences?.food_preferences && influencer.size_preferences.food_preferences.length > 0 && <div className="mt-6">
                    <p className="text-xs text-gray-500 mb-2">Food Preferences</p>
                    <div className="flex flex-wrap gap-2">
                      {influencer.size_preferences.food_preferences.map((pref, index) => {
                  const prefColor = foodPreferenceColors[pref] || "gray";
                  return <span key={index} className={`bg-${prefColor}-100 text-${prefColor}-800 text-xs px-3 py-1 rounded-full border border-${prefColor}-200`}>
                            {pref}
                          </span>;
                })}
                    </div>
                  </div>}
                
                {isCurrentUserProfile && !influencer.size_preferences && <div className="text-center py-4 bg-funky-purple/5 rounded-lg border border-funky-purple/10">
                    <p className="text-sm text-gray-600 mb-3">You haven't added size & preference information yet</p>
                    <Button onClick={() => navigate('/edit-profile')} variant="default" size="sm" className="bg-gradient-to-r from-funky-purple to-funky-pink hover:from-funky-pink hover:to-funky-purple">
                      Add Sizes & Preferences
                    </Button>
                  </div>}
              </Card>
            </motion.div>}
          
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.5,
          delay: 0.3
        }} className="mt-8">
            <SocialLinks youtubeUrl={influencer.youtube_url} instagramUrl={influencer.instagram_url} twitterUrl={influencer.twitter_url} facebookUrl={influencer.facebook_url} />
          </motion.div>
        </motion.section>
      </main>
    </div>;
};
export default Profile;