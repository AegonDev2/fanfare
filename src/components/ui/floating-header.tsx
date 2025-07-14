
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FloatingHeaderProps {
  setNavOpen: (open: boolean) => void;
}

const FloatingHeader = ({ setNavOpen }: FloatingHeaderProps) => {
  return (
    <div className="fixed top-4 left-4 right-4 z-50 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg">
      <div className="max-w-full mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setNavOpen(true)}
              className="lg:hidden rounded-full hover:bg-primary/10"
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent animate-fade-in">
                FanFare
              </h1>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FloatingHeader;
