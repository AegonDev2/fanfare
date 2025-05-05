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
  const {
    toast
  } = useToast();
  useEffect(() => {
    const checkUser = async () => {
      const {
        data
      } = await supabase.auth.getUser();
      setUser(data?.user || null);
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
      const {
        error
      } = await supabase.auth.signOut();
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
  return <header className={cn("fixed top-0 left-0 right-0 z-40 transition-all duration-300", isScrolled ? "py-2" : "py-4")}>
      <div className={cn("container mx-auto px-4 rounded-full transition-all duration-300 backdrop-blur-md", isScrolled ? "bg-white/70 dark:bg-gray-900/70 shadow-lg" : "bg-transparent")}>
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={() => setNavOpen(true)} className="mr-2 hover:bg-funky-purple/10 text-zinc-900">
              <Menu className="h-6 w-6" />
            </Button>
            <a href="/" className="flex items-center">
              <span className="text-2xl font-graffiti bg-clip-text bg-gradient-to-r from-funky-purple to-funky-pink text-slate-800">
                FanFare
              </span>
            </a>
          </div>

          <div className="hidden md:flex space-x-2 items-center">
            {user ? <>
                <WalletWidget />
                <NotificationCenter />
                <div className="relative group">
                  <Button variant="ghost" size="icon" className="rounded-full bg-funky-purple/10 hover:bg-funky-purple/20 text-funky-purple" onClick={() => navigate(`/profile/${user.id}`)}>
                    <User className="h-5 w-5" />
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
                <Button variant="ghost" className="font-medium text-funky-purple hover:text-funky-pink hover:bg-funky-purple/10" onClick={() => navigate("/auth")}>
                  Sign In
                </Button>
                <Button onClick={() => navigate("/auth?tab=signup")} className="funky-button">
                  Join Now
                </Button>
              </>}
          </div>
        </div>
      </div>
    </header>;
};
export default FloatingHeader;