
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useProductPreview } from "@/hooks/use-product-preview";
import { Plus, Loader2 } from "lucide-react";

const formSchema = z.object({
  product_url: z.string().url("Please enter a valid URL"),
  product_title: z.string().min(3, "Title must be at least 3 characters"),
  product_price: z.string().optional(),
  product_image_url: z.string().url("Please enter a valid image URL").optional().or(z.literal("")),
  comment: z.string().max(500, "Comment must be less than 500 characters").optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface WishlistFormProps {
  onAddItem: (item: any) => Promise<void>;
}

const WishlistForm = ({ onAddItem }: WishlistFormProps) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { fetchProductData, productData, isLoading: isLoadingProduct } = useProductPreview();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      product_url: "",
      product_title: "",
      product_price: "",
      product_image_url: "",
      comment: "",
    },
  });

  const handleUrlChange = async (url: string) => {
    if (url && url.startsWith("http")) {
      await fetchProductData(url);
    }
  };

  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      
      // Convert price to number if present
      const formattedValues = {
        ...values,
        product_price: values.product_price ? parseFloat(values.product_price) : undefined,
      };
      
      await onAddItem(formattedValues);
      form.reset();
      setOpen(false);
    } catch (error) {
      console.error("Error submitting wishlist item:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update form with product data when available
  const { watch, setValue } = form;
  const productUrl = watch("product_url");

  // Set product data when available
  const setProductDataInForm = () => {
    if (productData) {
      setValue("product_title", productData.title || "");
      
      if (productData.price) {
        setValue("product_price", productData.price.toString());
      }
      
      // Extract image URL from product data if available
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <Plus className="mr-2 h-4 w-4" /> Add Wishlist Item
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add to your wishlist</DialogTitle>
          <DialogDescription>
            Add items you'd like your fans to gift you
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="product_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product URL</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="https://example.com/product"
                      onChange={(e) => {
                        field.onChange(e);
                        handleUrlChange(e.target.value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isLoadingProduct && (
              <div className="flex items-center justify-center py-2">
                <Loader2 className="h-5 w-5 animate-spin text-funky-purple" />
                <span className="ml-2 text-sm text-muted-foreground">Fetching product details...</span>
              </div>
            )}

            {productData && (
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={setProductDataInForm}
              >
                Use detected product info
              </Button>
            )}
            
            <FormField
              control={form.control}
              name="product_title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Title</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Product name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="product_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (optional)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="₹0.00" type="number" step="0.01" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="product_image_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL (optional)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://example.com/image.jpg" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comment (optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Why do you want this item?" 
                      className="resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Item
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default WishlistForm;
