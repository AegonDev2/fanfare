
import { Menu, Wallet, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/hooks/useUser";
import { useWallet } from "@/hooks/use-wallet";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface FloatingHeaderProps {
  setNavOpen: (open: boolean) => void;
}

const FloatingHeader = ({ setNavOpen }: FloatingHeaderProps) => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { wallet } = useWallet();
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // Fetch profile image for influencers
  useEffect(() => {
    const fetchProfileImage = async () => {
      if (!user || user.user_type !== 'influencer') return;
      
      try {
        const { data, error } = await supabase
          .from('influencer_profiles')
          .select('profile_image')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error('Error fetching profile image:', error);
          return;
        }
        
        setProfileImage(data?.profile_image || null);
      } catch (error) {
        console.error('Error fetching profile image:', error);
      }
    };

    fetchProfileImage();
  }, [user]);

  const formatBalance = (balance: number) => {
    return `₹${balance.toLocaleString('en-IN')}`;
  };

  const getUserInitials = () => {
    if (!user?.name) return user?.email?.charAt(0).toUpperCase() || 'U';
    return user.name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-full mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setNavOpen(true)}
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            <div 
              className="flex items-center space-x-2 cursor-pointer hover-scale transition-all duration-200"
              onClick={() => navigate('/')}
            >
              <img 
                src="/lovable-uploads/8f181bc3-b317-49b4-8117-1c20245ec9b0.png" 
                alt="FanFare Logo" 
                className="h-8 w-auto"
              />
            </div>
          </div>

          {/* User Actions - Only show when logged in */}
          {user && (
            <div className="flex items-center space-x-3">
              {/* Wallet Balance Preview */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/wallet')}
                className="hidden sm:flex items-center space-x-2 hover:bg-funky-purple/10 hover:text-funky-purple transition-all duration-200 hover-scale"
              >
                <Wallet className="h-4 w-4" />
                <span className="font-medium">
                  {wallet ? formatBalance(wallet.balance) : '₹0'}
                </span>
              </Button>

              {/* Profile Picture Preview */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/profile/${user.id}`)}
                className="p-1 hover:bg-funky-purple/10 rounded-full transition-all duration-200 hover-scale"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage 
                    src={profileImage || undefined} 
                    alt={user.name || 'User'} 
                  />
                  <AvatarFallback className="bg-gradient-to-r from-funky-purple to-funky-pink text-white text-xs font-medium">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
              </Button>

              {/* Mobile Wallet Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/wallet')}
                className="sm:hidden hover:bg-funky-purple/10 hover:text-funky-purple transition-all duration-200"
              >
                <Wallet className="h-5 w-5" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FloatingHeader;
