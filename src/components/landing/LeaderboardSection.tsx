
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Crown, Medal, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLeaderboard } from "@/hooks/useLeaderboard";

const LeaderboardSection = () => {
  const navigate = useNavigate();
  const { leaderboard, isLoading, currentMonth, currentYear } = useLeaderboard();

  if (isLoading) {
    return (
      <section className="mb-6 px-4">
        <div className="max-w-6xl mx-auto">
          <Card className="shadow-lg border-2 border-funky-purple/20 bg-white/95 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg lg:text-xl flex items-center text-funky-purple">
                <Trophy className="mr-2 h-5 w-5 lg:h-6 lg:w-6 text-yellow-500" />
                Top Fans This Month
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center space-x-3 animate-pulse">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-gray-200"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <section className="mb-6 px-4">
        <div className="max-w-6xl mx-auto">
          <Card className="shadow-lg border-2 border-funky-purple/20 bg-white/95 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg lg:text-xl flex items-center text-funky-purple">
                <Trophy className="mr-2 h-5 w-5 lg:h-6 lg:w-6 text-yellow-500" />
                Top Fans This Month
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center py-6">
              <Users className="h-12 w-12 lg:h-16 lg:w-16 mx-auto mb-3 text-gray-300" />
              <p className="text-sm lg:text-base text-gray-500 mb-4">No fans yet this month</p>
              <Button 
                size="sm" 
                onClick={() => navigate('/gift-selection')}
                className="bg-gradient-to-r from-funky-purple to-funky-pink text-white"
              >
                Be the First!
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  const topFans = leaderboard.slice(0, 3);

  const getPositionIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Crown className="h-4 w-4 lg:h-5 lg:w-5 text-yellow-500" />;
      case 1:
        return <Medal className="h-4 w-4 lg:h-5 lg:w-5 text-gray-400" />;
      case 2:
        return <Medal className="h-4 w-4 lg:h-5 lg:w-5 text-amber-600" />;
      default:
        return <span className="text-sm font-bold">{index + 1}</span>;
    }
  };

  return (
    <section className="mb-6 px-4">
      <div className="max-w-6xl mx-auto">
        <Card className="shadow-lg border-2 border-funky-purple/20 bg-white/95 backdrop-blur-sm hover:shadow-xl transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg lg:text-xl flex items-center text-funky-purple">
                <Trophy className="mr-2 h-5 w-5 lg:h-6 lg:w-6 text-yellow-500" />
                Top Fans This Month
              </CardTitle>
              <Badge variant="outline" className="border-funky-purple text-funky-purple">
                {currentMonth} {currentYear}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {topFans.map((fan, index) => (
                <div key={fan.fan_id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-funky-purple/5 transition-colors">
                  <div className="flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-gradient-to-r from-funky-purple to-funky-pink text-white">
                    {getPositionIcon(index)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm lg:text-base truncate text-gray-900">
                      {fan.fan_name || "Anonymous Fan"}
                    </div>
                    <div className="text-xs lg:text-sm text-gray-500 truncate">
                      {fan.favorite_influencer_name ? 
                        `Favorite: ${fan.favorite_influencer_name}` : 
                        "No favorite yet"
                      }
                    </div>
                  </div>
                  
                  <Badge 
                    variant={index === 0 ? "default" : "secondary"} 
                    className="text-xs lg:text-sm"
                  >
                    {fan.total_gifts}
                  </Badge>
                </div>
              ))}
            </div>
            
            <div className="text-center pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="border-funky-purple text-funky-purple hover:bg-funky-purple hover:text-white"
                onClick={() => navigate('/leaderboard')}
              >
                View Full Leaderboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default LeaderboardSection;
