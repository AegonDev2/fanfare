
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
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-sm shadow-sm">
        <div className="container mx-auto md:px-6 lg:px-8 px-0 bg-transparent">
          <FloatingHeader setNavOpen={setNavOpen} />
        </div>
      </header>
      
      {/* Navbar that slides in from the side */}
      <Navbar isOpen={isOpen} setIsOpen={setIsOpen} />
      
      {isMobile && <MobileDock setNavOpen={setNavOpen} />}
    </>
  );
};

export default Header;
