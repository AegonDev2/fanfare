
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Youtube, Instagram, Twitter, Facebook, Gift } from "lucide-react";

const isValidUUID = (uuid: string) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [giftMessage, setGiftMessage] = useState("");
  const [giftItem, setGiftItem] = useState("");

  const { data: influencer, isLoading, error } = useQuery({
    queryKey: ['influencer', id],
    queryFn: async () => {
      if (!id || !isValidUUID(id)) {
        throw new Error("Invalid profile ID");
      }

      const { data, error } = await supabase
        .from('influencer_profiles')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (error) throw error;
      if (!data) throw new Error("Influencer not found");
      return data;
    },
    retry: false
  });

  const handleSendGift = async () => {
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
    setGiftMessage("");
    setGiftItem("");
  };

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error instanceof Error ? error.message : "Failed to load influencer profile"}
        </div>
      </div>
    );
  }

  if (!influencer) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
          Influencer not found
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="container mx-auto px-4 py-8">
        <section className="bg-white shadow-md rounded-lg p-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <img
              src={influencer.profile_image}
              alt={`${influencer.name}'s profile picture`}
              className="w-32 h-32 rounded-full object-cover"
            />
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-800">{influencer.name}</h2>
                  <p className="text-gray-600">Platform: {influencer.platform}</p>
                  <p className="text-gray-600">Followers: {influencer.followers.toLocaleString()}</p>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2">
                      <Gift className="h-4 w-4" />
                      Send Gift
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Send a Gift to {influencer.name}</DialogTitle>
                      <DialogDescription>
                        Choose a gift and add a personal message
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <Input
                        placeholder="Gift item"
                        value={giftItem}
                        onChange={(e) => setGiftItem(e.target.value)}
                      />
                      <Textarea
                        placeholder="Add a personal message..."
                        value={giftMessage}
                        onChange={(e) => setGiftMessage(e.target.value)}
                      />
                    </div>
                    <DialogFooter>
                      <Button onClick={handleSendGift}>Send Gift</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              
              <p className="text-gray-600 my-4">{influencer.about}</p>
              
              <div className="mb-4">
                <p className="text-gray-600">Hobbies:</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {influencer.hobbies?.map((hobby, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                    >
                      {hobby}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-4">
                {influencer.youtube_url && (
                  <a
                    href={influencer.youtube_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-red-600 transition-colors"
                  >
                    <Youtube size={24} />
                  </a>
                )}
                {influencer.instagram_url && (
                  <a
                    href={influencer.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-pink-600 transition-colors"
                  >
                    <Instagram size={24} />
                  </a>
                )}
                {influencer.twitter_url && (
                  <a
                    href={influancer.twitter_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-blue-400 transition-colors"
                  >
                    <Twitter size={24} />
                  </a>
                )}
                {influencer.facebook_url && (
                  <a
                    href={influencer.facebook_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <Facebook size={24} />
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Profile;
