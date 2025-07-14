
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/hooks/useUser";
import FloatingHeader from '@/components/ui/floating-header';
import Navbar from '@/components/navigation/Navbar';
import { ArrowLeft, Star, Camera } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface FormState {
  name: string;
  bio: string;
}

export default function CreateFanProfile() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { toast } = useToast();
  const [navOpen, setNavOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<FormState>({
    name: "",
    bio: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('profile_images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile_images')
        .getPublicUrl(filePath);

      setProfileImageUrl(publicUrl);
      toast({
        title: "Image uploaded",
        description: "Profile picture uploaded successfully.",
      });
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload image.",
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Not authenticated",
        description: "You must be logged in to create a profile.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your name to create your fan profile.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Update profile data in profiles table
      const profileData = {
        id: user.id,
        email: user.email || '',
        name: formData.name.trim(),
        user_type: 'fan'
      };

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(profileData, { onConflict: 'id' });

      if (profileError) {
        throw profileError;
      }

      // Create fan profile
      const fanProfileData = {
        user_id: user.id,
        bio: formData.bio.trim() || null,
        profile_image_url: profileImageUrl || null,
        total_gifts_sent: 0,
        total_amount_spent: 0
      };

      const { error: fanProfileError } = await supabase
        .from('fan_profiles')
        .upsert(fanProfileData, { onConflict: 'user_id' });

      if (fanProfileError) {
        throw fanProfileError;
      }

      toast({
        title: "Profile created",
        description: "Your fan profile has been created successfully.",
      });
      navigate(`/profile/${user.id}`);

    } catch (error: any) {
      console.error("Error creating fan profile:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create profile.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FloatingHeader setNavOpen={setNavOpen} />
      <Navbar isOpen={navOpen} setIsOpen={setNavOpen} />
      
      <div className="min-h-screen bg-background pt-20 p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="text-funky-purple hover:bg-funky-purple/10"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-funky-purple to-funky-pink bg-clip-text text-transparent">
              Create Fan Profile
            </h1>
          </div>

          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-funky-purple/10 rounded-full flex items-center justify-center mb-4">
                <Star className="h-8 w-8 text-funky-purple" />
              </div>
              <CardTitle className="text-2xl">Welcome, Fan!</CardTitle>
              <p className="text-gray-600">
                Create your fan profile to start sending gifts to your favorite influencers
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Profile Picture Upload */}
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <Avatar className="w-24 h-24 border-4 border-funky-purple/20">
                      <AvatarImage 
                        src={profileImageUrl} 
                        alt="Profile picture preview" 
                      />
                      <AvatarFallback className="bg-gradient-to-r from-funky-purple to-funky-pink text-white font-semibold text-xl">
                        {formData.name ? formData.name.slice(0, 2).toUpperCase() : (user?.email.slice(0, 2).toUpperCase() || "FN")}
                      </AvatarFallback>
                    </Avatar>
                    
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0 bg-white shadow-lg border-2 border-funky-purple/20 hover:bg-funky-purple/10"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage}
                    >
                      <Camera className="h-4 w-4 text-funky-purple" />
                    </Button>
                  </div>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  
                  <p className="text-sm text-gray-500 text-center">
                    {uploadingImage ? "Uploading..." : "Click the camera icon to upload a profile picture"}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Your Name *</Label>
                  <Input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio (Optional)</Label>
                  <textarea
                    id="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Tell us a bit about yourself..."
                    className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-funky-purple focus:border-transparent resize-none"
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={loading || uploadingImage} 
                  className="w-full bg-gradient-to-r from-funky-purple to-funky-pink hover:from-funky-pink hover:to-funky-purple"
                >
                  {loading ? "Creating Profile..." : "Create Fan Profile"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
