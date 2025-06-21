
import { useState } from 'react';
import { Home, Search, ShoppingBag, User, Menu } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import CartIcon from '@/components/cart/CartIcon';

interface MobileDockProps {
  setNavOpen?: (open: boolean) => void;
}

export default function MobileDock({ setNavOpen }: MobileDockProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [localNavOpen, setLocalNavOpen] = useState(false);

  const handleNavToggle = () => {
    if (setNavOpen) {
      setNavOpen(!localNavOpen);
      setLocalNavOpen(!localNavOpen);
    }
  };

  const navItems = [
    { icon: Home, label: 'Home', path: '/home' },
    { icon: Search, label: 'Influencers', path: '/influencers' },
    { icon: ShoppingBag, label: 'Gifts', path: '/gift-selection' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50 md:hidden">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Button
              key={item.path}
              variant="ghost"
              size="sm"
              className={cn(
                "flex flex-col items-center gap-1 h-auto py-2 px-3",
                isActive && "text-purple-600"
              )}
              onClick={() => navigate(item.path)}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs">{item.label}</span>
            </Button>
          );
        })}
        
        <CartIcon />
        
        {setNavOpen && (
          <Button
            variant="ghost"
            size="sm"
            className="flex flex-col items-center gap-1 h-auto py-2 px-3"
            onClick={handleNavToggle}
          >
            <Menu className="h-5 w-5" />
            <span className="text-xs">Menu</span>
          </Button>
        )}
      </div>
    </div>
  );
}
