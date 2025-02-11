
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/landing/Header";

interface PlaceOrderProps {
  setNavOpen?: (isOpen: boolean) => void;
}

interface ProductDetails {
  name: string;
  description: string;
  price: number;
  platformFee: number;
  image: string;
}

const PlaceOrder = ({ setNavOpen }: PlaceOrderProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingProduct, setIsFetchingProduct] = useState(false);
  const [productPreview, setProductPreview] = useState<ProductDetails>({
    name: "Stylish Handbag",
    description: "A stylish handbag perfect for any occasion. Made from high-quality materials and designed to be both functional and fashionable.",
    price: 49.99,
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

      const { error } = await supabase.from("orders").insert({
        user_id: user.id,
        influencer_id: influencerId,
        product_url: giftItem,
        message: message,
        status: "pending"
      });

      if (error) throw error;

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

    setIsFetchingProduct(true);
    try {
      // Here we would typically make an API call to fetch product details
      // For now, we'll simulate a fetch with a timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock product data based on URL
      const mockProduct = {
        name: "Product from " + new URL(giftItem).hostname,
        description: "Product details fetched from the provided URL. This is a placeholder description.",
        price: Math.floor(Math.random() * 100) + 20,
        platformFee: 5.00,
        image: "https://storage.googleapis.com/a1aa/image/tSbIqbP_qJMzV8bfuyM7gaSttRX2Pi5K-jl57IlWP44.jpg"
      };

      setProductPreview(mockProduct);
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
      setIsFetchingProduct(false);
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
                alt="Product image"
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
