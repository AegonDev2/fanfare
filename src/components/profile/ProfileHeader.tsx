
import { useState, useEffect } from "react";
import { Gift, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

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

  // Redirects to place order page with influencer ID
  const handleSendGift = () => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      // Redirect to auth page if not authenticated
      navigate(`/auth?redirectTo=/place-order?influencer=${profileId}`);
      return;
    }
    
    // If authenticated, proceed to place order
    navigate(`/place-order?influencer=${profileId}`);
  };

  // Check if the current user can edit this profile and if they're authenticated
  const checkUserPermissions = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Set authentication status
    setIsAuthenticated(!!user);
    
    // Set edit permission (only if user is owner of profile)
    if (user && user.id === profileId) {
      setCanEdit(true);
    }
  };

  // Call checkUserPermissions when component mounts
  useEffect(() => {
    checkUserPermissions();
  }, [profileId]);

  return (
    <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
      <img
        src={profileImage}
        alt={`${name}'s profile picture`}
        className="w-32 h-32 rounded-full object-cover"
      />
      <div className="flex-1">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">{name}</h2>
            <p className="text-gray-600">Platform: {platform}</p>
            <p className="text-gray-600">Followers: {followers.toLocaleString()}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            {canEdit && (
              <Button 
                variant="outline"
                className="flex items-center gap-2 w-full sm:w-auto"
                onClick={() => navigate('/edit-profile')}
              >
                <Edit className="h-4 w-4" />
                Edit Profile
              </Button>
            )}
            <Button 
              className="flex items-center gap-2 w-full sm:w-auto"
              onClick={handleSendGift}
            >
              <Gift className="h-4 w-4" />
              Send Gift
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
