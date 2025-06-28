
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Edit, Gift, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-100 pb-24 bg-rose-100 py-0">
      <main className="container mx-auto px-4 py-6 bg-rose-100">
        <motion.section 
          className="shadow-md p-6 mb-8 rounded-3xl bg-white/80 backdrop-blur-sm border border-funky-purple/10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Fan Profile Header */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <Avatar className="w-32 h-32 border-4 border-funky-purple/20">
              <AvatarImage src="" alt={`${profile.name}'s profile picture`} />
              <AvatarFallback className="bg-funky-purple/20 text-funky-purple font-semibold text-2xl">
                {profile.name ? profile.name.slice(0, 2).toUpperCase() : profile.email.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-4">
                <div className="text-center md:text-left">
                  <h2 className="text-2xl font-semibold text-gray-800">
                    {profile.name || "Fan User"}
                  </h2>
                  <p className="text-gray-600 mb-2">{profile.email}</p>
                  <Badge variant="secondary" className="bg-funky-purple/10 text-funky-purple">
                    <Star className="h-3 w-3 mr-1" />
                    Fan
                  </Badge>
                </div>
                
                {isCurrentUserProfile && (
                  <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                    <Button 
                      variant="outline"
                      className="flex items-center gap-2 w-full sm:w-auto border-funky-purple/20 hover:bg-funky-purple/10 text-funky-purple"
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
            <Card className="p-6 bg-white/90 backdrop-blur-sm shadow-md border border-funky-purple/10">
              <h3 className="text-lg font-medium mb-4 bg-clip-text text-transparent bg-gradient-to-r from-funky-purple to-funky-pink">
                Fan Activity
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 rounded-lg bg-funky-purple/5 border border-funky-purple/10 text-center">
                  <Gift className="h-8 w-8 text-funky-purple mx-auto mb-2" />
                  <p className="text-2xl font-bold text-funky-purple">0</p>
                  <p className="text-sm text-gray-600">Gifts Sent</p>
                </div>
                
                <div className="p-4 rounded-lg bg-funky-pink/5 border border-funky-pink/10 text-center">
                  <Star className="h-8 w-8 text-funky-pink mx-auto mb-2" />
                  <p className="text-2xl font-bold text-funky-pink">0</p>
                  <p className="text-sm text-gray-600">Favorite Influencers</p>
                </div>
                
                <div className="p-4 rounded-lg bg-funky-blue/5 border border-funky-blue/10 text-center">
                  <div className="h-8 w-8 bg-funky-blue/20 rounded-full mx-auto mb-2 flex items-center justify-center">
                    <span className="text-funky-blue font-bold text-sm">₹</span>
                  </div>
                  <p className="text-2xl font-bold text-funky-blue">₹0</p>
                  <p className="text-sm text-gray-600">Total Spent</p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8"
          >
            <Card className="p-6 bg-white/90 backdrop-blur-sm shadow-md border border-funky-purple/10">
              <h3 className="text-lg font-medium mb-4 bg-clip-text text-transparent bg-gradient-to-r from-funky-purple to-funky-pink">
                Quick Actions
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  onClick={() => navigate('/influencers')}
                  className="bg-gradient-to-r from-funky-purple to-funky-pink hover:from-funky-pink hover:to-funky-purple h-12"
                >
                  <Gift className="h-4 w-4 mr-2" />
                  Browse Influencers
                </Button>
                
                <Button
                  onClick={() => navigate('/gifts-sent')}
                  variant="outline"
                  className="border-funky-purple/20 hover:bg-funky-purple/10 text-funky-purple h-12"
                >
                  <Star className="h-4 w-4 mr-2" />
                  View Gift History
                </Button>
              </div>
            </Card>
          </motion.div>
        </motion.section>
      </main>
    </div>
  );
};

export default FanProfile;
