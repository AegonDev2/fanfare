
import { Card, CardContent } from "@/components/ui/card";
import { Package } from "lucide-react";

export const EmptyGiftsState = () => {
  return (
    <Card className="p-12 text-center bg-white shadow-sm">
      <CardContent className="pt-6">
        <Package className="h-16 w-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-xl font-semibold mb-2">No Gifts Found</h3>
        <p className="text-gray-600">You haven't sent any gifts yet.</p>
      </CardContent>
    </Card>
  );
};
