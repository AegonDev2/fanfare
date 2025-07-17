import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/hooks/useUser";
import { useFanProfile } from "@/hooks/useFanProfile";
import { ArrowLeft, Star, Camera, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface FanEditFormData {
  profile_name: string;
  bio: string;
}

export default function FanEditProfile() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { toast } = useToast();
  const { fanProfile, refetch } = useFanProfile(user?.id || '');
  
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<FanEditFormData>({
    profile_name: "",
    bio: "",
  });

  useEffect(() => {
    if (fanProfile) {
      setFormData({
        profile_name: fanProfile.profile_name || "",
        bio: fanProfile.bio || "",
      });
      setProfileImageUrl(fanProfile.profile_image_url || "");
    }
  }, [fanProfile]);

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
      // Delete existing image first
      const { data: existingFiles } = await supabase.storage
        .from('profile_images')
        .list(`${user.id}/`);
      
      if (existingFiles && existingFiles.length > 0) {
        await supabase.storage
          .from('profile_images')
          .remove([`${user.id}/${existingFiles[0].name}`]);
      }

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
        description: "You must be logged in to update your profile.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Update fan profile
      const fanProfileData = {
        user_id: user.id,
        profile_name: formData.profile_name.trim() || null,
        bio: formData.bio.trim() || null,
        profile_image_url: profileImageUrl || null,
      };

      const { error: fanProfileError } = await supabase
        .from('fan_profiles')
        .upsert(fanProfileData, { onConflict: 'user_id' });

      if (fanProfileError) {
        throw fanProfileError;
      }

      toast({
        title: "Profile updated",
        description: "Your fan profile has been updated successfully.",
      });

      // Refresh profile data and navigate back
      await refetch();
      navigate(`/profile/${user.id}`);

    } catch (error: any) {
      console.error("Error updating fan profile:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const displayName = fanProfile?.profile_name || fanProfile?.name || 'Fan';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/profile/${user?.id}`)}
          className="text-funky-purple hover:bg-funky-purple/10"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Profile
        </Button>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-funky-purple to-funky-pink bg-clip-text text-transparent">
          Edit Fan Profile
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Picture Upload */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="w-24 h-24 border-4 border-funky-purple/20">
                  <AvatarImage 
                    src={profileImageUrl} 
                    alt="Profile picture preview" 
                  />
                  <AvatarFallback className="bg-gradient-to-r from-funky-purple to-funky-pink text-white font-semibold text-xl">
                    {displayName.slice(0, 2).toUpperCase()}
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
                {uploadingImage ? "Uploading..." : "Click the camera icon to change your profile picture"}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile_name">Profile Name</Label>
              <Input
                type="text"
                id="profile_name"
                value={formData.profile_name}
                onChange={handleChange}
                placeholder="Enter your display name"
              />
              <p className="text-sm text-gray-500">
                This is how you'll appear to other users. Leave empty to use your account name.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell us a bit about yourself..."
                rows={4}
              />
              <p className="text-sm text-gray-500">
                Share something about yourself with the community.
              </p>
            </div>

            <Button 
              type="submit" 
              disabled={loading || uploadingImage} 
              className="w-full bg-gradient-to-r from-funky-purple to-funky-pink hover:from-funky-pink hover:to-funky-purple"
            >
              {loading ? "Updating Profile..." : "Update Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}