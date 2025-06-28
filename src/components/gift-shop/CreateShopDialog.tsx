
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CreateShopDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface ShopForm {
  name: string;
  description: string;
  website_url: string;
  logo_image_url: string;
}

export default function CreateShopDialog({ open, onOpenChange, onSuccess }: CreateShopDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<ShopForm>({
    name: "",
    description: "",
    website_url: "",
    logo_image_url: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a shop name",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('shops')
        .insert([{
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          website_url: formData.website_url.trim() || null,
          logo_image_url: formData.logo_image_url.trim() || null,
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Shop created successfully",
      });
      
      setFormData({
        name: "",
        description: "",
        website_url: "",
        logo_image_url: "",
      });
      
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create shop",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Shop</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Shop Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter shop name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter shop description"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="website_url">Website URL</Label>
            <Input
              id="website_url"
              type="url"
              value={formData.website_url}
              onChange={handleChange}
              placeholder="https://example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo_image_url">Logo Image URL</Label>
            <Input
              id="logo_image_url"
              type="url"
              value={formData.logo_image_url}
              onChange={handleChange}
              placeholder="https://example.com/logo.png"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-funky-purple hover:bg-funky-purple/90"
            >
              {isLoading ? "Creating..." : "Create Shop"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
