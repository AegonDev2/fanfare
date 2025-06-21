
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInfluencers, useInfluencerCategories, DatabaseInfluencer } from '@/hooks/useInfluencers';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Filter, Users, Gift, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Influencers() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const { data: influencers = [], isLoading } = useInfluencers(searchQuery, categoryFilter);
  const { data: categories = [] } = useInfluencerCategories();

  const handleProfileClick = (id: string) => {
    navigate(`/profile/${id}`);
  };

  const handleGiftClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/place-order?influencer=${id}`);
  };

  const formatFollowers = (count: number) => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M';
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K';
    }
    return count.toString();
  };

  const InfluencerCard = ({ influencer }: { influencer: DatabaseInfluencer }) => (
    <Card 
      className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border-funky-purple/20 hover:border-funky-purple/40"
      onClick={() => handleProfileClick(influencer.id)}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16 border-2 border-funky-purple/20">
            <AvatarImage src={influencer.profile_image || undefined} alt={influencer.name} />
            <AvatarFallback className="bg-funky-purple/20 text-funky-purple font-semibold">
              {influencer.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg text-gray-900 truncate group-hover:text-funky-purple transition-colors">
                  {influencer.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs bg-funky-purple/10 text-funky-purple">
                    {influencer.platform}
                  </Badge>
                  {influencer.category && (
                    <Badge variant="outline" className="text-xs border-funky-pink/30 text-funky-pink capitalize">
                      {influencer.category}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1 mt-2 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>{formatFollowers(influencer.followers)} followers</span>
                </div>
              </div>
              
              <Button
                size="sm"
                onClick={(e) => handleGiftClick(influencer.id, e)}
                className="bg-funky-pink hover:bg-funky-pink/90 text-white shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Gift className="h-4 w-4 mr-1" />
                Gift
              </Button>
            </div>
            
            {influencer.about && (
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                {influencer.about}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="text-funky-purple hover:bg-funky-purple/10"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-funky-purple to-funky-pink bg-clip-text text-transparent">
            All Influencers
          </h1>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search influencers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-funky-purple/20 focus:border-funky-purple"
            />
          </div>
          
          <div className="flex items-center gap-2 sm:w-auto">
            <Filter className="h-4 w-4 text-gray-400" />
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[180px] border-funky-purple/20">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category} className="capitalize">
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Count */}
        {!isLoading && (
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              {influencers.length} influencer{influencers.length !== 1 ? 's' : ''} found
              {searchQuery && ` for "${searchQuery}"`}
              {categoryFilter !== 'all' && ` in ${categoryFilter}`}
            </p>
          </div>
        )}

        {/* Influencers Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="p-4">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-16 w-16 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : influencers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {influencers.map((influencer) => (
              <InfluencerCard key={influencer.id} influencer={influencer} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No influencers found</h3>
            <p className="text-gray-500 mb-4">
              Try adjusting your search terms or filters to find what you're looking for.
            </p>
            <Button
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('all');
              }}
              variant="outline"
              className="border-funky-purple/30 text-funky-purple hover:bg-funky-purple/10"
            >
              Clear filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
