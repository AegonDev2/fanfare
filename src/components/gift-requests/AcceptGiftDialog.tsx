import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Heart, MessageCircle } from "lucide-react";

interface AcceptGiftDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: (message?: string) => Promise<void>;
  productTitle: string;
  loading: boolean;
}

export const AcceptGiftDialog = ({
  isOpen,
  onClose,
  onAccept,
  productTitle,
  loading
}: AcceptGiftDialogProps) => {
  const [message, setMessage] = useState("");

  const handleAccept = async () => {
    await onAccept(message.trim() || undefined);
    setMessage("");
    onClose();
  };

  const handleCancel = () => {
    setMessage("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-green-600">
            <Heart className="h-5 w-5" />
            Accept Gift Request
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            You are about to accept the gift request for:{" "}
            <span className="font-medium text-gray-900">{productTitle}</span>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="message" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Personal Message (Optional)
            </Label>
            <Textarea
              id="message"
              placeholder="Add a personal thank you message for the fan..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[80px]"
              maxLength={500}
            />
            <div className="text-xs text-gray-500 text-right">
              {message.length}/500 characters
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleAccept}
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {loading ? "Processing..." : "Accept Gift"}
            </Button>
            <Button
              onClick={handleCancel}
              variant="outline"
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};