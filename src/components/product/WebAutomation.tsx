
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface ExtractedProduct {
  name: string | null;
  price: string | null;
  image: string | null;
  description: string | null;
}

export const WebAutomation = () => {
  const { toast } = useToast();
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [productData, setProductData] = useState<ExtractedProduct | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) {
      toast({
        title: "URL Required",
        description: "Please enter a product URL to extract data",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setProductData(null);
    setError(null);

    try {
      console.log("Calling edge function with URL:", url);
      
      const { data, error } = await supabase.functions.invoke("axiom-ai", {
        body: { url },
      });

      if (error) {
        console.error("Edge function error:", error);
        throw new Error(error.message || "Failed to call automation service");
      }

      console.log("Automation result:", data);

      if (data && data.success && data.productData) {
        setProductData(data.productData);
        toast({
          title: "Data Extracted",
          description: "Successfully extracted product information",
        });
      } else if (data && !data.success) {
        throw new Error(data.error || "Failed to extract product data");
      } else {
        throw new Error("Invalid response format from automation service");
      }
    } catch (error) {
      console.error("Error in automation:", error);
      setError(error instanceof Error ? error.message : "An unknown error occurred");
      toast({
        title: "Extraction Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Web Automation</CardTitle>
        <CardDescription>
          Extract product details from ecommerce websites
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col space-y-2">
            <label htmlFor="url" className="text-sm font-medium">
              Product URL
            </label>
            <div className="flex space-x-2">
              <Input
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.amazon.com/product-page or https://www.flipkart.com/product-page"
                className="flex-1"
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Extracting...
                  </>
                ) : (
                  "Extract Data"
                )}
              </Button>
            </div>
            {error && (
              <p className="text-sm text-red-500 mt-1">{error}</p>
            )}
          </div>
        </form>

        {isLoading && (
          <div className="mt-6 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <p className="mt-2 text-sm text-gray-500">
              Extracting product data... This may take a few moments.
            </p>
          </div>
        )}

        {productData && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Extracted Product Information</h3>
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

                {!productData.name && !productData.price && !productData.description && (
                  <div className="text-amber-600">
                    <p>Limited product information extracted. This may be due to:</p>
                    <ul className="list-disc pl-5 mt-2 text-sm">
                      <li>Website using advanced anti-scraping techniques</li>
                      <li>Non-standard page structure</li>
                      <li>Dynamic content loaded via JavaScript</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WebAutomation;
