
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import Header from "@/components/landing/Header";

const CreateInfluencerProfile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    platform: "",
    followers: 0,
    about: "",
    profile_image: "",
    youtube_url: "",
    instagram_url: "",
    twitter_url: "",
    facebook_url: "",
    hobbies: [] as string[],
    newHobby: ""
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("user_type")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        toast({
          title: "Error",
          description: "Failed to verify user type",
          variant: "destructive"
        });
        navigate("/");
        return;
      }

      if (!profile || profile.user_type !== "influencer") {
        toast({
          title: "Access Denied",
          description: "Only influencers can create profiles",
          variant: "destructive"
        });
        navigate("/");
        return;
      }

      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from("influencer_profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (existingProfile) {
        setFormData({
          ...existingProfile,
          newHobby: "",
          hobbies: existingProfile.hobbies || []
        });
      }
    } catch (error) {
      console.error("Error in checkAuth:", error);
      toast({
        title: "Error",
        description: "An error occurred while checking authentication",
        variant: "destructive"
      });
      navigate("/");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Not authenticated");
      }

      const { error } = await supabase
        .from("influencer_profiles")
        .upsert({
          id: user.id,
          name: formData.name,
          platform: formData.platform,
          followers: formData.followers,
          about: formData.about,
          profile_image: formData.profile_image,
          youtube_url: formData.youtube_url || null,
          instagram_url: formData.instagram_url || null,
          twitter_url: formData.twitter_url || null,
          facebook_url: formData.facebook_url || null,
          hobbies: formData.hobbies
        });

      if (error) {
        console.error("Error creating profile:", error);
        throw error;
      }

      toast({
        title: "Success",
        description: "Your profile has been saved!"
      });
      
      navigate(`/profile/${user.id}`);
    } catch (error: any) {
      console.error("Error in handleSubmit:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save profile",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addHobby = () => {
    if (formData.newHobby.trim() && !formData.hobbies.includes(formData.newHobby.trim())) {
      setFormData(prev => ({
        ...prev,
        hobbies: [...prev.hobbies, prev.newHobby.trim()],
        newHobby: ""
      }));
    }
  };

  const removeHobby = (hobby: string) => {
    setFormData(prev => ({
      ...prev,
      hobbies: prev.hobbies.filter(h => h !== hobby)
    }));
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header setNavOpen={() => {}} />
      <div className="container mx-auto px-4 py-8 pt-20">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-6">Create Your Influencer Profile</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="platform">Platform *</Label>
              <Input
                id="platform"
                value={formData.platform}
                onChange={e => setFormData(prev => ({ ...prev, platform: e.target.value }))}
                required
                placeholder="e.g., YouTube, Instagram, TikTok"
              />
            </div>

            <div>
              <Label htmlFor="followers">Followers *</Label>
              <Input
                id="followers"
                type="number"
                value={formData.followers}
                onChange={e => setFormData(prev => ({ ...prev, followers: parseInt(e.target.value) || 0 }))}
                required
                min="0"
              />
            </div>

            <div>
              <Label htmlFor="about">About</Label>
              <Textarea
                id="about"
                value={formData.about || ""}
                onChange={e => setFormData(prev => ({ ...prev, about: e.target.value }))}
                placeholder="Tell us about yourself..."
              />
            </div>

            <div>
              <Label htmlFor="profile_image">Profile Image URL</Label>
              <Input
                id="profile_image"
                value={formData.profile_image || ""}
                onChange={e => setFormData(prev => ({ ...prev, profile_image: e.target.value }))}
                placeholder="https://..."
              />
            </div>

            <div>
              <Label>Social Media Links</Label>
              <div className="space-y-4">
                <Input
                  placeholder="YouTube URL"
                  value={formData.youtube_url || ""}
                  onChange={e => setFormData(prev => ({ ...prev, youtube_url: e.target.value }))}
                />
                <Input
                  placeholder="Instagram URL"
                  value={formData.instagram_url || ""}
                  onChange={e => setFormData(prev => ({ ...prev, instagram_url: e.target.value }))}
                />
                <Input
                  placeholder="Twitter URL"
                  value={formData.twitter_url || ""}
                  onChange={e => setFormData(prev => ({ ...prev, twitter_url: e.target.value }))}
                />
                <Input
                  placeholder="Facebook URL"
                  value={formData.facebook_url || ""}
                  onChange={e => setFormData(prev => ({ ...prev, facebook_url: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label>Hobbies</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={formData.newHobby}
                  onChange={e => setFormData(prev => ({ ...prev, newHobby: e.target.value }))}
                  placeholder="Add a hobby"
                />
                <Button type="button" onClick={addHobby}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.hobbies.map((hobby, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                  >
                    {hobby}
                    <button
                      type="button"
                      onClick={() => removeHobby(hobby)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Saving..." : "Save Profile"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateInfluencerProfile;
