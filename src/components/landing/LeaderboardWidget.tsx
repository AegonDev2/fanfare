
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
      <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-30 w-72">
        <Card className="shadow-lg border-2 border-funky-purple/20 bg-white/95 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center text-funky-purple">
                <Trophy className="mr-2 h-5 w-5 text-yellow-500" />
                Top Fans
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                {isMinimized ? <Maximize className="h-4 w-4" /> : <Minimize className="h-4 w-4" />}
              </Button>
            </div>
          </CardHeader>
          {!isMinimized && (
            <CardContent className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center space-x-3 animate-pulse">
                  <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                  <div className="flex-1 space-y-1">
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-3 bg-gray-100 rounded w-1/2"></div>
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
      <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-30 w-72">
        <Card className="shadow-lg border-2 border-funky-purple/20 bg-white/95 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center text-funky-purple">
                <Trophy className="mr-2 h-5 w-5 text-yellow-500" />
                Top Fans
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                {isMinimized ? <Maximize className="h-4 w-4" /> : <Minimize className="h-4 w-4" />}
              </Button>
            </div>
          </CardHeader>
          {!isMinimized && (
            <CardContent className="text-center py-6">
              <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm text-gray-500 mb-4">No fans yet this month</p>
              <Button 
                size="sm" 
                onClick={() => navigate('/gift-selection')}
                className="bg-gradient-to-r from-funky-purple to-funky-pink text-white"
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
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 1:
        return <Medal className="h-4 w-4 text-gray-400" />;
      case 2:
        return <Medal className="h-4 w-4 text-amber-600" />;
      default:
        return <span className="text-xs font-bold">{index + 1}</span>;
    }
  };

  return (
    <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-30 w-72">
      <Card className="shadow-lg border-2 border-funky-purple/20 bg-white/95 backdrop-blur-sm hover:shadow-xl transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-between w-full">
              <CardTitle className="text-lg flex items-center text-funky-purple">
                <Trophy className="mr-2 h-5 w-5 text-yellow-500" />
                Top Fans
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs border-funky-purple text-funky-purple">
                  {currentMonth} {currentYear}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setIsMinimized(!isMinimized)}
                >
                  {isMinimized ? <Maximize className="h-4 w-4" /> : <Minimize className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        
        {!isMinimized && (
          <CardContent className="space-y-3">
            {topFans.map((fan, index) => (
              <div key={fan.fan_id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-funky-purple/5 transition-colors">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-funky-purple to-funky-pink text-white">
                  {getPositionIcon(index)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate text-gray-900">
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
              className="w-full mt-4 border-funky-purple text-funky-purple hover:bg-funky-purple hover:text-white"
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
