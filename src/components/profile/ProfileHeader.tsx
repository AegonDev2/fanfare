import { useState, useEffect } from "react";
import { Gift, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  const [giftMessage, setGiftMessage] = useState("");
  const [giftItem, setGiftItem] = useState("");
  const [canEdit, setCanEdit] = useState(false);

  const handleSendGift = async () => {
    await onSendGift(giftItem, giftMessage);
    setGiftMessage("");
    setGiftItem("");
  };

  // Check if the current user can edit this profile
  const checkEditPermission = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user && user.id === profileId) {
      setCanEdit(true);
    }
  };

  // Call checkEditPermission when component mounts
  useEffect(() => {
    checkEditPermission();
  }, [profileId]);

  return (
    <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
      <img
        src={profileImage}
        alt={`${name}'s profile picture`}
        className="w-32 h-32 rounded-full object-cover"
      />
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">{name}</h2>
            <p className="text-gray-600">Platform: {platform}</p>
            <p className="text-gray-600">Followers: {followers.toLocaleString()}</p>
          </div>
          <div className="flex gap-2">
            {canEdit && (
              <Button 
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => navigate('/create-profile')}
              >
                <Edit className="h-4 w-4" />
                Edit Profile
              </Button>
            )}
            <Dialog>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Gift className="h-4 w-4" />
                  Send Gift
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Send a Gift to {name}</DialogTitle>
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
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
