import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Crown, Medal, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLeaderboard } from "@/hooks/useLeaderboard";

const AndroidLeaderboard = () => {
  const navigate = useNavigate();
  const { leaderboard, isLoading, currentMonth, currentYear } = useLeaderboard();
  const [currentIndex, setCurrentIndex] = useState(0);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card className="border-2 border-gradient-primary/20 bg-gradient-subtle/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center text-gradient-primary">
                <Trophy className="mr-2 h-5 w-5 text-primary" />
                Top Fans This Month
              </CardTitle>
              <Badge variant="outline" className="border-primary text-primary">
                {currentMonth} {currentYear}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2].map(i => (
                <div key={i} className="flex items-center space-x-3 animate-pulse">
                  <div className="w-12 h-12 rounded-full bg-muted"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-2/3"></div>
                    <div className="h-3 bg-muted/60 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card className="border-2 border-gradient-primary/20 bg-gradient-subtle/50 backdrop-blur-sm text-center">
          <CardContent className="pt-8 pb-6">
            <Trophy className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2 text-foreground">No champions yet!</h3>
            <p className="text-muted-foreground mb-4">Be the first to send gifts this month</p>
            <Button 
              onClick={() => navigate('/gift-selection')}
              className="bg-gradient-primary text-primary-foreground"
            >
              Send Your First Gift
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const topFans = leaderboard.slice(0, 2);
  
  const getRankBadge = (index: number) => {
    if (index === 0) {
      return (
        <Badge className="bg-gradient-primary text-primary-foreground">
          <Crown className="w-3 h-3 mr-1" />
          Champion
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
        <Medal className="w-3 h-3 mr-1" />
        Legend
      </Badge>
    );
  };

  const getRankNumber = (index: number) => {
    return `#${index + 1}`;
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <Card className="border-2 border-gradient-primary/20 bg-gradient-subtle/50 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center text-gradient-primary">
              <Trophy className="mr-2 h-5 w-5 text-primary" />
              Top Fans This Month
            </CardTitle>
            <Badge variant="outline" className="border-primary text-primary">
              {currentMonth} {currentYear}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {topFans.map((fan, index) => (
            <div 
              key={fan.fan_id} 
              className={`relative p-4 rounded-2xl border-2 ${
                index === 0 
                  ? 'bg-gradient-primary/10 border-primary/30' 
                  : 'bg-secondary/20 border-secondary/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                    index === 0 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-secondary text-secondary-foreground'
                  }`}>
                    {fan.fan_name?.charAt(0).toUpperCase() || 'F'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {fan.fan_name || "Anonymous Fan"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Favorite: {fan.favorite_influencer_name || "No favorite yet"}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary mb-1">
                    {getRankNumber(index)}
                  </div>
                  {getRankBadge(index)}
                  <p className="text-sm text-muted-foreground mt-1">
                    <Trophy className="w-3 h-3 inline mr-1" />
                    {fan.total_gifts} gift{fan.total_gifts !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          <Button 
            variant="outline" 
            className="w-full mt-4 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            onClick={() => navigate('/leaderboard')}
          >
            <Trophy className="w-4 h-4 mr-2" />
            View Hall of Fame
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AndroidLeaderboard;