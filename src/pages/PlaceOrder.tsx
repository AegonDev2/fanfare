
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/landing/Header";
import { Progress } from "@/components/ui/progress";

interface PlaceOrderProps {
  setNavOpen?: (isOpen: boolean) => void;
}

interface ProductDetails {
  name: string;
  description: string;
  price: number;
  platformFee: number;
  image: string;
  id?: string;
}

const PlaceOrder = ({ setNavOpen }: PlaceOrderProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingProduct, setIsFetchingProduct] = useState(false);
  const [fetchProgress, setFetchProgress] = useState(0);
  const [productPreview, setProductPreview] = useState<ProductDetails>({
    name: "Enter a product URL to preview",
    description: "Product details will appear here once you enter a valid URL.",
    price: 0,
    platformFee: 5.00,
    image: "https://storage.googleapis.com/a1aa/image/tSbIqbP_qJMzV8bfuyM7gaSttRX2Pi5K-jl57IlWP44.jpg"
  });
  
  const [giftItem, setGiftItem] = useState(searchParams.get("gift") || "");
  const influencerId = searchParams.get("influencer") || "";
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to place an order",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      // First insert the product details
      const { data: productData, error: productError } = await supabase
        .from('products')
        .insert({
          url: giftItem,
          name: productPreview.name,
          description: productPreview.description,
          price: productPreview.price,
          image_url: productPreview.image
        })
        .select()
        .single();

      if (productError) throw productError;

      // Then create the order with the product reference
      const { error: orderError } = await supabase.from("orders").insert({
        user_id: user.id,
        influencer_id: influencerId,
        product_id: productData.id,
        product_url: giftItem,
        product_title: productPreview.name,
        product_price: productPreview.price,
        platform_fee: productPreview.platformFee,
        total_amount: productPreview.price + productPreview.platformFee,
        message: message,
        status: "pending"
      });

      if (orderError) throw orderError;

      toast({
        title: "Order placed successfully",
        description: "Your order has been submitted",
      });
      
      navigate("/");
    } catch (error) {
      console.error("Error placing order:", error);
      toast({
        title: "Error",
        description: "Failed to place order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreviewProduct = async () => {
    if (!giftItem) {
      toast({
        title: "Error",
        description: "Please enter a product URL",
        variant: "destructive",
      });
      return;
    }

    // Validate URL
    try {
      new URL(giftItem);
    } catch (e) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid product URL",
        variant: "destructive",
      });
      return;
    }

    setIsFetchingProduct(true);
    setFetchProgress(0);
    
    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setFetchProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      // Call the edge function to fetch product details
      const { data, error } = await supabase.functions.invoke('fetch-product', {
        body: { url: giftItem }
      });

      if (error) throw error;

      clearInterval(progressInterval);
      setFetchProgress(100);
      
      setProductPreview({
        ...data,
        platformFee: 5.00
      });

      toast({
        title: "Product fetched",
        description: "Product details have been updated",
      });
    } catch (error) {
      console.error("Error fetching product:", error);
      toast({
        title: "Error",
        description: "Failed to fetch product details. Please check the URL and try again.",
        variant: "destructive",
      });
    } finally {
      setTimeout(() => {
        setIsFetchingProduct(false);
        setFetchProgress(0);
      }, 500);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setGiftItem(newUrl);
    setSearchParams(prev => {
      prev.set("gift", newUrl);
      return prev;
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 font-roboto">
      <Header setNavOpen={setNavOpen || (() => {})} />
      <div className="container mx-auto px-4 py-8 pt-20">
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Place Order
          </h2>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="mb-4">
              <Input 
                value={giftItem}
                onChange={handleUrlChange}
                className="w-full p-2 border border-gray-300 rounded-lg"
                placeholder="Paste product link here..."
              />
            </div>
            <Button
              onClick={handlePreviewProduct}
              disabled={isFetchingProduct}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              {isFetchingProduct ? "Fetching..." : "Preview Product"}
            </Button>
            
            {isFetchingProduct && (
              <div className="mt-4">
                <Progress value={fetchProgress} className="w-full" />
                <p className="text-sm text-gray-500 mt-2">Fetching product details...</p>
              </div>
            )}
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Order Summary
          </h2>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex flex-col md:flex-row">
              <img
                src={productPreview.image}
                alt="Product"
                className="w-32 h-32 object-cover rounded-lg"
              />
              <div className="md:ml-4 mt-4 md:mt-0">
                <h3 className="text-lg font-semibold text-gray-800">
                  {productPreview.name}
                </h3>
                <p className="text-gray-600">
                  {productPreview.description}
                </p>
                <p className="text-gray-600 mt-2">
                  Price: ${productPreview.price.toFixed(2)}
                </p>
                <p className="text-gray-600">
                  Platform Fee: ${productPreview.platformFee.toFixed(2)}
                </p>
                <p className="text-gray-800 font-semibold mt-2">
                  Total: ${(productPreview.price + productPreview.platformFee).toFixed(2)}
                </p>
              </div>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="mt-4">
                <label className="block text-gray-700 font-semibold mb-2" htmlFor="message">
                  Custom Message
                </label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  placeholder="Write a custom message for the influencer..."
                  rows={4}
                />
              </div>
              
              <Button
                type="submit"
                disabled={isLoading}
                className="mt-4 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
              >
                {isLoading ? "Placing Order..." : "Place Order"}
              </Button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PlaceOrder;
