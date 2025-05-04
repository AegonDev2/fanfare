
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FunkyContainerProps {
  children: ReactNode;
  className?: string;
  withGraffiti?: boolean;
  withFloatingElements?: boolean;
}

const FunkyContainer = ({
  children,
  className,
  withGraffiti = true,
  withFloatingElements = false,
}: FunkyContainerProps) => {
  return (
    <div
      className={cn(
        "min-h-screen w-full pb-16",
        withGraffiti && "graffiti-bg",
        className
      )}
    >
      {withFloatingElements && (
        <>
          <div className="fixed top-[10%] left-[5%] w-16 h-16 rounded-full bg-funky-purple/30 animate-float blur-xl" />
          <div className="fixed top-[40%] right-[10%] w-24 h-24 rounded-full bg-funky-pink/20 animate-float animation-delay-1000 blur-xl" />
          <div className="fixed bottom-[20%] left-[20%] w-20 h-20 rounded-full bg-funky-blue/20 animate-float animation-delay-2000 blur-xl" />
          <div className="fixed top-[70%] right-[15%] w-12 h-12 rounded-full bg-funky-orange/20 animate-float animation-delay-3000 blur-xl" />
        </>
      )}
      {children}
    </div>
  );
};

export default FunkyContainer;
