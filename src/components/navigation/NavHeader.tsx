
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface NavHeaderProps {
  setIsOpen?: (isOpen: boolean) => void;
}

const NavHeader = ({
  setIsOpen
}: NavHeaderProps) => {
  const isMobile = useIsMobile();
  
  return (
    <header className="relative flex items-center justify-between min-h-[80px] px-6 text-[var(--navbar-light-primary)]">
      <h1 className="text-2xl font-graffiti bg-clip-text text-transparent bg-gradient-to-r from-funky-purple to-funky-pink">FanFare</h1>
      
      {setIsOpen && (
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-[var(--navbar-light-primary)] hover:bg-[var(--navbar-dark-secondary)]" 
          onClick={() => setIsOpen(false)}
        >
          <X className="h-5 w-5" />
        </Button>
      )}
      
      <hr className={cn(
        "absolute bottom-0 left-6",
        isMobile ? 'w-[calc(100%-3rem)]' : 'w-[calc(100%-3rem)]',
        "border-t border-[var(--navbar-dark-secondary)]"
      )} />
    </header>
  );
};

export default NavHeader;
