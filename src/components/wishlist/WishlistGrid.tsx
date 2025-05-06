
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Gift, Loader2 } from "lucide-react";
import WishlistItem from "./WishlistItem";
import WishlistForm from "./WishlistForm";
import { type WishlistItem as WishlistItemType } from "@/hooks/useInfluencerWishlist";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface WishlistGridProps {
  wishlist: WishlistItemType[];
  isLoading: boolean;
  isOwner: boolean;
  onAddItem?: (item: any) => Promise<void>;
  onRemoveItem?: (id: string) => Promise<void>;
  onRequestGift?: (item: WishlistItemType) => void;
}

const WishlistGrid = ({ 
  wishlist, 
  isLoading, 
  isOwner,
  onAddItem, 
  onRemoveItem,
  onRequestGift
}: WishlistGridProps) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-10 w-10 text-funky-purple animate-spin mb-4" />
        <p className="text-gray-500">Loading wishlist...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isOwner && onAddItem && (
        <div className="mb-6">
          <WishlistForm onAddItem={onAddItem} />
        </div>
      )}

      {wishlist.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-white/70 dark:bg-gray-800/70">
          <Gift className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-1">No items in wishlist</h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            {isOwner 
              ? "Add items you would like your fans to gift you."
              : "This influencer hasn't added any wishlist items yet."}
          </p>
          
          {isOwner && onAddItem && (
            <Button className="mt-4" onClick={() => document.querySelector<HTMLButtonElement>('[aria-haspopup="dialog"]')?.click()}>
              Add Your First Item
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {wishlist.map(item => (
            <AlertDialog key={item.id}>
              <WishlistItem
                item={item}
                showActions={isOwner}
                onRemove={isOwner && onRemoveItem ? 
                  (id) => (
                    document.querySelector<HTMLButtonElement>(`[data-item-id="${id}"]`)?.click()
                  ) : undefined
                }
                onRequestGift={!isOwner && onRequestGift ? onRequestGift : undefined}
              />
              
              {/* Delete confirmation dialog */}
              {isOwner && onRemoveItem && (
                <>
                  <AlertDialogTrigger className="hidden" data-item-id={item.id}></AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will remove the item "{item.product_title}" from your wishlist.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => onRemoveItem(item.id)}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </>
              )}
            </AlertDialog>
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistGrid;
