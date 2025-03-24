
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileBio from "@/components/profile/ProfileBio";
import SocialLinks from "@/components/profile/SocialLinks";
import Header from "@/components/landing/Header";

const isValidUUID = (uuid: string) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: influencer, isLoading, error } = useQuery({
    queryKey: ['influencer', id],
    queryFn: async () => {
      console.log("Fetching profile for ID:", id);
      
      if (!id || !isValidUUID(id)) {
        throw new Error("Invalid profile ID");
      }

      const { data, error } = await supabase
        .from('influencer_profiles')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }
      
      if (!data) {
        console.log("Influencer not found");
        throw new Error("Influencer not found");
      }
      
      console.log("Fetched influencer:", data);
      return data;
    },
    retry: false
  });

  // This function is no longer used directly, but kept for backward compatibility
  const handleSendGift = async (giftItem: string, giftMessage: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to send gifts",
        variant: "destructive"
      });
      navigate("/auth");
      return;
    }

    const { error } = await supabase
      .from('gifts_to_influencers')
      .insert({
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
      description: "Gift sent successfully!",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100">
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
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <div className="container mx-auto px-4 py-8 pt-20">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error instanceof Error ? error.message : "Failed to load influencer profile"}
          </div>
        </div>
      </div>
    );
  }

  if (!influencer) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <div className="container mx-auto px-4 py-8 pt-20">
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
            Influencer not found
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="container mx-auto px-4 py-8 pt-20">
        <section className="bg-white shadow-md rounded-lg p-6">
          <ProfileHeader
            name={influencer.name}
            platform={influencer.platform}
            followers={influencer.followers}
            profileImage={influencer.profile_image}
            onSendGift={handleSendGift}
            profileId={influencer.id}
          />
          
          <ProfileBio
            about={influencer.about || "No bio available."}
            hobbies={influencer.hobbies || []}
          />
          
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
