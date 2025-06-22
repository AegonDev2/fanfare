import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/hooks/useUser";
import FloatingHeader from '@/components/ui/floating-header';
import Navbar from '@/components/navigation/Navbar';
import { ArrowLeft } from "lucide-react";

interface FormState {
  name: string;
  bio: string;
  instagram_url: string;
  youtube_url: string;
  website_url: string;
  street_address: string;
  city: string;
  state: string;
  postal_code: string;
  phone: string;
}

export default function CreateInfluencerProfile() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { toast } = useToast();
  const [navOpen, setNavOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormState>({
    name: "",
    bio: "",
    instagram_url: "",
    youtube_url: "",
    website_url: "",
    street_address: "",
    city: "",
    state: "",
    postal_code: "",
    phone: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
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

    setLoading(true);

    try {
      // Basic profile data with required email field
      const profileData = {
        id: user.id,
        email: user.email || '', // Add required email field
        name: formData.name,
        user_type: 'influencer'
        // Remove fields that don't exist in the profiles table
      };

      // Insert or update profile data
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(profileData, { onConflict: 'id' });

      if (profileError) {
        throw profileError;
      }

      // Create address record
      const addressData = {
        influencer_id: profileData.id,
        name: profileData.name,
        street_address: formData.street_address || 'Not provided',
        city: formData.city || 'Not provided',
        state: formData.state || 'Not provided',
        postal_code: formData.postal_code || '000000',
        country: 'India',
        phone: formData.phone || '0000000000'
      };

      // Insert address data
      const { error: addressError } = await supabase
        .from('influencer_addresses')
        .insert([addressData]);

      if (addressError) {
        throw addressError;
      }

      toast({
        title: "Profile created",
        description: "Your influencer profile has been created successfully.",
      });
      navigate(`/profile/${user.id}`);

    } catch (error: any) {
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
        <div className="max-w-3xl mx-auto space-y-6">
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
              Create Influencer Profile
            </h1>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Display Name</Label>
                  <Input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your display name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Write a short bio about yourself"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Social Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="instagram_url">Instagram URL</Label>
                  <Input
                    type="url"
                    id="instagram_url"
                    value={formData.instagram_url}
                    onChange={handleChange}
                    placeholder="Enter your Instagram URL"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="youtube_url">YouTube URL</Label>
                  <Input
                    type="url"
                    id="youtube_url"
                    value={formData.youtube_url}
                    onChange={handleChange}
                    placeholder="Enter your YouTube URL"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="website_url">Website URL</Label>
                <Input
                  type="url"
                  id="website_url"
                  value={formData.website_url}
                  onChange={handleChange}
                  placeholder="Enter your Website URL"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Address Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="street_address">Street Address</Label>
                  <Input
                    type="text"
                    id="street_address"
                    value={formData.street_address}
                    onChange={handleChange}
                    placeholder="Enter your street address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    type="text"
                    id="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Enter your city"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    type="text"
                    id="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="Enter your state"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postal_code">Postal Code</Label>
                  <Input
                    type="text"
                    id="postal_code"
                    value={formData.postal_code}
                    onChange={handleChange}
                    placeholder="Enter your postal code"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                />
              </div>
            </CardContent>
          </Card>

          <Button onClick={handleSubmit} disabled={loading} className="bg-funky-purple hover:bg-funky-purple/90">
            {loading ? "Creating..." : "Create Profile"}
          </Button>
        </div>
      </div>
    </>
  );
}
