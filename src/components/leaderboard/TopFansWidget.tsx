
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, Trophy, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LeaderboardEntry } from "@/hooks/useLeaderboard";
import { useIsMobile } from "@/hooks/use-mobile";

interface TopFansWidgetProps {
  topFans: LeaderboardEntry[];
  isLoading: boolean;
  month: string;
  year: number;
}

const TopFansWidget = ({ topFans, isLoading, month, year }: TopFansWidgetProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  if (isLoading) {
    return (
      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className={isMobile ? "px-3 py-2" : undefined}>
          <CardTitle className="flex items-center text-base sm:text-lg">
            <Trophy className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
            <span>Top Fans</span>
          </CardTitle>
        </CardHeader>
        <CardContent className={`space-y-3 ${isMobile ? "px-3 py-2" : ""}`}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-200 animate-pulse"></div>
              <div className="space-y-1 flex-1">
                <div className="h-3 sm:h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                <div className="h-2 sm:h-3 bg-gray-100 rounded animate-pulse w-1/3"></div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (topFans.length === 0) {
    return (
      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className={isMobile ? "px-3 py-2" : undefined}>
          <CardTitle className="flex items-center text-base sm:text-lg">
            <Trophy className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
            <span>Top Fans</span>
          </CardTitle>
        </CardHeader>
        <CardContent className={isMobile ? "px-3 py-2" : undefined}>
          <div className="text-center py-3 sm:py-4">
            <Users className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-2 text-gray-300" />
            <p className="text-xs sm:text-sm text-gray-500">No fans have completed gifts yet this month.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const displayFans = topFans.slice(0, 3);

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className={isMobile ? "px-3 py-2" : undefined}>
        <CardTitle className="flex items-center justify-between text-base sm:text-lg">
          <div className="flex items-center">
            <Trophy className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
            <span>Top Fans ({month})</span>
          </div>
          <Badge variant="outline" className="text-[10px] sm:text-xs">
            {month} {year}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className={`space-y-3 ${isMobile ? "px-3 py-2" : ""}`}>
        {displayFans.map((fan, index) => (
          <div key={fan.fan_id} className="flex items-center space-x-2 sm:space-x-3">
            <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-funky-purple to-funky-pink text-white font-bold text-xs sm:text-sm">
              {index === 0 ? <Award className="h-3 w-3 sm:h-4 sm:w-4" /> : index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-xs sm:text-sm truncate">{fan.fan_name || "Anonymous Fan"}</div>
              <div className="text-[10px] sm:text-xs text-gray-500 truncate">
                {fan.favorite_influencer_name ? `Favorite: ${fan.favorite_influencer_name}` : "No favorite yet"}
              </div>
            </div>
            <Badge variant={index === 0 ? "default" : "secondary"} className="ml-auto text-[10px] sm:text-xs">
              {fan.total_gifts} gift{fan.total_gifts !== 1 ? "s" : ""}
            </Badge>
          </div>
        ))}

        <Button 
          variant="outline" 
          className="w-full mt-1 text-[10px] sm:text-xs py-1 sm:py-2" 
          onClick={() => navigate('/leaderboard')}
        >
          View Full Leaderboard
        </Button>
      </CardContent>
    </Card>
  );
};

export default TopFansWidget;
