
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, Sparkles, Trophy, Zap } from "lucide-react";

interface LeaderboardHeaderProps {
  month: string;
  year: number;
}

const LeaderboardHeader = ({ month, year }: LeaderboardHeaderProps) => {
  return (
    <div className="text-center mb-12 relative">
      {/* Decorative elements */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4">
        <Crown className="h-16 w-16 text-funky-yellow animate-bounce-subtle opacity-80" />
      </div>
      
      <Card className="backdrop-blur-md bg-white/20 border-white/30 shadow-2xl relative overflow-hidden">
        {/* Animated background sparkles */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-4 left-8">
            <Sparkles className="h-4 w-4 text-funky-yellow animate-pulse" />
          </div>
          <div className="absolute top-8 right-12 animate-spin-slow">
            <Sparkles className="h-6 w-6 text-funky-pink" />
          </div>
          <div className="absolute bottom-6 left-16 animate-bounce">
            <Trophy className="h-5 w-5 text-funky-blue" />
          </div>
          <div className="absolute bottom-4 right-8">
            <Zap className="h-4 w-4 text-funky-green animate-pulse" />
          </div>
        </div>

        <CardHeader className="pb-4 pt-12 relative z-10">
          <CardTitle className="text-5xl lg:text-6xl font-black text-white drop-shadow-lg">
            🏆 HALL OF FAME 🏆
          </CardTitle>
          <CardDescription className="text-2xl lg:text-3xl text-white font-bold mt-4 drop-shadow-md">
            <span className="text-funky-yellow">
              {month} {year} Champions
            </span>
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pb-8 relative z-10">
          <div className="flex items-center justify-center gap-4 text-white text-lg">
            <Sparkles className="h-6 w-6 text-funky-yellow animate-spin-slow" />
            <p className="font-semibold drop-shadow-md text-white">
              Celebrating our most generous gift-givers and community champions!
            </p>
            <Sparkles className="h-6 w-6 text-funky-pink animate-spin-slow" />
          </div>
          
          <div className="mt-6 flex items-center justify-center gap-8 text-white">
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-funky-yellow" />
              <span className="font-bold">Champion</span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-gray-300" />
              <span className="font-bold">Legend</span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-400" />
              <span className="font-bold">Hero</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeaderboardHeader;
