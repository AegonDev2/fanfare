
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Gift, Loader2, Plus, Trash2 } from "lucide-react";
import WishlistItem from "./WishlistItem";
import WishlistForm from "./WishlistForm";
import { type WishlistItem as WishlistItemType } from "@/hooks/useInfluencerWishlist";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useState } from "react";

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
  const [isFormVisible, setIsFormVisible] = useState(false);

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
          {isFormVisible ? (
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 shadow-md border border-funky-purple/10">
              <WishlistForm 
                onAddItem={async (item) => {
                  await onAddItem(item);
                  setIsFormVisible(false);
                }}
              />
            </div>
          ) : (
            <Button 
              onClick={() => setIsFormVisible(true)}
              className="w-full sm:w-auto bg-gradient-to-r from-funky-purple to-funky-pink hover:from-funky-pink hover:to-funky-purple text-white transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Wishlist Item
            </Button>
          )}
        </div>
      )}

      {wishlist.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-funky-purple/10">
          <Gift className="h-12 w-12 text-funky-purple/40 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-1">No items in wishlist</h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            {isOwner 
              ? "Add items you would like your fans to gift you."
              : "This influencer hasn't added any wishlist items yet."}
          </p>
          
          {isOwner && onAddItem && !isFormVisible && (
            <Button 
              className="mt-4 bg-gradient-to-r from-funky-purple to-funky-pink hover:from-funky-pink hover:to-funky-purple text-white"
              onClick={() => setIsFormVisible(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Item
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map(item => (
            <AlertDialog key={item.id}>
              <WishlistItem
                item={item}
                showActions={isOwner}
                onRemove={isOwner && onRemoveItem ? 
                  () => document.querySelector<HTMLButtonElement>(`[data-item-id="${item.id}"]`)?.click() 
                  : undefined
                }
                onRequestGift={!isOwner && onRequestGift ? onRequestGift : undefined}
              />
              
              {/* Delete confirmation dialog */}
              {isOwner && onRemoveItem && (
                <>
                  <AlertDialogTrigger className="hidden" data-item-id={item.id}></AlertDialogTrigger>
                  <AlertDialogContent className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md">
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
                        <Trash2 className="h-4 w-4 mr-1" />
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
