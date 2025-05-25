
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Search, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/hooks/useUser';
import CartIcon from '@/components/cart/CartIcon';

interface HeaderProps {
  setNavOpen?: (isOpen: boolean) => void;
}

export default function Header({ setNavOpen }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useUser();

  const handleNavOpen = (isOpen: boolean) => {
    setIsOpen(isOpen);
    if (setNavOpen) {
      setNavOpen(isOpen);
    }
  };

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Gifts', path: '/gift-selection' },
    { label: 'Leaderboard', path: '/leaderboard' },
    { label: 'Track Order', path: '/track-order' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 
            className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent cursor-pointer"
            onClick={() => navigate('/')}
          >
            FanFare
          </h1>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navItems.map((item) => (
            <Button
              key={item.path}
              variant="ghost"
              onClick={() => navigate(item.path)}
              className="text-gray-600 hover:text-purple-600"
            >
              {item.label}
            </Button>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center space-x-4">
          <Button variant="ghost" size="sm">
            <Search className="h-5 w-5" />
          </Button>
          
          <CartIcon />
          
          {user ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/profile/${user.id}`)}
            >
              <User className="h-5 w-5" />
            </Button>
          ) : (
            <Button onClick={() => navigate('/auth')}>
              Sign In
            </Button>
          )}
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden flex items-center space-x-2">
          <CartIcon />
          
          <Sheet open={isOpen} onOpenChange={handleNavOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <div className="flex flex-col space-y-4 mt-8">
                {navItems.map((item) => (
                  <Button
                    key={item.path}
                    variant="ghost"
                    onClick={() => {
                      navigate(item.path);
                      setIsOpen(false);
                    }}
                    className="justify-start text-gray-600 hover:text-purple-600"
                  >
                    {item.label}
                  </Button>
                ))}
                
                <hr className="my-4" />
                
                {user ? (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      navigate(`/profile/${user.id}`);
                      setIsOpen(false);
                    }}
                    className="justify-start"
                  >
                    <User className="h-5 w-5 mr-2" />
                    Profile
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      navigate('/auth');
                      setIsOpen(false);
                    }}
                    className="justify-start"
                  >
                    Sign In
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
