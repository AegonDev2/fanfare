
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ExtractedProduct } from "../types/product";
import { useToast } from "@/hooks/use-toast";
import { ProductDetails } from "@/types/order";

interface ExtractedProductInfoProps {
  productData: ExtractedProduct;
  url: string;
  onUseProduct: (product: ProductDetails) => void;
  productPreview: ProductDetails | null;
}

export const ExtractedProductInfo = ({ 
  productData, 
  url, 
  onUseProduct,
  productPreview 
}: ExtractedProductInfoProps) => {
  const { toast } = useToast();

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-2">Product Information</h3>
      <Separator className="my-2" />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {productData.image && (
          <div className="md:col-span-1">
            <img 
              src={productData.image} 
              alt={productData.name || "Product"}
              className="w-full h-auto object-contain rounded-md"
              style={{ maxHeight: "200px" }}
            />
          </div>
        )}
        
        <div className={`${productData.image ? 'md:col-span-2' : 'md:col-span-3'} space-y-3`}>
          {productData.name && (
            <div>
              <h4 className="text-sm font-medium text-gray-500">Product Name</h4>
              <p className="text-lg font-semibold">{productData.name}</p>
            </div>
          )}
          
          {productData.price && (
            <div>
              <h4 className="text-sm font-medium text-gray-500">Price</h4>
              <p className="text-xl font-bold text-primary">{productData.price}</p>
            </div>
          )}
          
          {productData.description && (
            <div>
              <h4 className="text-sm font-medium text-gray-500">Description</h4>
              <p className="text-sm text-gray-700">{productData.description}</p>
            </div>
          )}
          
          <div className="pt-4">
            <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline inline-flex items-center text-sm">
              <ExternalLink className="h-4 w-4 mr-1" />
              View original product page
            </a>
          </div>
        </div>
      </div>
      
      {productData.name && (
        <div className="mt-6">
          <Button 
            onClick={() => {
              if (productPreview) {
                onUseProduct(productPreview);
                toast({
                  title: "Product Selected",
                  description: "The product has been added to your order",
                });
              }
            }} 
            className="w-full"
          >
            Use This Product
          </Button>
        </div>
      )}
    </div>
  );
};
