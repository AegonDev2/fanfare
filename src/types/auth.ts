export type NavRole = 'fan' | 'influencer' | 'admin';

export interface UnifiedUserData {
  // Core profile data
  profile: {
    id: string;
    name: string | null;
    email: string;
    user_type: string;
    created_at?: string;
    updated_at?: string;
  };
  
  // Role-specific profiles
  influencer_profile?: {
    id: string;
    name: string;
    platform: string;
    followers: number;
    category?: string;
    about?: string;
    profile_image?: string;
    hobbies?: string[];
    birthday?: string;
    instagram_url?: string;
    youtube_url?: string;
    tiktok_url?: string;
    twitter_url?: string;
    facebook_url?: string;
  } | null;
  
  fan_profile?: {
    id: string;
    user_id: string;
    profile_name?: string;
    bio?: string;
    profile_image_url?: string;
    favorite_categories?: string[];
    total_gifts_sent?: number;
    total_amount_spent?: number;
  } | null;
  
  // User roles and permissions
  roles: string[];
  
  // Wallet information
  wallet?: {
    id: string;
    user_id: string;
    balance: number;
    created_at: string;
    updated_at: string;
  } | null;
}

export interface AuthState {
  user: any | null;
  userData: UnifiedUserData | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

export interface AuthHelpers {
  hasRole: (role: NavRole) => boolean;
  isPrimaryRole: (role: NavRole) => boolean;
  getUserRole: () => NavRole;
  getDisplayName: () => string;
  isInfluencer: boolean;
  isFan: boolean;
  isAdmin: boolean;
}