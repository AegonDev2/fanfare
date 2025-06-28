
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Shop } from "@/hooks/useShops";

interface CreateProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shopId: string | null;
  shops: Shop[];
  onSuccess: () => void;
}

interface ProductForm {
  shop_id: string;
  name: string;
  description: string;
  price: string;
  image_url: string;
  product_url: string;
  category: string;
}

const categories = [
  "Electronics",
  "Fashion",
  "Beauty",
  "Home & Living",
  "Sports",
  "Books",
  "Toys & Games",
  "Food & Beverages",
  "Health & Wellness",
  "Other"
];

export default function CreateProductDialog({ open, onOpenChange, shopId, shops, onSuccess }: CreateProductDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<ProductForm>({
    shop_id: shopId || "",
    name: "",
    description: "",
    price: "",
    image_url: "",
    product_url: "",
    category: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.shop_id || !formData.price) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) {
      toast({
        title: "Invalid price",
        description: "Please enter a valid price",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('shop_products')
        .insert([{
          shop_id: formData.shop_id,
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          price: price,
          image_url: formData.image_url.trim() || null,
          product_url: formData.product_url.trim() || null,
          category: formData.category || null,
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product created successfully",
      });
      
      setFormData({
        shop_id: shopId || "",
        name: "",
        description: "",
        price: "",
        image_url: "",
        product_url: "",
        category: "",
      });
      
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create product",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Product</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="shop_id">Shop *</Label>
            <Select value={formData.shop_id} onValueChange={(value) => handleSelectChange('shop_id', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a shop" />
              </SelectTrigger>
              <SelectContent>
                {shops.map((shop) => (
                  <SelectItem key={shop.id} value={shop.id}>
                    {shop.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter product name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price (₹) *</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={handleChange}
              placeholder="0.00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={formData.category} onValueChange={(value) => handleSelectChange('category', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter product description"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_url">Image URL</Label>
            <Input
              id="image_url"
              type="url"
              value={formData.image_url}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="product_url">Product URL</Label>
            <Input
              id="product_url"
              type="url"
              value={formData.product_url}
              onChange={handleChange}
              placeholder="https://example.com/product"
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
              {isLoading ? "Creating..." : "Create Product"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
