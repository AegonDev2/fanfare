import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Crown, Trophy, Medal, Star, Sparkles, Gift, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { LeaderboardEntry } from "@/hooks/useLeaderboard";
interface LeaderboardShowcaseProps {
  leaderboard: LeaderboardEntry[];
  isLoading: boolean;
  currentMonth: string;
  currentYear: number;
  onMonthYearChange: (month: string, year: number) => void;
}
const LeaderboardShowcase = ({
  leaderboard,
  isLoading,
  currentMonth,
  currentYear,
  onMonthYearChange
}: LeaderboardShowcaseProps) => {
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const years = Array.from({
    length: 5
  }, (_, i) => (new Date().getFullYear() - i).toString());
  const handleFilterChange = () => {
    onMonthYearChange(selectedMonth, parseInt(selectedYear));
  };
  const getRankDisplay = (rank: number) => {
    switch (rank) {
      case 1:
        return {
          icon: Crown,
          title: "👑 CHAMPION",
          gradient: "from-yellow-300 via-yellow-400 to-yellow-600",
          textColor: "text-yellow-900",
          bgColor: "bg-gradient-to-br from-yellow-100 to-yellow-200",
          borderColor: "border-yellow-400",
          shadowColor: "shadow-yellow-400/30",
          animation: ""
        };
      case 2:
        return {
          icon: Trophy,
          title: "🥈 LEGEND",
          gradient: "from-gray-300 via-gray-400 to-gray-500",
          textColor: "text-gray-900",
          bgColor: "bg-gradient-to-br from-gray-100 to-gray-200",
          borderColor: "border-gray-400",
          shadowColor: "shadow-gray-400/30",
          animation: ""
        };
      case 3:
        return {
          icon: Medal,
          title: "🥉 HERO",
          gradient: "from-amber-600 via-amber-700 to-amber-800",
          textColor: "text-amber-900",
          bgColor: "bg-gradient-to-br from-amber-100 to-amber-200",
          borderColor: "border-amber-500",
          shadowColor: "shadow-amber-500/30",
          animation: ""
        };
      default:
        return {
          icon: Star,
          title: "⭐ STAR",
          gradient: "from-purple-500 via-pink-500 to-purple-600",
          textColor: "text-purple-900",
          bgColor: "bg-gradient-to-br from-purple-100 to-pink-100",
          borderColor: "border-purple-400",
          shadowColor: "shadow-purple-400/30",
          animation: ""
        };
    }
  };
  if (isLoading) {
    return <div className="space-y-8">
        {/* Filter section */}
        <Card className="backdrop-blur-md bg-white/20 border-white/30">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 animate-pulse">
              <div className="h-10 bg-white/20 rounded w-48"></div>
              <div className="h-10 bg-white/20 rounded w-32"></div>
              <div className="h-10 bg-white/20 rounded w-24"></div>
            </div>
          </CardContent>
        </Card>

        {/* Loading podium */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => <div key={i} className="animate-pulse">
              <div className="h-80 bg-white/20 rounded-2xl backdrop-blur-md border border-white/30"></div>
            </div>)}
        </div>
      </div>;
  }
  return <div className="space-y-8">
      {/* Enhanced Filter Section */}
      <Card className="backdrop-blur-md bg-white/20 border-white/30 shadow-2xl">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <Sparkles className="h-6 w-6 text-funky-yellow animate-pulse" />
            <h3 className="text-xl font-bold text-white">Select Competition Period</h3>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-full sm:w-48 bg-white/30 border-white/40 text-white">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                {months.map(month => <SelectItem key={month} value={month}>{month}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-full sm:w-32 bg-white/30 border-white/40 text-white">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {years.map(year => <SelectItem key={year} value={year}>{year}</SelectItem>)}
              </SelectContent>
            </Select>

            <Button onClick={handleFilterChange} className="bg-gradient-to-r from-funky-purple to-funky-pink hover:from-funky-pink hover:to-funky-purple text-white font-bold px-8 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <Zap className="h-4 w-4 mr-2" />
              Update Rankings
            </Button>
          </div>
        </CardContent>
      </Card>

      {leaderboard.length === 0 ? <Card className="backdrop-blur-md bg-white/20 border-white/30 shadow-2xl">
          <CardContent className="text-center py-16">
            <Gift className="h-24 w-24 mx-auto mb-6 text-white/60" />
            <h3 className="text-2xl font-bold text-white mb-4">No Champions Yet!</h3>
            <p className="text-white/80 text-lg">
              Be the first to claim the throne in {currentMonth} {currentYear}
            </p>
          </CardContent>
        </Card> : <>
          {/* Champions Podium - Top 3 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {leaderboard.slice(0, 3).map((fan, index) => {
          const rank = index + 1;
          const display = getRankDisplay(rank);
          const IconComponent = display.icon;
          return <Card key={fan.fan_id} className={`${display.bgColor} ${display.borderColor} border-2 ${display.shadowColor} shadow-2xl backdrop-blur-md transform hover:scale-105 transition-all duration-500 relative overflow-hidden`}>
                  {/* Sparkle effects for champion */}
                  {rank === 1 && <>
                      <div className="absolute top-4 right-4 animate-spin-slow">
                        <Sparkles className="h-6 w-6 text-yellow-500" />
                      </div>
                      <div className="absolute bottom-4 left-4">
                        <Sparkles className="h-4 w-4 text-yellow-600 animate-pulse" />
                      </div>
                    </>}

                  <CardContent className="p-8 text-center relative z-10">
                    {/* Rank Badge */}
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${display.gradient} mb-6 shadow-lg`}>
                      <IconComponent className="h-6 w-6 text-white" />
                      <span className="font-black text-white text-lg tracking-wider">
                        {display.title}
                      </span>
                    </div>

                    {/* Fan Avatar */}
                    <div className="relative mb-6">
                      <div className={`w-24 h-24 mx-auto rounded-full bg-gradient-to-br ${display.gradient} flex items-center justify-center shadow-xl`}>
                        <span className="text-3xl font-black text-white">
                          {fan.fan_name ? fan.fan_name.charAt(0).toUpperCase() : "?"}
                        </span>
                      </div>
                      {rank === 1 && <div className="absolute -top-2 -right-2">
                          <Crown className="h-8 w-8 text-yellow-500 animate-bounce" />
                        </div>}
                    </div>

                    {/* Fan Details */}
                    <h3 className={`text-2xl font-bold ${display.textColor} mb-2`}>
                      {fan.fan_name || "Anonymous Champion"}
                    </h3>
                    
                    

                    {/* Gift Count */}
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <Gift className={`h-5 w-5 ${display.textColor}`} />
                      <span className={`text-3xl font-black ${display.textColor}`}>
                        {fan.total_gifts}
                      </span>
                      <span className="text-gray-700 text-sm">
                        gift{fan.total_gifts !== 1 ? 's' : ''}
                      </span>
                    </div>

                    {/* Favorite Influencer */}
                    {fan.favorite_influencer_name && <Badge variant="secondary" className="bg-white/50 text-gray-800 border-gray-400 hover:bg-white/70 transition-colors">
                        💝 {fan.favorite_influencer_name}
                      </Badge>}
                  </CardContent>
                </Card>;
        })}
          </div>

          {/* Rising Stars - Remaining participants */}
          {leaderboard.length > 3 && <Card className="backdrop-blur-md bg-white/20 border-white/30 shadow-2xl">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-8">
                  <Star className="h-8 w-8 text-funky-yellow animate-pulse" />
                  <h2 className="text-3xl font-bold text-white">Rising Stars</h2>
                  <Sparkles className="h-6 w-6 text-funky-pink animate-spin-slow" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {leaderboard.slice(3).map((fan, index) => {
              const rank = index + 4;
              return <Card key={fan.fan_id} className="bg-gradient-to-br from-white/30 to-purple-100/40 border-purple-300 backdrop-blur-sm hover:scale-105 transition-all duration-300">
                        <CardContent className="p-6 text-center">
                          <div className="flex items-center justify-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                              #{rank}
                            </div>
                            <Star className="h-5 w-5 text-purple-600" />
                          </div>
                          
                          <h4 className="text-lg font-bold text-purple-900 mb-2">
                            {fan.fan_name || "Anonymous Star"}
                          </h4>
                          
                          <div className="flex items-center justify-center gap-2 mb-3">
                            <Gift className="h-4 w-4 text-purple-600" />
                            <span className="text-xl font-bold text-purple-900">
                              {fan.total_gifts}
                            </span>
                            <span className="text-purple-700 text-sm">
                              gift{fan.total_gifts !== 1 ? 's' : ''}
                            </span>
                          </div>

                          {fan.favorite_influencer_name && <Badge variant="outline" className="border-purple-400 text-purple-800 text-xs">
                              💝 {fan.favorite_influencer_name}
                            </Badge>}
                        </CardContent>
                      </Card>;
            })}
                </div>
              </CardContent>
            </Card>}
        </>}
    </div>;
};
export default LeaderboardShowcase;