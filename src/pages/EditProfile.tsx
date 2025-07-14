
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/hooks/useUser";
import { User, MapPin, Shirt, Plus, X } from "lucide-react";
import FloatingHeader from '@/components/ui/floating-header';
import Navbar from '@/components/navigation/Navbar';
import { useInfluencerProfile } from "@/hooks/useInfluencerProfile";
import { useInfluencerWishlist } from "@/hooks/useInfluencerWishlist";
import WishlistGrid from "@/components/wishlist/WishlistGrid";

interface AddressFormData {
  street_address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_primary: boolean;
}

interface ProfileFormData {
  name: string;
  about: string;
  platform: string;
  followers: number;
  hobbies: string[];
  instagram_url: string;
  youtube_url: string;
  twitter_url: string;
  facebook_url: string;
  tiktok_url: string;
  category: string;
}

interface SizeFormData {
  tshirt_size: string;
  pants_waist: string;
  pants_length: string;
  shoe_size: string;
  food_preferences: string[];
}

export default function EditProfile() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { toast } = useToast();
  const [navOpen, setNavOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'sizes' | 'addresses' | 'wishlist'>('profile');
  const [newHobby, setNewHobby] = useState('');
  const [newFoodPref, setNewFoodPref] = useState('');
  const [addresses, setAddresses] = useState<any[]>([]);
  const [showAddressForm, setShowAddressForm] = useState(false);

  const { influencer, updateProfile, updateSizePreferences, isUpdating } = useInfluencerProfile(user?.id || null);
  const { 
    wishlist, 
    isLoading: isLoadingWishlist, 
    addWishlistItem, 
    removeWishlistItem 
  } = useInfluencerWishlist(user?.id || '');

  const [profileData, setProfileData] = useState<ProfileFormData>({
    name: "",
    about: "",
    platform: "",
    followers: 0,
    hobbies: [],
    instagram_url: "",
    youtube_url: "",
    twitter_url: "",
    facebook_url: "",
    tiktok_url: "",
    category: "",
  });

  const [sizeData, setSizeData] = useState<SizeFormData>({
    tshirt_size: "",
    pants_waist: "",
    pants_length: "",
    shoe_size: "",
    food_preferences: [],
  });

  const [addressData, setAddressData] = useState<AddressFormData>({
    street_address: "",
    city: "",
    state: "",
    postal_code: "",
    country: "India",
    is_primary: true,
  });

  useEffect(() => {
    if (influencer) {
      setProfileData({
        name: influencer.name || "",
        about: influencer.about || "",
        platform: influencer.platform || "",
        followers: influencer.followers || 0,
        hobbies: influencer.hobbies || [],
        instagram_url: influencer.instagram_url || "",
        youtube_url: influencer.youtube_url || "",
        twitter_url: influencer.twitter_url || "",
        facebook_url: influencer.facebook_url || "",
        tiktok_url: influencer.tiktok_url || "",
        category: influencer.category || "",
      });

      if (influencer.size_preferences) {
        setSizeData({
          tshirt_size: influencer.size_preferences.tshirt_size || "",
          pants_waist: influencer.size_preferences.pants_waist || "",
          pants_length: influencer.size_preferences.pants_length || "",
          shoe_size: influencer.size_preferences.shoe_size || "",
          food_preferences: influencer.size_preferences.food_preferences || [],
        });
      }
    }

    fetchAddresses();
  }, [influencer]);

  const fetchAddresses = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('influencer_addresses')
        .select('*')
        .eq('influencer_id', user.id)
        .order('is_primary', { ascending: false });

      if (error) throw error;
      setAddresses(data || []);
    } catch (error: any) {
      console.error("Error fetching addresses:", error);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await updateProfile(profileData);
    if (success) {
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    }
  };

  const handleSizeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await updateSizePreferences(sizeData);
    if (success) {
      toast({
        title: "Size preferences updated",
        description: "Your size preferences have been updated successfully.",
      });
    }
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('influencer_addresses')
        .insert([{
          ...addressData,
          influencer_id: user.id,
        }]);

      if (error) throw error;

      toast({
        title: "Address added",
        description: "Your address has been added successfully.",
      });

      setAddressData({
        street_address: "",
        city: "",
        state: "",
        postal_code: "",
        country: "India",
        is_primary: false,
      });
      setShowAddressForm(false);
      fetchAddresses();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add address.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteAddress = async (addressId: string) => {
    try {
      const { error } = await supabase
        .from('influencer_addresses')
        .delete()
        .eq('id', addressId);

      if (error) throw error;

      toast({
        title: "Address deleted",
        description: "Address has been removed successfully.",
      });
      fetchAddresses();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete address.",
        variant: "destructive",
      });
    }
  };

  const addHobby = () => {
    if (newHobby.trim() && !profileData.hobbies.includes(newHobby.trim())) {
      setProfileData(prev => ({
        ...prev,
        hobbies: [...prev.hobbies, newHobby.trim()]
      }));
      setNewHobby('');
    }
  };

  const removeHobby = (hobby: string) => {
    setProfileData(prev => ({
      ...prev,
      hobbies: prev.hobbies.filter(h => h !== hobby)
    }));
  };

  const addFoodPreference = () => {
    if (newFoodPref.trim() && !sizeData.food_preferences.includes(newFoodPref.trim())) {
      setSizeData(prev => ({
        ...prev,
        food_preferences: [...prev.food_preferences, newFoodPref.trim()]
      }));
      setNewFoodPref('');
    }
  };

  const removeFoodPreference = (pref: string) => {
    setSizeData(prev => ({
      ...prev,
      food_preferences: prev.food_preferences.filter(p => p !== pref)
    }));
  };

  const handleAddWishlistItem = async (item: any): Promise<void> => {
    try {
      await addWishlistItem(item);
    } catch (error) {
      console.error("Error adding wishlist item:", error);
    }
  };

  return (
    <>
      <FloatingHeader setNavOpen={setNavOpen} />
      <Navbar isOpen={navOpen} setIsOpen={setNavOpen} />
      
      <div className="min-h-screen bg-background pt-20 p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-funky-purple to-funky-pink bg-clip-text text-transparent">
              Edit Profile
            </h1>
            <p className="text-gray-600 mt-2">Manage your profile information, sizes, addresses, and wishlist</p>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2 mb-6 border-b">
            {[
              { key: 'profile', label: 'Profile', icon: User },
              { key: 'sizes', label: 'Sizes', icon: Shirt },
              { key: 'addresses', label: 'Addresses', icon: MapPin },
              { key: 'wishlist', label: 'Wishlist', icon: Plus },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-colors ${
                  activeTab === key
                    ? 'bg-funky-purple text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Display Name</Label>
                      <Input
                        id="name"
                        value={profileData.name}
                        onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="platform">Platform</Label>
                      <Select
                        value={profileData.platform}
                        onValueChange={(value) => setProfileData(prev => ({ ...prev, platform: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select platform" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Instagram">Instagram</SelectItem>
                          <SelectItem value="YouTube">YouTube</SelectItem>
                          <SelectItem value="TikTok">TikTok</SelectItem>
                          <SelectItem value="Twitter">Twitter</SelectItem>
                          <SelectItem value="Facebook">Facebook</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="followers">Followers</Label>
                      <Input
                        id="followers"
                        type="number"
                        value={profileData.followers}
                        onChange={(e) => setProfileData(prev => ({ ...prev, followers: parseInt(e.target.value) || 0 }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={profileData.category}
                        onValueChange={(value) => setProfileData(prev => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lifestyle">Lifestyle</SelectItem>
                          <SelectItem value="fashion">Fashion</SelectItem>
                          <SelectItem value="tech">Tech</SelectItem>
                          <SelectItem value="fitness">Fitness</SelectItem>
                          <SelectItem value="food">Food</SelectItem>
                          <SelectItem value="travel">Travel</SelectItem>
                          <SelectItem value="gaming">Gaming</SelectItem>
                          <SelectItem value="beauty">Beauty</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="about">About</Label>
                    <Textarea
                      id="about"
                      value={profileData.about}
                      onChange={(e) => setProfileData(prev => ({ ...prev, about: e.target.value }))}
                      rows={3}
                    />
                  </div>

                  {/* Social Media URLs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="instagram_url">Instagram URL</Label>
                      <Input
                        id="instagram_url"
                        type="url"
                        value={profileData.instagram_url}
                        onChange={(e) => setProfileData(prev => ({ ...prev, instagram_url: e.target.value }))}
                        placeholder="https://instagram.com/username"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="youtube_url">YouTube URL</Label>
                      <Input
                        id="youtube_url"
                        type="url"
                        value={profileData.youtube_url}
                        onChange={(e) => setProfileData(prev => ({ ...prev, youtube_url: e.target.value }))}
                        placeholder="https://youtube.com/channel/..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="twitter_url">Twitter URL</Label>
                      <Input
                        id="twitter_url"
                        type="url"
                        value={profileData.twitter_url}
                        onChange={(e) => setProfileData(prev => ({ ...prev, twitter_url: e.target.value }))}
                        placeholder="https://twitter.com/username"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tiktok_url">TikTok URL</Label>
                      <Input
                        id="tiktok_url"
                        type="url"
                        value={profileData.tiktok_url}
                        onChange={(e) => setProfileData(prev => ({ ...prev, tiktok_url: e.target.value }))}
                        placeholder="https://tiktok.com/@username"
                      />
                    </div>
                  </div>

                  {/* Hobbies */}
                  <div className="space-y-2">
                    <Label>Hobbies</Label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        value={newHobby}
                        onChange={(e) => setNewHobby(e.target.value)}
                        placeholder="Add a hobby"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addHobby())}
                      />
                      <Button type="button" onClick={addHobby} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {profileData.hobbies.map((hobby, index) => (
                        <span
                          key={index}
                          className="bg-funky-purple/10 text-funky-purple px-3 py-1 rounded-full text-sm flex items-center gap-1"
                        >
                          {hobby}
                          <button
                            type="button"
                            onClick={() => removeHobby(hobby)}
                            className="hover:bg-funky-purple/20 rounded-full p-1"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <Button disabled={isUpdating} className="bg-funky-purple hover:bg-funky-purple/90">
                    {isUpdating ? "Updating..." : "Update Profile"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Sizes Tab */}
          {activeTab === 'sizes' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shirt className="h-5 w-5" />
                  Size Preferences
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSizeSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="tshirt_size">T-Shirt Size</Label>
                      <Select
                        value={sizeData.tshirt_size}
                        onValueChange={(value) => setSizeData(prev => ({ ...prev, tshirt_size: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="XS">XS</SelectItem>
                          <SelectItem value="S">S</SelectItem>
                          <SelectItem value="M">M</SelectItem>
                          <SelectItem value="L">L</SelectItem>
                          <SelectItem value="XL">XL</SelectItem>
                          <SelectItem value="XXL">XXL</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pants_waist">Pants Waist</Label>
                      <Input
                        id="pants_waist"
                        value={sizeData.pants_waist}
                        onChange={(e) => setSizeData(prev => ({ ...prev, pants_waist: e.target.value }))}
                        placeholder="e.g., 32"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pants_length">Pants Length</Label>
                      <Input
                        id="pants_length"
                        value={sizeData.pants_length}
                        onChange={(e) => setSizeData(prev => ({ ...prev, pants_length: e.target.value }))}
                        placeholder="e.g., 34"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="shoe_size">Shoe Size</Label>
                      <Input
                        id="shoe_size"
                        value={sizeData.shoe_size}
                        onChange={(e) => setSizeData(prev => ({ ...prev, shoe_size: e.target.value }))}
                        placeholder="e.g., 9"
                      />
                    </div>
                  </div>

                  {/* Food Preferences */}
                  <div className="space-y-2">
                    <Label>Food Preferences</Label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        value={newFoodPref}
                        onChange={(e) => setNewFoodPref(e.target.value)}
                        placeholder="Add food preference"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFoodPreference())}
                      />
                      <Button type="button" onClick={addFoodPreference} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {sizeData.food_preferences.map((pref, index) => (
                        <span
                          key={index}
                          className="bg-funky-purple/10 text-funky-purple px-3 py-1 rounded-full text-sm flex items-center gap-1"
                        >
                          {pref}
                          <button
                            type="button"
                            onClick={() => removeFoodPreference(pref)}
                            className="hover:bg-funky-purple/20 rounded-full p-1"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <Button disabled={isUpdating} className="bg-funky-purple hover:bg-funky-purple/90">
                    {isUpdating ? "Updating..." : "Update Size Preferences"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Addresses Tab */}
          {activeTab === 'addresses' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Addresses
                  </div>
                  <Button 
                    onClick={() => setShowAddressForm(!showAddressForm)}
                    size="sm"
                    className="bg-funky-purple hover:bg-funky-purple/90"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Address
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {showAddressForm && (
                  <form onSubmit={handleAddressSubmit} className="mb-6 p-4 border rounded-lg bg-gray-50">
                    <h3 className="text-lg font-medium mb-4">Add New Address</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="street_address">Street Address</Label>
                        <Input
                          id="street_address"
                          value={addressData.street_address}
                          onChange={(e) => setAddressData(prev => ({ ...prev, street_address: e.target.value }))}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={addressData.city}
                          onChange={(e) => setAddressData(prev => ({ ...prev, city: e.target.value }))}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          value={addressData.state}
                          onChange={(e) => setAddressData(prev => ({ ...prev, state: e.target.value }))}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="postal_code">Postal Code</Label>
                        <Input
                          id="postal_code"
                          value={addressData.postal_code}
                          onChange={(e) => setAddressData(prev => ({ ...prev, postal_code: e.target.value }))}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Input
                          id="country"
                          value={addressData.country}
                          onChange={(e) => setAddressData(prev => ({ ...prev, country: e.target.value }))}
                          required
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button 
                        type="submit" 
                        disabled={loading}
                        className="bg-funky-purple hover:bg-funky-purple/90"
                      >
                        {loading ? "Adding..." : "Add Address"}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setShowAddressForm(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}

                <div className="space-y-4">
                  {addresses.map((address) => (
                    <div key={address.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">
                            {address.street_address}
                          </p>
                          <p className="text-gray-600">
                            {address.city}, {address.state} {address.postal_code}
                          </p>
                          <p className="text-gray-600">{address.country}</p>
                          {address.is_primary && (
                            <span className="text-xs bg-funky-purple text-white px-2 py-1 rounded mt-2 inline-block">
                              Primary
                            </span>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteAddress(address.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {addresses.length === 0 && (
                    <p className="text-gray-500 text-center py-8">
                      No addresses added yet. Click "Add Address" to get started.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Wishlist Tab */}
          {activeTab === 'wishlist' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  My Wishlist
                </CardTitle>
              </CardHeader>
              <CardContent>
                <WishlistGrid 
                  wishlist={wishlist}
                  isLoading={isLoadingWishlist}
                  isOwner={true}
                  onAddItem={handleAddWishlistItem}
                  onRemoveItem={removeWishlistItem}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
