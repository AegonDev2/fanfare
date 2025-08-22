import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ErrorFallbackProps {
  error?: Error | null;
  onRetry?: () => void;
  showHomeButton?: boolean;
  title?: string;
  description?: string;
}

export const ErrorFallback = ({ 
  error, 
  onRetry, 
  showHomeButton = true, 
  title = "Something went wrong",
  description 
}: ErrorFallbackProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-[400px] p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <h2 className="text-xl font-semibold text-foreground">{title}</h2>
          <p className="text-muted-foreground">
            {description || error?.message || "An unexpected error occurred"}
          </p>
          <div className="flex flex-col gap-3 pt-4">
            {onRetry && (
              <Button onClick={onRetry} variant="default" className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            )}
            {showHomeButton && (
              <Button 
                onClick={() => navigate('/')} 
                variant="outline" 
                className="w-full"
              >
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const NetworkErrorFallback = ({ onRetry }: { onRetry?: () => void }) => {
  return (
    <ErrorFallback
      title="Network Error"
      description="Unable to connect to the server. Please check your internet connection and try again."
      onRetry={onRetry}
    />
  );
};

export const DataErrorFallback = ({ onRetry }: { onRetry?: () => void }) => {
  return (
    <ErrorFallback
      title="Loading Error" 
      description="Failed to load data. This might be a temporary issue."
      onRetry={onRetry}
    />
  );
};