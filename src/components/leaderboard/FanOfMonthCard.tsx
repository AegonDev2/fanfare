
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { UserIcon, Gift, Crown, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import type { LeaderboardEntry } from "@/hooks/useLeaderboard";

interface FanOfMonthCardProps {
  fan: LeaderboardEntry;
  rank: number;
}

const FanOfMonthCard = ({ fan, rank }: FanOfMonthCardProps) => {
  const navigate = useNavigate();
  
  const getBadgeColor = (rank: number) => {
    switch(rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-300 to-yellow-500 hover:from-yellow-400 hover:to-yellow-600";
      case 2:
        return "bg-gradient-to-r from-gray-300 to-gray-400 hover:from-gray-400 hover:to-gray-500";
      case 3:
        return "bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800";
      default:
        return "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600";
    }
  };
  
  const getIcon = (rank: number) => {
    switch(rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-400 mr-2" />;
      case 2:
        return <Trophy className="h-6 w-6 text-gray-400 mr-2" />;
      case 3:
        return <Trophy className="h-6 w-6 text-amber-700 mr-2" />;
      default:
        return <Gift className="h-6 w-6 text-funky-purple mr-2" />;
    }
  };

  return (
    <Card className="overflow-hidden border-2 border-funky-purple/20 transition-all hover:shadow-lg hover:shadow-funky-purple/10">
      <div className={`h-2 w-full ${getBadgeColor(rank)}`} />
      <CardHeader className="flex flex-row items-center justify-between pt-6">
        <div className="flex items-center">
          {getIcon(rank)}
          <h3 className="text-lg font-bold">{rank === 1 ? "Fan of the Month" : `${rank}${getRankSuffix(rank)} Place`}</h3>
        </div>
        <Badge variant="outline" className={`${rank === 1 ? "border-yellow-400 text-yellow-500" : ""}`}>
          {fan.total_gifts} Gift{fan.total_gifts === 1 ? "" : "s"}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center">
          <div className="mr-3 h-12 w-12 rounded-full bg-funky-purple/20 flex items-center justify-center">
            <UserIcon className="h-6 w-6 text-funky-purple" />
          </div>
          <div>
            <p className="font-medium">{fan.fan_name || "Anonymous Fan"}</p>
            <p className="text-sm text-gray-500">{fan.fan_email}</p>
          </div>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600">Favorite Influencer</p>
          <div className="flex items-center mt-1">
            <p className="font-medium">{fan.favorite_influencer_name || "Not specified"}</p>
          </div>
        </div>
        
        {fan.favorite_influencer_id && (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full mt-2"
            onClick={() => navigate(`/profile/${fan.favorite_influencer_id}`)}
          >
            View Influencer Profile
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

// Helper function for correct rank suffix
const getRankSuffix = (rank: number): string => {
  if (rank > 10 && rank < 20) return 'th';
  
  const lastDigit = rank % 10;
  switch(lastDigit) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
};

export default FanOfMonthCard;
