
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Crown, Medal, Users, Minimize, Maximize } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLeaderboard } from "@/hooks/useLeaderboard";

const LeaderboardWidget = () => {
  const navigate = useNavigate();
  const { leaderboard, isLoading, currentMonth, currentYear } = useLeaderboard();
  const [isMinimized, setIsMinimized] = useState(false);

  if (isLoading) {
    return (
      <div className="fixed right-2 md:right-4 top-1/2 transform -translate-y-1/2 z-30 w-64 md:w-72">
        <Card className="shadow-lg border-2 border-funky-purple/20 bg-white/95 backdrop-blur-sm">
          <CardHeader className="pb-2 md:pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base md:text-lg flex items-center text-funky-purple">
                <Trophy className="mr-1 md:mr-2 h-4 w-4 md:h-5 md:w-5 text-yellow-500" />
                Top Fans
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 md:h-6 md:w-6"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                {isMinimized ? <Maximize className="h-3 w-3 md:h-4 md:w-4" /> : <Minimize className="h-3 w-3 md:h-4 md:w-4" />}
              </Button>
            </div>
          </CardHeader>
          {!isMinimized && (
            <CardContent className="space-y-2 md:space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center space-x-2 md:space-x-3 animate-pulse">
                  <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gray-200"></div>
                  <div className="flex-1 space-y-1">
                    <div className="h-3 md:h-4 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-2 md:h-3 bg-gray-100 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </CardContent>
          )}
        </Card>
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <div className="fixed right-2 md:right-4 top-1/2 transform -translate-y-1/2 z-30 w-64 md:w-72">
        <Card className="shadow-lg border-2 border-funky-purple/20 bg-white/95 backdrop-blur-sm">
          <CardHeader className="pb-2 md:pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base md:text-lg flex items-center text-funky-purple">
                <Trophy className="mr-1 md:mr-2 h-4 w-4 md:h-5 md:w-5 text-yellow-500" />
                Top Fans
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 md:h-6 md:w-6"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                {isMinimized ? <Maximize className="h-3 w-3 md:h-4 md:w-4" /> : <Minimize className="h-3 w-3 md:h-4 md:w-4" />}
              </Button>
            </div>
          </CardHeader>
          {!isMinimized && (
            <CardContent className="text-center py-4 md:py-6">
              <Users className="h-8 w-8 md:h-12 md:w-12 mx-auto mb-2 md:mb-3 text-gray-300" />
              <p className="text-xs md:text-sm text-gray-500 mb-3 md:mb-4">No fans yet this month</p>
              <Button 
                size="sm" 
                onClick={() => navigate('/gift-selection')}
                className="bg-gradient-to-r from-funky-purple to-funky-pink text-white text-xs md:text-sm"
              >
                Be the First!
              </Button>
            </CardContent>
          )}
        </Card>
      </div>
    );
  }

  const topFans = leaderboard.slice(0, 3);

  const getPositionIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Crown className="h-3 w-3 md:h-4 md:w-4 text-yellow-500" />;
      case 1:
        return <Medal className="h-3 w-3 md:h-4 md:w-4 text-gray-400" />;
      case 2:
        return <Medal className="h-3 w-3 md:h-4 md:w-4 text-amber-600" />;
      default:
        return <span className="text-xs font-bold">{index + 1}</span>;
    }
  };

  return (
    <div className="fixed right-2 md:right-4 top-1/2 transform -translate-y-1/2 z-30 w-64 md:w-72">
      <Card className="shadow-lg border-2 border-funky-purple/20 bg-white/95 backdrop-blur-sm hover:shadow-xl transition-shadow">
        <CardHeader className="pb-2 md:pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-between w-full">
              <CardTitle className="text-base md:text-lg flex items-center text-funky-purple">
                <Trophy className="mr-1 md:mr-2 h-4 w-4 md:h-5 md:w-5 text-yellow-500" />
                Top Fans
              </CardTitle>
              <div className="flex items-center space-x-1 md:space-x-2">
                <Badge variant="outline" className="text-xs border-funky-purple text-funky-purple">
                  {currentMonth} {currentYear}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 md:h-6 md:w-6"
                  onClick={() => setIsMinimized(!isMinimized)}
                >
                  {isMinimized ? <Maximize className="h-3 w-3 md:h-4 md:w-4" /> : <Minimize className="h-3 w-3 md:h-4 md:w-4" />}
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        
        {!isMinimized && (
          <CardContent className="space-y-2 md:space-y-3">
            {topFans.map((fan, index) => (
              <div key={fan.fan_id} className="flex items-center space-x-2 md:space-x-3 p-1 md:p-2 rounded-lg hover:bg-funky-purple/5 transition-colors">
                <div className="flex items-center justify-center w-6 h-6 md:w-8 md:h-8 rounded-full bg-gradient-to-r from-funky-purple to-funky-pink text-white">
                  {getPositionIcon(index)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-xs md:text-sm truncate text-gray-900">
                    {fan.fan_name || "Anonymous Fan"}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {fan.favorite_influencer_name ? 
                      `Favorite: ${fan.favorite_influencer_name}` : 
                      "No favorite yet"
                    }
                  </div>
                </div>
                
                <Badge 
                  variant={index === 0 ? "default" : "secondary"} 
                  className="text-xs"
                >
                  {fan.total_gifts}
                </Badge>
              </div>
            ))}
            
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full mt-3 md:mt-4 border-funky-purple text-funky-purple hover:bg-funky-purple hover:text-white text-xs md:text-sm"
              onClick={() => navigate('/leaderboard')}
            >
              View Full Leaderboard
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default LeaderboardWidget;
