import React, { useState, memo } from 'react';
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Crown, Medal, Users, Star, Sparkles, ChevronLeft, ChevronRight, Gift } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useOptimizedLeaderboard } from "@/hooks/useOptimizedLeaderboard";
import { useOptimizedTopCreators } from "@/hooks/useOptimizedTopCreators";
import { TopCreatorsCard } from "@/components/leaderboard/TopCreatorsCard";
const LeaderboardSection = memo(() => {
  const navigate = useNavigate();
  const {
    data: leaderboardData,
    isLoading
  } = useOptimizedLeaderboard();
  const {
    data: creatorsData,
    isLoading: creatorsLoading
  } = useOptimizedTopCreators();
  
  const [currentView, setCurrentView] = useState<'fans' | 'creators'>('fans');
  
  // Extract data from the new hook structure
  const leaderboard = leaderboardData?.leaderboard || [];
  const currentMonth = leaderboardData?.currentMonth || '';
  const currentYear = leaderboardData?.currentYear || 0;
  const topCreators = creatorsData?.topCreators || [];
  const switchView = (direction: 'left' | 'right') => {
    if (direction === 'left') {
      setCurrentView(currentView === 'fans' ? 'creators' : 'fans');
    } else {
      setCurrentView(currentView === 'fans' ? 'creators' : 'fans');
    }
  };
  const renderFansLeaderboard = () => {
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
    return <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {topFans.map((fan, index) => {
        const display = getPositionDisplay(index);
        const IconComponent = display.icon;
        return <div key={fan.fan_id} className={`${display.bgColor} ${display.borderColor} border-2 rounded-xl p-3 hover:scale-105 transition-all duration-300 hover:shadow-lg backdrop-blur-sm relative overflow-hidden`}>
              {/* Rank indicator */}
              <div className="flex items-center justify-between mb-2">
                <div className={`flex items-center gap-2 px-2 py-1 rounded-full bg-gradient-to-r ${display.gradient} text-white text-xs font-bold shadow-sm`}>
                  <IconComponent className="h-3 w-3" />
                  <span>{display.title}</span>
                </div>
                <div className="text-lg font-black text-gray-300">#{index + 1}</div>
              </div>
              
              {/* Fan avatar */}
              <div className="text-center mb-2">
                <div className={`w-12 h-12 mx-auto rounded-full bg-gradient-to-r ${display.gradient} flex items-center justify-center text-white text-base font-bold shadow-lg`}>
                  {fan.fan_name ? fan.fan_name.charAt(0).toUpperCase() : "?"}
                </div>
              </div>
              
              {/* Fan details */}
              <div className="text-center space-y-1">
                <div className={`font-bold text-sm ${display.textColor} truncate`}>
                  {fan.fan_name || "Anonymous Fan"}
                </div>
                
                <div className="text-xs text-gray-600 truncate">
                  {fan.favorite_influencer_name ? `Favorite: ${fan.favorite_influencer_name}` : "No favorite yet"}
                </div>
                
                {/* Gift count */}
                <div className="flex items-center justify-center gap-1 mt-2">
                  <Trophy className={`h-3 w-3 ${display.textColor}`} />
                  <span className={`text-lg font-black ${display.textColor}`}>
                    {fan.total_gifts}
                  </span>
                  <span className="text-xs text-gray-500">
                    gift{fan.total_gifts !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>;
      })}
      </div>;
  };
  const renderCreatorsLeaderboard = () => {
    const topCreatorsData = topCreators.slice(0, 3);
    const getCreatorPositionDisplay = (index: number) => {
      switch (index) {
        case 0:
          return {
            icon: Crown,
            gradient: "from-purple-400 to-purple-600",
            textColor: "text-purple-600",
            bgColor: "bg-gradient-to-br from-purple-50 to-purple-100",
            borderColor: "border-purple-300",
            title: "Top Creator"
          };
        case 1:
          return {
            icon: Gift,
            gradient: "from-pink-400 to-pink-600",
            textColor: "text-pink-600",
            bgColor: "bg-gradient-to-br from-pink-50 to-pink-100",
            borderColor: "border-pink-300",
            title: "Rising Star"
          };
        case 2:
          return {
            icon: Star,
            gradient: "from-blue-400 to-blue-600",
            textColor: "text-blue-600",
            bgColor: "bg-gradient-to-br from-blue-50 to-blue-100",
            borderColor: "border-blue-300",
            title: "Beloved"
          };
        default:
          return {
            icon: Star,
            gradient: "from-indigo-400 to-indigo-600",
            textColor: "text-indigo-600",
            bgColor: "bg-gradient-to-br from-indigo-50 to-indigo-100",
            borderColor: "border-indigo-300",
            title: "Popular"
          };
      }
    };
    if (creatorsLoading) {
      return <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="flex items-center space-x-3 animate-pulse p-4 rounded-lg bg-white/30">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-gray-200 to-gray-300"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-100 rounded w-1/2"></div>
              </div>
            </div>)}
        </div>;
    }
    if (topCreatorsData.length === 0) {
      return <div className="text-center py-8">
          <Gift className="h-16 w-16 text-purple-300 mx-auto mb-4" />
          <p className="text-purple-600 font-semibold mb-2">No creators with gifts yet!</p>
          <p className="text-sm text-gray-500">Be the first to send a gift to your favorite creator!</p>
        </div>;
    }
    return <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {topCreatorsData.map((creator, index) => {
        const display = getCreatorPositionDisplay(index);
        const IconComponent = display.icon;
        return <div key={creator.influencer_id} className={`${display.bgColor} ${display.borderColor} border-2 rounded-xl p-3 hover:scale-105 transition-all duration-300 hover:shadow-lg backdrop-blur-sm relative overflow-hidden`}>
              {/* Rank indicator */}
              <div className="flex items-center justify-between mb-2">
                <div className={`flex items-center gap-2 px-2 py-1 rounded-full bg-gradient-to-r ${display.gradient} text-white text-xs font-bold shadow-sm`}>
                  <IconComponent className="h-3 w-3" />
                  <span>{display.title}</span>
                </div>
                <div className="text-lg font-black text-gray-300">#{index + 1}</div>
              </div>
              
              {/* Creator avatar */}
              <div className="text-center mb-2">
                <div className={`w-12 h-12 mx-auto rounded-full bg-gradient-to-r ${display.gradient} flex items-center justify-center text-white text-base font-bold shadow-lg`}>
                  {creator.influencer_name ? creator.influencer_name.charAt(0).toUpperCase() : "?"}
                </div>
              </div>
              
              {/* Creator details */}
              <div className="text-center space-y-1">
                <div className={`font-bold text-sm ${display.textColor} truncate`}>
                  {creator.influencer_name || "Anonymous Creator"}
                </div>
                
                <div className="text-xs text-gray-600 truncate">
                  {creator.top_fan_name ? `Top Fan: ${creator.top_fan_name}` : "No top fan yet"}
                </div>
                
                {/* Gift count */}
                <div className="flex items-center justify-center gap-1 mt-2">
                  <Gift className={`h-3 w-3 ${display.textColor}`} />
                  <span className={`text-lg font-black ${display.textColor}`}>
                    {creator.total_gifts_received}
                  </span>
                  <span className="text-xs text-gray-500">
                    gift{creator.total_gifts_received !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>;
      })}
      </div>;
  };
  if (isLoading && creatorsLoading) {
    return <section className="mb-6 px-4">
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
                  Loading Leaderboards...
                </CardTitle>
                <Badge variant="outline" className="border-funky-purple/50 text-funky-purple bg-funky-purple/5">
                  {currentMonth} {currentYear}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
              {[1, 2, 3].map(i => <div key={i} className="flex items-center space-x-3 animate-pulse p-2 rounded-lg bg-white/30">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-gradient-to-r from-gray-200 to-gray-300"></div>
                  <div className="flex-1 space-y-1">
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-2 bg-gray-100 rounded w-1/2"></div>
                  </div>
                </div>)}
            </CardContent>
          </Card>
        </div>
      </section>;
  }
  if (leaderboard.length === 0 && topCreators.length === 0) {
    return <section className="mb-6 px-4">
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
                Leaderboards This Month
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center py-6 relative z-10">
              <div className="bg-white/40 rounded-2xl p-4 backdrop-blur-sm">
                <Users className="h-12 w-12 lg:h-16 lg:w-16 mx-auto mb-3 text-funky-purple/60" />
                <p className="text-base lg:text-lg text-funky-purple font-semibold mb-3">Be the first to make history!</p>
                <Button size="lg" onClick={() => navigate('/gift-selection')} className="bg-gradient-to-r from-funky-purple to-funky-pink text-white hover:from-funky-pink hover:to-funky-purple shadow-lg hover:shadow-xl transition-all duration-300">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Start Gifting
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>;
  }
  return <section className="mb-6 px-4">
      <div className="max-w-6xl mx-auto">
        <Card className="shadow-xl border-2 border-funky-purple/30 bg-gradient-to-br from-white via-purple-50/50 to-pink-50/30 backdrop-blur-sm hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
          {/* Subtle animated background elements */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-4 right-8 w-16 h-16 bg-funky-yellow rounded-full animate-pulse"></div>
            <div className="absolute bottom-6 left-12 w-12 h-12 bg-funky-pink rounded-full animate-bounce"></div>
            <div className="absolute top-1/2 left-8 w-8 h-8 bg-funky-blue rounded-full animate-ping"></div>
          </div>
          
          <CardHeader className="pb-3 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" onClick={() => switchView('left')} className="p-1 h-8 w-8 rounded-full bg-white/50 hover:bg-white/80 transition-all duration-200">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <CardTitle className="lg:text-2xl flex items-center bg-gradient-to-r from-funky-purple to-funky-pink bg-clip-text text-transparent font-bold text-base">
                  {currentView === 'fans' ? <>
                      <Trophy className="mr-2 h-6 w-6 lg:h-7 lg:w-7 text-funky-yellow" />
                      Top Fans This Month
                    </> : <>
                      <Gift className="mr-2 h-6 w-6 lg:h-7 lg:w-7 text-funky-purple" />
                      Top Gifted Creators
                    </>}
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => switchView('right')} className="p-1 h-8 w-8 rounded-full bg-white/50 hover:bg-white/80 transition-all duration-200">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <Badge variant="outline" className="border-funky-purple/50 text-funky-purple bg-funky-purple/10 backdrop-blur-sm">
                {currentMonth} {currentYear}
              </Badge>
            </div>
            
            {/* View indicator dots */}
            <div className="flex justify-center space-x-2 mt-2">
              <div className={`w-2 h-2 rounded-full transition-all duration-200 ${currentView === 'fans' ? 'bg-funky-purple' : 'bg-gray-300'}`} />
              <div className={`w-2 h-2 rounded-full transition-all duration-200 ${currentView === 'creators' ? 'bg-funky-purple' : 'bg-gray-300'}`} />
            </div>
          </CardHeader>
          
          <CardContent className="space-y-3 relative z-10 pb-4">
            <div className="transition-all duration-300">
              {currentView === 'fans' ? renderFansLeaderboard() : renderCreatorsLeaderboard()}
            </div>
            
            <div className="text-center pt-3">
              <Button variant="outline" size="lg" className="border-2 border-funky-purple/50 text-funky-purple hover:bg-gradient-to-r hover:from-funky-purple hover:to-funky-pink hover:text-white hover:border-transparent font-semibold px-6 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm bg-white/50" onClick={() => navigate('/leaderboard')}>
                <Trophy className="mr-2 h-4 w-4" />
                View Hall of Fame
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>;
});

LeaderboardSection.displayName = 'LeaderboardSection';

export default LeaderboardSection;