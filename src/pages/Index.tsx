
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const Index = () => {
  return (
    <div className="min-h-screen p-4 bg-background">
      <div className="max-w-4xl mx-auto">
        <Card className="p-6">
          <h1 className="text-3xl font-bold mb-4">Welcome to GiftLoop Connect</h1>
          <p className="text-muted-foreground mb-6">
            Your mobile-ready application powered by Capacitor. Start exploring the features below.
          </p>
          <div className="space-y-4">
            <Button className="w-full" size="lg">
              Get Started
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Index;
