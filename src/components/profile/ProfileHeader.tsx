
import { Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface ProfileHeaderProps {
  name: string;
  platform: string;
  followers: number;
  profileImage: string;
  onSendGift: (giftItem: string, giftMessage: string) => Promise<void>;
}

const ProfileHeader = ({ name, platform, followers, profileImage, onSendGift }: ProfileHeaderProps) => {
  const [giftMessage, setGiftMessage] = React.useState("");
  const [giftItem, setGiftItem] = React.useState("");

  const handleSendGift = async () => {
    await onSendGift(giftItem, giftMessage);
    setGiftMessage("");
    setGiftItem("");
  };

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
  );
};

export default ProfileHeader;
