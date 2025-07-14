
import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Edit, Gift, Star, Camera, Calendar, TrendingUp, Heart, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useFanProfile } from "@/hooks/useFanProfile";
import { format } from "date-fns";

interface FanProfileProps {
  profile: {
    id: string;
    name: string | null;
    email: string;
    user_type: string;
  };
  isCurrentUserProfile: boolean;
}

const FanProfile = ({ profile, isCurrentUserProfile }: FanProfileProps) => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  
  const { fanProfile, isLoading, uploadProfileImage } = useFanProfile(profile.id);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return;
    }

    setIsUploadingImage(true);
    try {
      await uploadProfileImage(file);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'under process':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-gray-100 pb-24 py-0">
        <main className="container mx-auto px-4 py-6">
          <div className="space-y-6">
            <Skeleton className="h-48 w-full rounded-3xl" />
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-96 w-full rounded-lg" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-100 pb-24 py-0">
      <main className="container mx-auto px-4 py-6">
        <motion.section 
          className="shadow-lg p-6 mb-8 rounded-3xl bg-white/90 backdrop-blur-sm border border-funky-purple/10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Fan Profile Header */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="relative">
              <Avatar className="w-32 h-32 border-4 border-funky-purple/20">
                <AvatarImage 
                  src={fanProfile?.profile_image_url} 
                  alt={`${profile.name}'s profile picture`} 
                />
                <AvatarFallback className="bg-gradient-to-r from-funky-purple to-funky-pink text-white font-semibold text-2xl">
                  {profile.name ? profile.name.slice(0, 2).toUpperCase() : profile.email.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              {isCurrentUserProfile && (
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute -bottom-2 -right-2 rounded-full w-10 h-10 p-0 bg-white shadow-lg border-2 border-funky-purple/20 hover:bg-funky-purple/10"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingImage}
                >
                  <Camera className="h-4 w-4 text-funky-purple" />
                </Button>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
            
            <div className="flex-1">
              <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-4">
                <div className="text-center md:text-left">
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">
                    {profile.name || "Fan User"}
                  </h2>
                  <p className="text-gray-600 mb-3">{profile.email}</p>
                  <Badge variant="secondary" className="bg-gradient-to-r from-funky-purple/10 to-funky-pink/10 text-funky-purple border border-funky-purple/20">
                    <Star className="h-3 w-3 mr-1" />
                    Fan
                  </Badge>
                </div>
                
                {isCurrentUserProfile && (
                  <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                    <Button 
                      variant="outline"
                      className="flex items-center gap-2 w-full sm:w-auto border-funky-purple/30 hover:bg-funky-purple/10 text-funky-purple hover-scale"
                      onClick={() => navigate('/edit-profile')}
                    >
                      <Edit className="h-4 w-4" />
                      Edit Profile
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Fan Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8"
          >
            <Card className="p-6 bg-white/95 backdrop-blur-sm shadow-lg border border-funky-purple/10">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl bg-clip-text text-transparent bg-gradient-to-r from-funky-purple to-funky-pink flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-funky-purple" />
                  Fan Activity Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 rounded-xl bg-gradient-to-br from-funky-purple/5 to-funky-purple/10 border border-funky-purple/20 text-center hover-scale transition-all duration-200">
                    <Gift className="h-10 w-10 text-funky-purple mx-auto mb-3" />
                    <p className="text-3xl font-bold text-funky-purple mb-1">
                      {fanProfile?.stats.giftsSent || 0}
                    </p>
                    <p className="text-sm text-gray-600 font-medium">Gifts Sent</p>
                  </div>
                  
                  <div className="p-6 rounded-xl bg-gradient-to-br from-funky-pink/5 to-funky-pink/10 border border-funky-pink/20 text-center hover-scale transition-all duration-200">
                    <Heart className="h-10 w-10 text-funky-pink mx-auto mb-3" />
                    <p className="text-3xl font-bold text-funky-pink mb-1">
                      {fanProfile?.stats.favoriteInfluencers || 0}
                    </p>
                    <p className="text-sm text-gray-600 font-medium">Favorite Influencers</p>
                  </div>
                  
                  <div className="p-6 rounded-xl bg-gradient-to-br from-green-50 to-green-100 border border-green-200 text-center hover-scale transition-all duration-200">
                    <div className="h-10 w-10 bg-green-500/20 rounded-full mx-auto mb-3 flex items-center justify-center">
                      <span className="text-green-600 font-bold text-lg">₹</span>
                    </div>
                    <p className="text-3xl font-bold text-green-600 mb-1">
                      ₹{(fanProfile?.stats.totalSpent || 0).toLocaleString('en-IN')}
                    </p>
                    <p className="text-sm text-gray-600 font-medium">Total Spent</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Gift History Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8"
          >
            <Card className="p-6 bg-white/95 backdrop-blur-sm shadow-lg border border-funky-purple/10">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl bg-clip-text text-transparent bg-gradient-to-r from-funky-purple to-funky-pink flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-funky-purple" />
                  Gift History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {fanProfile?.giftHistory && fanProfile.giftHistory.length > 0 ? (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {fanProfile.giftHistory.map((gift) => (
                      <div
                        key={gift.id}
                        className="p-4 rounded-lg border border-gray-200 hover:border-funky-purple/30 transition-all duration-200 hover:shadow-md"
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-800 mb-1">
                              {gift.product_title}
                            </h4>
                            <p className="text-sm text-gray-600 mb-2">
                              For: <span className="font-medium text-funky-purple">{gift.influencer_name}</span>
                            </p>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={`text-xs ${getStatusBadgeColor(gift.status)}`}>
                                {gift.status.charAt(0).toUpperCase() + gift.status.slice(1)}
                              </Badge>
                              <span className="text-sm font-medium text-green-600">
                                ₹{gift.product_price.toLocaleString('en-IN')}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500">
                              {format(new Date(gift.created_at), 'MMM dd, yyyy')}
                              {gift.completed_at && (
                                <span> • Completed {format(new Date(gift.completed_at), 'MMM dd, yyyy')}</span>
                              )}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => navigate(`/profile/${gift.influencer_id}`)}
                            className="hover:bg-funky-purple/10 text-funky-purple"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Gift className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No gifts sent yet</p>
                    <Button
                      onClick={() => navigate('/influencers')}
                      className="bg-gradient-to-r from-funky-purple to-funky-pink hover:from-funky-pink hover:to-funky-purple"
                    >
                      Start Gifting
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-8"
          >
            <Card className="p-6 bg-white/95 backdrop-blur-sm shadow-lg border border-funky-purple/10">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl bg-clip-text text-transparent bg-gradient-to-r from-funky-purple to-funky-pink">
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    onClick={() => navigate('/influencers')}
                    className="bg-gradient-to-r from-funky-purple to-funky-pink hover:from-funky-pink hover:to-funky-purple h-12 hover-scale"
                  >
                    <Gift className="h-4 w-4 mr-2" />
                    Browse Influencers
                  </Button>
                  
                  <Button
                    onClick={() => navigate('/gifts-sent')}
                    variant="outline"
                    className="border-funky-purple/30 hover:bg-funky-purple/10 text-funky-purple h-12 hover-scale"
                  >
                    <Star className="h-4 w-4 mr-2" />
                    View All Gifts
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.section>
      </main>
    </div>
  );
};

export default FanProfile;
