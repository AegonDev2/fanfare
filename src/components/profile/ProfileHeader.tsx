
import { useState, useEffect } from "react";
import { Gift, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface ProfileHeaderProps {
  name: string;
  platform: string;
  followers: number;
  profileImage: string;
  onSendGift: (giftItem: string, giftMessage: string) => Promise<void>;
  profileId: string;
}

const ProfileHeader = ({ name, platform, followers, profileImage, onSendGift, profileId }: ProfileHeaderProps) => {
  const navigate = useNavigate();
  const [canEdit, setCanEdit] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Redirects to place order page with influencer ID
  const handleSendGift = () => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to send gifts to influencers",
        variant: "default"
      });
      
      // Redirect to auth page if not authenticated
      navigate(`/auth?redirectTo=/place-order?influencer=${profileId}`);
      return;
    }
    
    // If authenticated, proceed to place order
    navigate(`/place-order?influencer=${profileId}`);
  };

  // Check if the current user can edit this profile and if they're authenticated
  const checkUserPermissions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Set authentication status
      setIsAuthenticated(!!user);
      
      // Set edit permission (only if user is owner of profile)
      if (user && user.id === profileId) {
        setCanEdit(true);
      }
    } catch (error) {
      console.error("Error checking user permissions:", error);
    }
  };

  // Call checkUserPermissions when component mounts
  useEffect(() => {
    checkUserPermissions();
  }, [profileId]);

  return (
    <div className="flex flex-col md:flex-row items-center md:items-start gap-3 sm:gap-6 px-1">
      <img
        src={profileImage}
        alt={`${name}'s profile picture`}
        className={cn(
          "rounded-full object-cover border-2 border-funky-purple/20",
          isMobile ? "w-20 h-20" : "w-32 h-32"
        )}
      />
      <div className="flex-1">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-2 sm:gap-4">
          <div className="text-center md:text-left">
            <h2 className={cn(
              "font-semibold text-gray-800",
              isMobile ? "text-xl" : "text-2xl"
            )}>{name}</h2>
            <p className={cn(
              "text-gray-600",
              isMobile ? "text-sm" : ""
            )}>Platform: {platform}</p>
            <p className={cn(
              "text-gray-600",
              isMobile ? "text-sm" : ""
            )}>Followers: {followers.toLocaleString()}</p>
          </div>
          <div className="flex flex-row gap-2 w-full md:w-auto mt-2 md:mt-0 justify-center md:justify-start">
            {canEdit && (
              <Button 
                variant="outline"
                className={cn(
                  "flex items-center gap-1.5",
                  isMobile ? "text-xs h-8 px-2.5" : ""
                )}
                onClick={() => navigate('/edit-profile')}
              >
                <Edit className={isMobile ? "h-3 w-3" : "h-4 w-4"} />
                Edit Profile
              </Button>
            )}
            <Button 
              className={cn(
                "flex items-center gap-1.5",
                isMobile ? "text-xs h-8 px-2.5" : ""
              )}
              onClick={handleSendGift}
            >
              <Gift className={isMobile ? "h-3 w-3" : "h-4 w-4"} />
              Send Gift
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
