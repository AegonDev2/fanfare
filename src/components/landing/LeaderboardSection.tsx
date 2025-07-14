
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Crown, Medal, Users, Star, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLeaderboard } from "@/hooks/useLeaderboard";

const LeaderboardSection = () => {
  const navigate = useNavigate();
  const { leaderboard, isLoading, currentMonth, currentYear } = useLeaderboard();

  if (isLoading) {
    return (
      <section className="mb-6 px-4">
        <div className="max-w-6xl mx-auto">
          <Card className="shadow-xl border-2 border-funky-purple/30 bg-gradient-to-br from-white via-purple-50/50 to-pink-50/30 backdrop-blur-sm relative overflow-hidden">
            {/* Subtle animated background */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-4 right-8 w-16 h-16 bg-funky-yellow rounded-full animate-pulse"></div>
              <div className="absolute bottom-6 left-12 w-12 h-12 bg-funky-pink rounded-full animate-bounce"></div>
            </div>
            
            <CardHeader className="pb-3 relative z-10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl lg:text-2xl flex items-center bg-gradient-to-r from-funky-purple to-funky-pink bg-clip-text text-transparent font-bold">
                  <Trophy className="mr-2 h-6 w-6 lg:h-7 lg:w-7 text-funky-yellow animate-pulse" />
                  Top Fans This Month
                </CardTitle>
                <Badge variant="outline" className="border-funky-purple/50 text-funky-purple bg-funky-purple/5">
                  {currentMonth} {currentYear}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center space-x-3 animate-pulse p-3 rounded-lg bg-white/30">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-gradient-to-r from-gray-200 to-gray-300"></div>
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
          <Card className="shadow-xl border-2 border-funky-purple/30 bg-gradient-to-br from-white via-purple-50/50 to-pink-50/30 backdrop-blur-sm relative overflow-hidden">
            {/* Subtle animated background */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-4 right-8 w-16 h-16 bg-funky-yellow rounded-full animate-pulse"></div>
              <div className="absolute bottom-6 left-12 w-12 h-12 bg-funky-pink rounded-full animate-bounce"></div>
            </div>
            
            <CardHeader className="pb-3 relative z-10">
              <CardTitle className="text-xl lg:text-2xl flex items-center bg-gradient-to-r from-funky-purple to-funky-pink bg-clip-text text-transparent font-bold">
                <Trophy className="mr-2 h-6 w-6 lg:h-7 lg:w-7 text-funky-yellow animate-pulse" />
                Top Fans This Month
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center py-8 relative z-10">
              <div className="bg-white/40 rounded-2xl p-6 backdrop-blur-sm">
                <Users className="h-16 w-16 lg:h-20 lg:w-20 mx-auto mb-4 text-funky-purple/60" />
                <p className="text-base lg:text-lg text-funky-purple font-semibold mb-4">Be the first to make history!</p>
                <Button 
                  size="lg" 
                  onClick={() => navigate('/gift-selection')}
                  className="bg-gradient-to-r from-funky-purple to-funky-pink text-white hover:from-funky-pink hover:to-funky-purple shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Start Gifting
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  const topFans = leaderboard.slice(0, 3);

  const getPositionDisplay = (index: number) => {
    switch (index) {
      case 0:
        return {
          icon: Crown,
          gradient: "from-yellow-400 to-yellow-600",
          textColor: "text-yellow-600",
          bgColor: "bg-gradient-to-br from-yellow-50 to-yellow-100",
          borderColor: "border-yellow-300",
          title: "Champion"
        };
      case 1:
        return {
          icon: Medal,
          gradient: "from-gray-400 to-gray-600", 
          textColor: "text-gray-600",
          bgColor: "bg-gradient-to-br from-gray-50 to-gray-100",
          borderColor: "border-gray-300",
          title: "Legend"
        };
      case 2:
        return {
          icon: Medal,
          gradient: "from-amber-500 to-amber-700",
          textColor: "text-amber-600",
          bgColor: "bg-gradient-to-br from-amber-50 to-amber-100", 
          borderColor: "border-amber-300",
          title: "Hero"
        };
      default:
        return {
          icon: Star,
          gradient: "from-purple-400 to-pink-500",
          textColor: "text-purple-600",
          bgColor: "bg-gradient-to-br from-purple-50 to-pink-50",
          borderColor: "border-purple-300",
          title: "Star"
        };
    }
  };

  return (
    <section className="mb-6 px-4">
      <div className="max-w-6xl mx-auto">
        <Card className="shadow-xl border-2 border-funky-purple/30 bg-gradient-to-br from-white via-purple-50/50 to-pink-50/30 backdrop-blur-sm hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
          {/* Subtle animated background elements */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-4 right-8 w-16 h-16 bg-funky-yellow rounded-full animate-pulse"></div>
            <div className="absolute bottom-6 left-12 w-12 h-12 bg-funky-pink rounded-full animate-bounce"></div>
            <div className="absolute top-1/2 left-8 w-8 h-8 bg-funky-blue rounded-full animate-ping"></div>
          </div>
          
          <CardHeader className="pb-4 relative z-10">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl lg:text-2xl flex items-center bg-gradient-to-r from-funky-purple to-funky-pink bg-clip-text text-transparent font-bold">
                <Trophy className="mr-2 h-6 w-6 lg:h-7 lg:w-7 text-funky-yellow animate-pulse" />
                Top Fans This Month
              </CardTitle>
              <Badge variant="outline" className="border-funky-purple/50 text-funky-purple bg-funky-purple/10 backdrop-blur-sm">
                {currentMonth} {currentYear}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {topFans.map((fan, index) => {
                const display = getPositionDisplay(index);
                const IconComponent = display.icon;
                
                return (
                  <div key={fan.fan_id} className={`${display.bgColor} ${display.borderColor} border-2 rounded-2xl p-4 hover:scale-105 transition-all duration-300 hover:shadow-lg backdrop-blur-sm relative overflow-hidden`}>
                    {/* Rank indicator */}
                    <div className="flex items-center justify-between mb-3">
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r ${display.gradient} text-white text-sm font-bold shadow-sm`}>
                        <IconComponent className="h-4 w-4" />
                        <span>{display.title}</span>
                      </div>
                      <div className="text-2xl font-black text-gray-300">#{index + 1}</div>
                    </div>
                    
                    {/* Fan avatar */}
                    <div className="text-center mb-3">
                      <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-r ${display.gradient} flex items-center justify-center text-white text-xl font-bold shadow-lg`}>
                        {fan.fan_name ? fan.fan_name.charAt(0).toUpperCase() : "?"}
                      </div>
                    </div>
                    
                    {/* Fan details */}
                    <div className="text-center space-y-2">
                      <div className={`font-bold text-lg ${display.textColor} truncate`}>
                        {fan.fan_name || "Anonymous Fan"}
                      </div>
                      
                      <div className="text-sm text-gray-600 truncate">
                        {fan.favorite_influencer_name ? 
                          `Favorite: ${fan.favorite_influencer_name}` : 
                          "No favorite yet"
                        }
                      </div>
                      
                      {/* Gift count */}
                      <div className="flex items-center justify-center gap-2 mt-3">
                        <Trophy className={`h-4 w-4 ${display.textColor}`} />
                        <span className={`text-2xl font-black ${display.textColor}`}>
                          {fan.total_gifts}
                        </span>
                        <span className="text-sm text-gray-500">
                          gift{fan.total_gifts !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="text-center pt-4">
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 border-funky-purple/50 text-funky-purple hover:bg-gradient-to-r hover:from-funky-purple hover:to-funky-pink hover:text-white hover:border-transparent font-semibold px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm bg-white/50"
                onClick={() => navigate('/leaderboard')}
              >
                <Trophy className="mr-2 h-4 w-4" />
                View Hall of Fame
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default LeaderboardSection;
