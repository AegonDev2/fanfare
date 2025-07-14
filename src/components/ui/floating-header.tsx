
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FloatingHeaderProps {
  setNavOpen: (open: boolean) => void;
}

const FloatingHeader = ({ setNavOpen }: FloatingHeaderProps) => {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-full mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setNavOpen(true)}
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-funky-purple">FanFare</h1>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FloatingHeader;
