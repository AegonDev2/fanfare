import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Star, Gift, Users } from "lucide-react";
import { TopCreator } from "@/hooks/useOptimizedTopCreators";
import { formatCurrency } from "@/utils/formatters";

interface TopCreatorsCardProps {
  topCreators: TopCreator[];
  isLoading: boolean;
  month: string;
  year: number;
}

export const TopCreatorsCard: React.FC<TopCreatorsCardProps> = ({
  topCreators,
  isLoading,
  month,
  year
}) => {
  const getPositionIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 1:
        return <Star className="h-5 w-5 text-gray-400" />;
      case 2:
        return <Gift className="h-5 w-5 text-amber-600" />;
      default:
        return <Users className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getPositionGradient = (index: number) => {
    switch (index) {
      case 0:
        return "from-yellow-400/20 to-yellow-600/20 border-yellow-500/30";
      case 1:
        return "from-gray-300/20 to-gray-500/20 border-gray-400/30";
      case 2:
        return "from-amber-400/20 to-amber-600/20 border-amber-500/30";
      default:
        return "from-muted/50 to-muted/30 border-border";
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-background to-muted/30">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-lg font-semibold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            🏆 Top Gifted Creators
          </CardTitle>
          <Badge variant="secondary" className="mx-auto">
            {month} {year}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50 animate-pulse">
              <div className="w-8 h-8 bg-muted rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (topCreators.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-background to-muted/30">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-lg font-semibold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            🏆 Top Gifted Creators
          </CardTitle>
          <Badge variant="secondary" className="mx-auto">
            {month} {year}
          </Badge>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Gift className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">
            No gifted creators this month yet
          </p>
          <p className="text-sm text-muted-foreground">
            Start sending gifts to see creators here!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-background to-muted/30">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-lg font-semibold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          🏆 Top Gifted Creators
        </CardTitle>
        <Badge variant="secondary" className="mx-auto">
          {month} {year}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        {topCreators.slice(0, 3).map((creator, index) => (
          <div
            key={creator.influencer_id}
            className={`flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r border transition-all duration-200 hover:scale-105 ${getPositionGradient(index)}`}
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-background/80">
              {getPositionIcon(index)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <p className="font-medium truncate">
                  {creator.influencer_name || "Anonymous Creator"}
                </p>
                {index === 0 && (
                  <Crown className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                )}
              </div>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <span className="flex items-center space-x-1">
                  <Gift className="h-3 w-3" />
                  <span>{creator.total_gifts_received} gifts</span>
                </span>
                <span>{formatCurrency(creator.total_amount_received)}</span>
              </div>
              {creator.top_fan_name && (
                <p className="text-xs text-muted-foreground truncate">
                  Top fan: {creator.top_fan_name}
                </p>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};