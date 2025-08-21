
import { Package } from "lucide-react";

export const LoadingGiftsState = () => {
  return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-pulse text-center">
        <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">Loading your gift requests...</p>
      </div>
    </div>
  );
};
