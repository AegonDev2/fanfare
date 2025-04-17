
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

interface ProductUrlFormProps {
  onSubmit: (url: string) => Promise<void>;
  isLoading: boolean;
}

export const ProductUrlForm = ({ onSubmit, isLoading }: ProductUrlFormProps) => {
  const [url, setUrl] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(url);
  };

  return (
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
      </div>
      
      <Alert className="bg-blue-50 border-blue-200">
        <AlertDescription className="text-sm text-blue-700">
          Try this example: 
          <span className="text-xs mt-1 block font-mono break-all">
            https://www.flipkart.com/timex-automatic-black-dial-analog-watch-men/p/itm5d039dcaeb0c8?pid=WATGPGR7QCYTFHRG
          </span>
        </AlertDescription>
      </Alert>
    </form>
  );
};
