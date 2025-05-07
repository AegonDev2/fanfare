
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, User, Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import NotificationCenter from "@/components/notifications/NotificationCenter";
import WalletWidget from "@/components/wallet/WalletWidget";
import { useIsMobile } from "@/hooks/use-mobile";

interface FloatingHeaderProps {
  setNavOpen: (isOpen: boolean) => void;
}

const FloatingHeader = ({
  setNavOpen
}: FloatingHeaderProps) => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        setUser(data?.user || null);
      } catch (error) {
        console.error("Error checking user:", error);
      }
    };
    checkUser();
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
    <header className={cn("fixed top-0 left-0 right-0 z-40 transition-all duration-300", isScrolled ? "py-1" : "py-2")}>
      <div className="bg-transparent px-0">
        <div className="flex items-center justify-between h-10 sm:h-16 bg-cyan-950/85 backdrop-blur-md px-0 mx-1 sm:mx-[7px] rounded-full my-0">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setNavOpen(true)} 
              className="hover:bg-funky-purple/10 text-slate-100 px-0 mx-2"
            >
              <Menu className="h-4 w-4 sm:h-6 sm:w-6" />
            </Button>
            <a href="/" className="flex items-center">
              <span className={cn(
                "font-graffiti bg-clip-text bg-gradient-to-r from-funky-purple to-funky-pink text-slate-50",
                isMobile ? "text-lg" : "text-2xl" 
              )}>
                FanFare
              </span>
            </a>
          </div>

          <div className="flex space-x-1 items-center">
            {user ? (
              <>
                <div className="hidden md:block">
                  <WalletWidget />
                </div>
                <NotificationCenter />
                <div className="relative group">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => navigate(`/profile/${user.id}`)} 
                    className={cn(
                      "rounded-full text-funky-purple bg-stone-400 hover:bg-stone-300",
                      isMobile ? "h-7 w-7 mr-2" : "mx-[20px]"
                    )}
                  >
                    <User className={isMobile ? "h-3.5 w-3.5" : "h-5 w-5"} />
                  </Button>
                  <div className="absolute right-0 mt-2 w-40 sm:w-48 rounded-lg overflow-hidden shadow-lg scale-0 group-hover:scale-100 origin-top-right transition-all duration-200 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                    <div className="p-1 sm:p-2">
                      <Button variant="ghost" className="w-full justify-start text-left text-xs h-7 sm:h-8" onClick={() => navigate(`/profile/${user.id}`)}>
                        My Profile
                      </Button>
                      <Button variant="ghost" className="w-full justify-start text-left text-xs h-7 sm:h-8" onClick={() => navigate('/settings')}>
                        Settings
                      </Button>
                      {isMobile && (
                        <Button variant="ghost" className="w-full justify-start text-left text-xs h-7 sm:h-8" onClick={() => navigate('/wallet')}>
                          My Wallet
                        </Button>
                      )}
                      <Button variant="ghost" className="w-full justify-start text-left text-xs h-7 sm:h-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={handleSignOut} disabled={isLoading}>
                        {isLoading ? "Signing out..." : "Sign Out"}
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  className={cn(
                    "font-medium text-funky-purple hover:text-funky-pink hover:bg-funky-purple/10",
                    isMobile ? "text-xs px-2 py-0.5 h-6" : ""
                  )}
                  onClick={() => navigate("/auth")}
                >
                  Sign In
                </Button>
                <Button 
                  onClick={() => navigate("/auth?tab=signup")} 
                  className={cn(
                    "funky-button",
                    isMobile ? "text-[10px] mx-2 px-2 py-0.5 h-6" : "mx-[22px] px-[11px]"
                  )}
                >
                  Join Now
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default FloatingHeader;
