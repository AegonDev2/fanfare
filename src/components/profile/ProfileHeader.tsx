import { useState, useEffect } from "react";
import { Gift, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
interface ProfileHeaderProps {
  name: string;
  platform: string;
  followers: number;
  profileImage: string;
  onSendGift: (giftItem: string, giftMessage: string) => Promise<void>;
  profileId: string;
}
const ProfileHeader = ({
  name,
  platform,
  followers,
  profileImage,
  onSendGift,
  profileId
}: ProfileHeaderProps) => {
  const navigate = useNavigate();
  const [canEdit, setCanEdit] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const {
    toast
  } = useToast();

  // Redirects to place order page with influencer ID
  const handleSendGift = () => {
    console.log("Send Gift clicked - Auth status:", isAuthenticated, "Loading:", isLoading);

    // Check if user is authenticated
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to send gifts to influencers",
        variant: "default"
      });

      // Redirect to auth page with return URL
      navigate(`/auth?redirectTo=${encodeURIComponent(`/place-order?influencer=${profileId}`)}`);
      return;
    }

    // If authenticated, proceed to place order
    console.log("Navigating to place order with influencer:", profileId);
    navigate(`/place-order?influencer=${profileId}`);
  };

  // Check if the current user can edit this profile and if they're authenticated
  const checkUserPermissions = async () => {
    try {
      setIsLoading(true);
      console.log("Checking user permissions...");
      const {
        data: {
          user
        },
        error
      } = await supabase.auth.getUser();
      if (error) {
        console.error("Auth error:", error);
        setIsAuthenticated(false);
        setCanEdit(false);
        return;
      }
      console.log("Auth user:", user ? "authenticated" : "not authenticated");

      // Set authentication status
      setIsAuthenticated(!!user);

      // Set edit permission (only if user is owner of profile)
      if (user && user.id === profileId) {
        setCanEdit(true);
        console.log("User can edit this profile");
      } else {
        setCanEdit(false);
        console.log("User cannot edit this profile");
      }
    } catch (error) {
      console.error("Error checking user permissions:", error);
      setIsAuthenticated(false);
      setCanEdit(false);
    } finally {
      setIsLoading(false);
      console.log("Permission check complete");
    }
  };

  // Call checkUserPermissions when component mounts
  useEffect(() => {
    checkUserPermissions();

    // Listen for auth state changes
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, !!session);
      setIsAuthenticated(!!session);

      // Re-check permissions when auth state changes
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        setTimeout(() => {
          checkUserPermissions();
        }, 100);
      }
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [profileId]);
  return <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
      <img src={profileImage} alt={`${name}'s profile picture`} className="w-32 h-32 rounded-full object-cover" />
      <div className="flex-1">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">{name}</h2>
            
            
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            {canEdit && <Button variant="outline" className="flex items-center gap-2 w-full sm:w-auto" onClick={() => navigate('/edit-profile')} disabled={isLoading}>
                <Edit className="h-4 w-4" />
                Edit Profile
              </Button>}
            <Button className="flex items-center gap-2 w-full sm:w-auto" onClick={handleSendGift} disabled={isLoading}>
              <Gift className="h-4 w-4" />
              Send Gift
            </Button>
          </div>
        </div>
      </div>
    </div>;
};
export default ProfileHeader;