
import { Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ExtractionProgressProps {
  progress: number;
  statusMessage: string;
}

export const ExtractionProgress = ({ progress, statusMessage }: ExtractionProgressProps) => {
  return (
    <div className="mt-6">
      <Progress value={progress} className="h-2" />
      <div className="flex justify-between mt-1">
        <div className="text-center">
          <Loader2 className="h-5 w-5 animate-spin mx-auto" />
          <div className="mt-2 text-sm text-gray-600">
            {statusMessage}
          </div>
        </div>
        <p className="text-sm font-medium">{progress}%</p>
      </div>
    </div>
  );
};
