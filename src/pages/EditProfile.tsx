
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import Header from "@/components/landing/Header";
import type { InfluencerAddress } from "@/types/order";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useInfluencerProfile, SizePreferences } from "@/hooks/useInfluencerProfile";

const EditProfile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [addresses, setAddresses] = useState<InfluencerAddress[]>([]);
  const [newAddress, setNewAddress] = useState({
    street_address: "",
    city: "",
    state: "",
    postal_code: "",
    country: "India",
  });
  const [userId, setUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    platform: "",
    followers: 0,
    about: "",
    profile_image: "",
    youtube_url: "",
    instagram_url: "",
    twitter_url: "",
    facebook_url: "",
    hobbies: [] as string[],
    newHobby: ""
  });
  
  const [newFoodPreference, setNewFoodPreference] = useState("");
  
  const { 
    influencer, 
    isLoading: profileLoading,
    updateSizePreferences,
    isUpdating: isUpdatingPreferences 
  } = useInfluencerProfile(userId);

  // Set up form for size preferences
  const sizePreferencesSchema = z.object({
    tshirt_size: z.string().optional(),
    pants_waist: z.string().optional(),
    pants_length: z.string().optional(),
    shoe_size: z.string().optional(),
    food_preferences: z.array(z.string()).default([])
  });

  const sizePreferencesForm = useForm<z.infer<typeof sizePreferencesSchema>>({
    resolver: zodResolver(sizePreferencesSchema),
    defaultValues: {
      tshirt_size: "",
      pants_waist: "",
      pants_length: "",
      shoe_size: "",
      food_preferences: []
    }
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    
    checkAuth();
  }, []);

  useEffect(() => {
    if (influencer?.size_preferences) {
      sizePreferencesForm.reset({
        tshirt_size: influencer.size_preferences.tshirt_size || "",
        pants_waist: influencer.size_preferences.pants_waist || "",
        pants_length: influencer.size_preferences.pants_length || "",
        shoe_size: influencer.size_preferences.shoe_size || "",
        food_preferences: influencer.size_preferences.food_preferences || []
      });
    }
  }, [influencer]);

  useEffect(() => {
    fetchProfile();
    fetchAddresses();
  }, [userId]);

  const fetchAddresses = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("influencer_addresses")
        .select("*")
        .eq("influencer_id", user.id);

      if (error) throw error;
      
      const transformedAddresses: InfluencerAddress[] = data.map(addr => ({
        id: addr.id,
        influencer_id: addr.influencer_id,
        street_address: addr.street_address,
        address_line1: addr.street_address, // For backward compatibility
        city: addr.city,
        state: addr.state,
        postal_code: addr.postal_code,
        country: addr.country,
        phone: "Not provided", // Default value
        name: "Address", // Default value
        is_primary: addr.is_primary,
        created_at: addr.created_at
      }));
      
      setAddresses(transformedAddresses);
    } catch (error: any) {
      console.error("Error fetching addresses:", error);
      toast({
        title: "Error",
        description: "Failed to load addresses",
        variant: "destructive"
      });
    }
  };

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Not authenticated",
          description: "Please sign in first",
          variant: "destructive"
        });
        navigate("/auth");
        return;
      }

      const { data: profile, error } = await supabase
        .from("influencer_profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        throw error;
      }

      setFormData({
        ...profile,
        newHobby: "",
        hobbies: profile.hobbies || []
      });
    } catch (error: any) {
      console.error("Error fetching profile:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load profile",
        variant: "destructive"
      });
      navigate("/");
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file",
          variant: "destructive"
        });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Image size should be less than 5MB",
          variant: "destructive"
        });
        return;
      }

      setUploadingImage(true);

      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('profile_images')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('profile_images')
        .getPublicUrl(filePath);

      setFormData(prev => ({
        ...prev,
        profile_image: publicUrl
      }));

      toast({
        title: "Success",
        description: "Image uploaded successfully"
      });
    } catch (error: any) {
      console.error("Error uploading image:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload image",
        variant: "destructive"
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Not authenticated");
      }

      const { error } = await supabase
        .from("influencer_profiles")
        .update({
          name: formData.name,
          platform: formData.platform,
          followers: formData.followers,
          about: formData.about,
          profile_image: formData.profile_image,
          youtube_url: formData.youtube_url || null,
          instagram_url: formData.instagram_url || null,
          twitter_url: formData.twitter_url || null,
          facebook_url: formData.facebook_url || null,
          hobbies: formData.hobbies
        })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Your profile has been updated!"
      });
      
      navigate(`/profile/${user.id}`);
    } catch (error: any) {
      console.error("Error in handleSubmit:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitSizePreferences = async (data: z.infer<typeof sizePreferencesSchema>) => {
    if (!userId) return;
    
    const success = await updateSizePreferences(data as SizePreferences);
    if (success) {
      toast({
        title: "Success",
        description: "Size preferences updated successfully"
      });
    }
  };

  const addFoodPreference = () => {
    if (!newFoodPreference.trim()) return;
    
    const currentPreferences = sizePreferencesForm.getValues().food_preferences || [];
    if (!currentPreferences.includes(newFoodPreference.trim())) {
      sizePreferencesForm.setValue('food_preferences', [
        ...currentPreferences, 
        newFoodPreference.trim()
      ]);
      setNewFoodPreference("");
    }
  };

  const removeFoodPreference = (pref: string) => {
    const currentPreferences = sizePreferencesForm.getValues().food_preferences || [];
    sizePreferencesForm.setValue(
      'food_preferences', 
      currentPreferences.filter(p => p !== pref)
    );
  };

  const addHobby = () => {
    if (formData.newHobby.trim() && !formData.hobbies.includes(formData.newHobby.trim())) {
      setFormData(prev => ({
        ...prev,
        hobbies: [...prev.hobbies, prev.newHobby.trim()],
        newHobby: ""
      }));
    }
  };

  const removeHobby = (hobby: string) => {
    setFormData(prev => ({
      ...prev,
      hobbies: prev.hobbies.filter(h => h !== hobby)
    }));
  };

  const handleAddAddress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      if (!newAddress.street_address || !newAddress.city || !newAddress.state || !newAddress.postal_code) {
        toast({
          title: "Error",
          description: "Please fill in all address fields",
          variant: "destructive"
        });
        return;
      }

      const { data, error } = await supabase
        .from("influencer_addresses")
        .insert({
          ...newAddress,
          influencer_id: user.id,
          is_primary: addresses.length === 0
        })
        .select()
        .single();

      if (error) throw error;

      const transformedAddress: InfluencerAddress = {
        id: data.id,
        influencer_id: data.influencer_id,
        street_address: data.street_address,
        address_line1: data.street_address, // For backward compatibility
        city: data.city,
        state: data.state,
        postal_code: data.postal_code,
        country: data.country,
        phone: "Not provided", // Default value
        name: "Address", // Default value
        is_primary: data.is_primary,
        created_at: data.created_at
      };

      setAddresses(prev => [...prev, transformedAddress]);
      setNewAddress({
        street_address: "",
        city: "",
        state: "",
        postal_code: "",
        country: "India"
      });

      toast({
        title: "Success",
        description: "Address added successfully"
      });
    } catch (error: any) {
      console.error("Error adding address:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add address",
        variant: "destructive"
      });
    }
  };

  const handleRemoveAddress = async (addressId: string) => {
    try {
      const { error } = await supabase
        .from("influencer_addresses")
        .delete()
        .eq("id", addressId);

      if (error) throw error;

      setAddresses(prev => prev.filter(addr => addr.id !== addressId));
      toast({
        title: "Success",
        description: "Address removed successfully"
      });
    } catch (error: any) {
      console.error("Error removing address:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove address",
        variant: "destructive"
      });
    }
  };

  const handleSetPrimaryAddress = async (addressId: string) => {
    try {
      const { error } = await supabase
        .from("influencer_addresses")
        .update({ is_primary: true })
        .eq("id", addressId);

      if (error) throw error;

      setAddresses(prev => prev.map(addr => ({
        ...addr,
        is_primary: addr.id === addressId
      })));

      toast({
        title: "Success",
        description: "Primary address updated"
      });
    } catch (error: any) {
      console.error("Error updating primary address:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update primary address",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header setNavOpen={() => {}} />
      <div className="container mx-auto px-4 py-8 pt-20">
        <div className="max-w-2xl mx-auto mb-8">
          <h1 className="text-2xl font-bold mb-6 text-center">Edit Your Profile</h1>
          
          <div className="space-y-6">
            {/* Size & Preferences Section */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-xl">Sizes & Preferences</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...sizePreferencesForm}>
                  <form onSubmit={sizePreferencesForm.handleSubmit(handleSubmitSizePreferences)} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={sizePreferencesForm.control}
                        name="tshirt_size"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>T-shirt Size</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. M, L, XL" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={sizePreferencesForm.control}
                        name="shoe_size"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Shoe Size</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. 9, 10, 42" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={sizePreferencesForm.control}
                        name="pants_waist"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pants Waist</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. 32, 34" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={sizePreferencesForm.control}
                        name="pants_length"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pants Length</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. 30, 32" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <FormLabel>Food Preferences</FormLabel>
                      <div className="flex gap-2">
                        <Input 
                          value={newFoodPreference} 
                          onChange={e => setNewFoodPreference(e.target.value)}
                          placeholder="e.g. Vegetarian, Vegan, No Nuts"
                          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addFoodPreference())}
                        />
                        <Button type="button" onClick={addFoodPreference}>Add</Button>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mt-2">
                        {sizePreferencesForm.watch('food_preferences')?.map((pref, index) => (
                          <div key={index} className="flex items-center bg-gray-100 rounded-full px-3 py-1">
                            <span className="text-sm mr-2">{pref}</span>
                            <button 
                              type="button"
                              onClick={() => removeFoodPreference(pref)}
                              className="text-gray-500 hover:text-red-500"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={isUpdatingPreferences}
                    >
                      {isUpdatingPreferences ? "Saving..." : "Save Size & Preferences"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
            
            {/* Profile Information Section */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-xl">Profile Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="platform">Platform *</Label>
                    <Input
                      id="platform"
                      value={formData.platform}
                      onChange={e => setFormData(prev => ({ ...prev, platform: e.target.value }))}
                      required
                      placeholder="e.g., YouTube, Instagram, TikTok"
                    />
                  </div>

                  <div>
                    <Label htmlFor="followers">Followers *</Label>
                    <Input
                      id="followers"
                      type="number"
                      value={formData.followers}
                      onChange={e => setFormData(prev => ({ ...prev, followers: parseInt(e.target.value) || 0 }))}
                      required
                      min="0"
                    />
                  </div>

                  <div>
                    <Label htmlFor="about">About</Label>
                    <Textarea
                      id="about"
                      value={formData.about || ""}
                      onChange={e => setFormData(prev => ({ ...prev, about: e.target.value }))}
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="profile_image">Profile Image</Label>
                    <div className="space-y-2">
                      <Input
                        id="profile_image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                        className="cursor-pointer"
                      />
                      {uploadingImage && <p className="text-sm text-gray-500">Uploading image...</p>}
                      {formData.profile_image && (
                        <div className="mt-2">
                          <img 
                            src={formData.profile_image} 
                            alt="Profile preview" 
                            className="w-32 h-32 object-cover rounded-full"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label>Social Media Links</Label>
                    <div className="space-y-4">
                      <Input
                        placeholder="YouTube URL"
                        value={formData.youtube_url || ""}
                        onChange={e => setFormData(prev => ({ ...prev, youtube_url: e.target.value }))}
                      />
                      <Input
                        placeholder="Instagram URL"
                        value={formData.instagram_url || ""}
                        onChange={e => setFormData(prev => ({ ...prev, instagram_url: e.target.value }))}
                      />
                      <Input
                        placeholder="Twitter URL"
                        value={formData.twitter_url || ""}
                        onChange={e => setFormData(prev => ({ ...prev, twitter_url: e.target.value }))}
                      />
                      <Input
                        placeholder="Facebook URL"
                        value={formData.facebook_url || ""}
                        onChange={e => setFormData(prev => ({ ...prev, facebook_url: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Hobbies</Label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        value={formData.newHobby}
                        onChange={e => setFormData(prev => ({ ...prev, newHobby: e.target.value }))}
                        placeholder="Add a hobby"
                      />
                      <Button type="button" onClick={addHobby}>Add</Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.hobbies.map((hobby, index) => (
                        <span
                          key={index}
                          className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                        >
                          {hobby}
                          <button
                            type="button"
                            onClick={() => removeHobby(hobby)}
                            className="text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <Button type="submit" disabled={isLoading || uploadingImage} className="w-full">
                    {isLoading ? "Saving..." : "Save Profile"}
                  </Button>
                </form>
              </CardContent>
            </Card>
            
            {/* Delivery Addresses Section */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-xl">Delivery Addresses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {addresses.map((address) => (
                    <div key={address.id} className="p-4 border rounded-lg relative">
                      <div className="flex justify-between items-start">
                        <div>
                          <p>{address.street_address}</p>
                          <p>{address.city}, {address.state} {address.postal_code}</p>
                          <p>{address.country}</p>
                        </div>
                        <div className="flex gap-2">
                          {!address.is_primary && (
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleSetPrimaryAddress(address.id)}
                            >
                              Set as Primary
                            </Button>
                          )}
                          <Button 
                            type="button" 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleRemoveAddress(address.id)}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                      {address.is_primary && (
                        <span className="absolute top-2 right-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                          Primary
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                <div className="border rounded-lg p-4 space-y-4 mt-4">
                  <h3 className="font-medium">Add New Address</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="street_address">Street Address *</Label>
                      <Input
                        id="street_address"
                        value={newAddress.street_address}
                        onChange={e => setNewAddress(prev => ({ ...prev, street_address: e.target.value }))}
                        placeholder="Enter your street address"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          value={newAddress.city}
                          onChange={e => setNewAddress(prev => ({ ...prev, city: e.target.value }))}
                          placeholder="Enter city"
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">State *</Label>
                        <Input
                          id="state"
                          value={newAddress.state}
                          onChange={e => setNewAddress(prev => ({ ...prev, state: e.target.value }))}
                          placeholder="Enter state"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="postal_code">Postal Code *</Label>
                        <Input
                          id="postal_code"
                          value={newAddress.postal_code}
                          onChange={e => setNewAddress(prev => ({ ...prev, postal_code: e.target.value }))}
                          placeholder="Enter postal code"
                        />
                      </div>
                      <div>
                        <Label htmlFor="country">Country</Label>
                        <Input
                          id="country"
                          value={newAddress.country}
                          onChange={e => setNewAddress(prev => ({ ...prev, country: e.target.value }))}
                          disabled
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      onClick={handleAddAddress}
                      className="w-full"
                    >
                      Add Address
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
