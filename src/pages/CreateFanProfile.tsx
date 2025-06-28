
import { useState } from "react";
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
import { ArrowLeft, Star } from "lucide-react";

interface FormState {
  name: string;
}

export default function CreateFanProfile() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { toast } = useToast();
  const [navOpen, setNavOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormState>({
    name: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      // Update profile data
      const profileData = {
        id: user.id,
        email: user.email || '',
        name: formData.name.trim(),
        user_type: 'fan'
      };

      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(profileData, { onConflict: 'id' });

      if (profileError) {
        throw profileError;
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

                <Button 
                  type="submit" 
                  disabled={loading} 
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
