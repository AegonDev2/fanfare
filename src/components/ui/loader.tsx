import { cn } from "@/lib/utils";

interface LoaderProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: 'w-8 h-8',
  md: 'w-[65px] h-[65px]', // Default size from provided component
  lg: 'w-20 h-20'
};

export function Loader({ className, size = 'md' }: LoaderProps) {
  return (
    <div className={cn("relative aspect-square", sizeMap[size], className)}>
      <span className="absolute rounded-[50px] animate-loaderAnim shadow-[inset_0_0_0_3px] shadow-foreground/20" />
      <span className="absolute rounded-[50px] animate-loaderAnim-delayed shadow-[inset_0_0_0_3px] shadow-foreground/20" />
    </div>
  );
}

// Full page loader component
export function PageLoader({ message }: { message?: string }) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <Loader size="lg" className="mb-4" />
      {message && (
        <p className="text-muted-foreground text-center animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
}

// Card/section loader component
export function SectionLoader({ message, className }: { message?: string; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 space-y-4", className)}>
      <Loader />
      {message && (
        <p className="text-muted-foreground text-sm text-center">
          {message}
        </p>
      )}
    </div>
  );
}