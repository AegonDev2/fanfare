
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface HeaderProps {
  setNavOpen?: (isOpen: boolean) => void;
}

const Header = ({ setNavOpen }: HeaderProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Check if user is logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
    };
    checkUser();
  }, []);

  const handleNavToggle = () => {
    if (setNavOpen) {
      setNavOpen(true);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account",
      });
      
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Sign out failed",
        description: "There was a problem signing you out. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-sm shadow-sm">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="mr-2"
              onClick={handleNavToggle}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <a href="/" className="flex items-center">
              <span className="text-xl font-bold text-gray-900">FanFare</span>
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8 items-center">
            <a
              href="/"
              className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium"
            >
              Home
            </a>
            <a
              href="/how-it-works"
              className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium"
            >
              How It Works
            </a>
            <a
              href="/creators"
              className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium"
            >
              Creators
            </a>
            <a
              href="/about"
              className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium"
            >
              About Us
            </a>
          </nav>

          {/* Auth buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Button
                  variant="ghost"
                  className="text-gray-700"
                  onClick={() => navigate("/profile")}
                >
                  My Profile
                </Button>
                <Button
                  variant="outline"
                  className="text-gray-700"
                  onClick={handleSignOut}
                  disabled={isLoading}
                >
                  {isLoading ? "Signing out..." : "Sign Out"}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  className="text-gray-700"
                  onClick={() => navigate("/auth")}
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => navigate("/auth?tab=signup")}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600"
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

export default Header;
