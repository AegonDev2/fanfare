
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, User, Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import NotificationCenter from "@/components/notifications/NotificationCenter";
import WalletWidget from "@/components/wallet/WalletWidget";

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

  return <header className={cn("fixed top-0 left-0 right-0 z-40 transition-all duration-300", isScrolled ? "py-1 md:py-2" : "py-2 md:py-4")}>
      <div className="bg-transparent">
        <div className="flex items-center justify-between h-12 md:h-16 bg-cyan-950/85 backdrop-blur-md px-3 md:px-0 mx-2 md:mx-[7px] rounded-full py-0 my-0">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={() => setNavOpen(true)} className="mr-1 md:mr-2 hover:bg-funky-purple/10 text-slate-100 px-0 mx-2 md:mx-[17px] h-8 w-8 md:h-10 md:w-10">
              <Menu className="h-4 w-4 md:h-6 md:w-6" />
            </Button>
            <button onClick={() => navigate("/")} className="flex items-center">
              <span className="text-lg md:text-2xl font-graffiti bg-clip-text bg-gradient-to-r from-funky-purple to-funky-pink text-slate-50">
                FanFare
              </span>
            </button>
          </div>

          <div className="hidden md:flex space-x-1 lg:space-x-2 items-center">
            {user ? <>
                <WalletWidget />
                <NotificationCenter />
                <div className="relative group">
                  <Button variant="ghost" size="icon" onClick={() => navigate(`/profile/${user.id}`)} className="rounded-full text-funky-purple mx-3 lg:mx-[20px] bg-stone-400 hover:bg-stone-300 h-8 w-8 lg:h-10 lg:w-10">
                    <User className="h-4 w-4 lg:h-5 lg:w-5" />
                  </Button>
                  <div className="absolute right-0 mt-2 w-48 rounded-lg overflow-hidden shadow-lg scale-0 group-hover:scale-100 origin-top-right transition-all duration-200 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                    <div className="p-2">
                      <Button variant="ghost" className="w-full justify-start text-left text-sm" onClick={() => navigate(`/profile/${user.id}`)}>
                        My Profile
                      </Button>
                      <Button variant="ghost" className="w-full justify-start text-left text-sm" onClick={() => navigate('/settings')}>
                        Settings
                      </Button>
                      <Button variant="ghost" className="w-full justify-start text-left text-sm text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={handleSignOut} disabled={isLoading}>
                        {isLoading ? "Signing out..." : "Sign Out"}
                      </Button>
                    </div>
                  </div>
                </div>
              </> : <>
                <Button variant="ghost" className="font-medium text-funky-purple hover:text-funky-pink hover:bg-funky-purple/10 text-sm lg:text-base" onClick={() => navigate("/auth")}>
                  Sign In
                </Button>
                <Button onClick={() => navigate("/auth?tab=signup")} className="funky-button mx-3 lg:mx-[22px] px-2 lg:px-[11px] text-sm lg:text-base h-8 lg:h-10">
                  Join Now
                </Button>
              </>}
          </div>
        </div>
      </div>
    </header>;
};

export default FloatingHeader;
