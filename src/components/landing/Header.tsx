
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import WalletWidget from "@/components/wallet/WalletWidget";
import MobileDock from "@/components/navigation/MobileDock";
import Navbar from "@/components/navigation/Navbar";
import FloatingHeader from "@/components/ui/floating-header";
import CartIcon from '@/components/cart/CartIcon';

interface HeaderProps {
  setNavOpen?: (isOpen: boolean) => void;
}

const Header = ({
  setNavOpen = () => {}
}: HeaderProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
    };
    checkUser();
  }, []);

  const handleNavToggle = () => {
    setIsOpen(!isOpen);
    if (setNavOpen) {
      setNavOpen(!isOpen);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account"
      });
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Sign out failed",
        description: "There was a problem signing you out. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <FloatingHeader setNavOpen={setNavOpen} />
            </div>

            <div className="flex items-center space-x-4">
              <CartIcon />
              <Button onClick={handleSignOut} variant="ghost" className="h-8 w-8">
                <X size={16} />
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Navbar that slides in from the side */}
      <Navbar isOpen={isOpen} setIsOpen={setIsOpen} />
      
      {isMobile && <MobileDock setNavOpen={setNavOpen} />}
    </>
  );
};

export default Header;
