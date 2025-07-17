
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Gift, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useInfluencers, DatabaseInfluencer } from '@/hooks/useInfluencers';
import { useUser } from '@/hooks/useUser';

interface InfluencerSelectorProps {
  onSelect: (influencerId: string) => void;
  selectedInfluencerId: string | null;
}

export default function InfluencerSelector({ onSelect, selectedInfluencerId }: InfluencerSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: influencers = [], isLoading } = useInfluencers(searchQuery);
  const { user } = useUser();

  // Filter out the current user to prevent self-gifting
  const filteredInfluencers = influencers.filter(influencer => influencer.id !== user?.id);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <Loader2 className="h-8 w-8 text-funky-purple animate-spin" />
        <p className="mt-2 text-sm text-gray-500">Loading influencers...</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-4">
        <Input
          type="search"
          placeholder="Search influencers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full border-funky-purple/20 focus:border-funky-purple"
        />
      </div>

      {filteredInfluencers.length === 0 ? (
        <div className="text-center py-8 border rounded-md border-dashed border-gray-300">
          <p className="text-gray-500">No influencers found</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
          {filteredInfluencers.map((influencer) => (
            <div
              key={influencer.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer",
                selectedInfluencerId === influencer.id
                  ? "border-funky-purple bg-funky-purple/5 shadow-sm"
                  : "border-gray-200 hover:border-funky-purple/30 hover:bg-gray-50"
              )}
              onClick={() => onSelect(influencer.id)}
            >
              <Avatar className="h-12 w-12 border">
                <AvatarImage src={influencer.profile_image || undefined} alt={influencer.name} />
                <AvatarFallback className="bg-funky-purple/20">
                  {influencer.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <h4 className="font-medium">{influencer.name}</h4>
                <p className="text-xs text-gray-500">
                  {influencer.platform} • {influencer.followers.toLocaleString()} followers
                  {influencer.category && ` • ${influencer.category}`}
                </p>
              </div>
              
              {selectedInfluencerId === influencer.id && (
                <Check className="h-5 w-5 text-funky-purple" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
