import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/hooks/useUser";
import { User } from "lucide-react";
import FloatingHeader from '@/components/ui/floating-header';
import Navbar from '@/components/navigation/Navbar';

interface FormData {
  name: string;
  bio: string;
}

export default function EditProfile() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { toast } = useToast();
  const [navOpen, setNavOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    bio: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      setLoading(true);
      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('name, bio')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;

        if (profile) {
          setFormData({
            name: profile.name || "",
            bio: profile.bio || "",
          });
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to load profile data.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    setLoading(true);
    try {
      // Update profile - only update fields that exist in the profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: formData.name,
          bio: formData.bio,
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      navigate('/profile');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile.",
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
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-funky-purple to-funky-pink bg-clip-text text-transparent">
              Edit Profile
            </h1>
            <p className="text-gray-600 mt-2">Update your profile information</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Display Name</Label>
                  <Input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={3}
                  />
                </div>

                <Button disabled={loading} className="bg-funky-purple hover:bg-funky-purple/90">
                  {loading ? "Updating..." : "Update Profile"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
