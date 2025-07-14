
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Star, Gift, DollarSign, Heart, Edit } from "lucide-react";
import { FanProfileData } from "@/hooks/useFanProfile";
import { useNavigate } from "react-router-dom";

interface FanProfileProps {
  profile: FanProfileData;
  isCurrentUserProfile: boolean;
}

export default function FanProfile({ profile, isCurrentUserProfile }: FanProfileProps) {
  const navigate = useNavigate();

  const displayName = profile.profile_name || profile.name || 'Fan';

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="bg-white/80 backdrop-blur-sm border border-funky-purple/10">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <Avatar className="w-24 h-24 border-4 border-funky-purple/20">
              <AvatarImage 
                src={profile.profile_image_url} 
                alt={`${displayName}'s profile picture`} 
              />
              <AvatarFallback className="bg-gradient-to-r from-funky-purple to-funky-pink text-white font-semibold text-xl">
                {displayName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-funky-purple to-funky-pink bg-clip-text text-transparent mb-2">
                {displayName}
              </h1>
              {profile.name && profile.profile_name && (
                <p className="text-gray-600 mb-2">({profile.name})</p>
              )}
              <Badge variant="outline" className="border-funky-purple/30 text-funky-purple mb-4">
                <Star className="h-3 w-3 mr-1" />
                Fan
              </Badge>
              
              {profile.bio && (
                <p className="text-gray-700 mt-2">{profile.bio}</p>
              )}
            </div>
            
            {isCurrentUserProfile && (
              <Button
                onClick={() => navigate('/edit-profile')}
                variant="outline"
                className="border-funky-purple/30 text-funky-purple hover:bg-funky-purple/10"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white/80 backdrop-blur-sm border border-funky-purple/10">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-funky-purple/10 rounded-full">
              <Gift className="h-6 w-6 text-funky-purple" />
            </div>
            <div>
              <p className="text-2xl font-bold text-funky-purple">{profile.stats.giftsSent}</p>
              <p className="text-sm text-gray-600">Gifts Sent</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border border-funky-purple/10">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-funky-pink/10 rounded-full">
              <DollarSign className="h-6 w-6 text-funky-pink" />
            </div>
            <div>
              <p className="text-2xl font-bold text-funky-pink">₹{profile.stats.totalSpent.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Total Spent</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border border-funky-purple/10">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-funky-purple to-funky-pink rounded-full p-0.5">
              <div className="bg-white rounded-full p-2">
                <Heart className="h-6 w-6 text-funky-purple" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold bg-gradient-to-r from-funky-purple to-funky-pink bg-clip-text text-transparent">
                {profile.stats.favoriteInfluencers}
              </p>
              <p className="text-sm text-gray-600">Supported Influencers</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gift History */}
      <Card className="bg-white/80 backdrop-blur-sm border border-funky-purple/10">
        <CardHeader>
          <CardTitle className="text-lg bg-clip-text text-transparent bg-gradient-to-r from-funky-purple to-funky-pink">
            Recent Gift History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {profile.giftHistory.length > 0 ? (
            <div className="space-y-4">
              {profile.giftHistory.slice(0, 5).map((gift) => (
                <div key={gift.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{gift.product_title}</h4>
                    <p className="text-sm text-gray-600">To: {gift.influencer_name}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(gift.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-funky-purple">₹{gift.product_price.toLocaleString()}</p>
                    <Badge 
                      variant={gift.status === 'completed' ? 'default' : 'secondary'}
                      className={gift.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                    >
                      {gift.status}
                    </Badge>
                  </div>
                </div>
              ))}
              {profile.giftHistory.length > 5 && (
                <p className="text-center text-sm text-gray-500 mt-4">
                  And {profile.giftHistory.length - 5} more gifts...
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Gift className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No gifts sent yet</p>
              <p className="text-sm text-gray-400">Start supporting your favorite influencers!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
