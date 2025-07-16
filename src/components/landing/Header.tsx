import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/hooks/useUser';
import MobileDock from '@/components/navigation/MobileDock';

interface HeaderProps {
  setNavOpen: (open: boolean) => void;
}

export default function Header({ setNavOpen }: HeaderProps) {
  const navigate = useNavigate();
  const { user } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleAuthAction = async () => {
    if (user) {
      await supabase.auth.signOut();
      navigate('/');
    } else {
      navigate('/auth');
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    setNavOpen(!mobileMenuOpen);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-funky-purple/10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
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

            <nav className="hidden md:flex items-center space-x-6">
              <a href="#influencers" className="text-gray-700 hover:text-funky-purple transition-colors text-sm font-medium">
                Influencers
              </a>
              <a href="#gifts" className="text-gray-700 hover:text-funky-purple transition-colors text-sm font-medium">
                Gifts
              </a>
              <a href="#how-it-works" className="text-gray-700 hover:text-funky-purple transition-colors text-sm font-medium">
                How it Works
              </a>
              <a href="#testimonials" className="text-gray-700 hover:text-funky-purple transition-colors text-sm font-medium">
                Testimonials
              </a>
            </nav>

            <div className="flex items-center space-x-3">
              <div className="hidden md:flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAuthAction}
                  className="border-funky-purple/30 text-funky-purple hover:bg-funky-purple/10"
                >
                  {user ? 'Sign Out' : 'Sign In'}
                </Button>
                {user && (
                  <Button
                    size="sm"
                    onClick={() => navigate('/home')}
                    className="bg-gradient-to-r from-funky-purple to-funky-pink text-white hover:shadow-lg transition-all"
                  >
                    Dashboard
                  </Button>
                )}
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={toggleMobileMenu}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-funky-purple/10 pt-4">
              <nav className="flex flex-col space-y-3">
                <a href="#influencers" className="text-gray-700 hover:text-funky-purple transition-colors text-sm font-medium py-2">
                  Influencers
                </a>
                <a href="#gifts" className="text-gray-700 hover:text-funky-purple transition-colors text-sm font-medium py-2">
                  Gifts
                </a>
                <a href="#how-it-works" className="text-gray-700 hover:text-funky-purple transition-colors text-sm font-medium py-2">
                  How it Works
                </a>
                <a href="#testimonials" className="text-gray-700 hover:text-funky-purple transition-colors text-sm font-medium py-2">
                  Testimonials
                </a>
                <div className="flex flex-col space-y-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAuthAction}
                    className="border-funky-purple/30 text-funky-purple hover:bg-funky-purple/10"
                  >
                    {user ? 'Sign Out' : 'Sign In'}
                  </Button>
                  {user && (
                    <Button
                      size="sm"
                      onClick={() => navigate('/home')}
                      className="bg-gradient-to-r from-funky-purple to-funky-pink text-white hover:shadow-lg transition-all"
                    >
                      Dashboard
                    </Button>
                  )}
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>
      <MobileDock />
    </>
  );
}
