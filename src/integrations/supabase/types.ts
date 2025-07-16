export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      ad_banners: {
        Row: {
          created_at: string
          display_order: number | null
          id: string
          image_url: string
          is_active: boolean | null
          link_url: string | null
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          id?: string
          image_url: string
          is_active?: boolean | null
          link_url?: string | null
          subtitle?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number | null
          id?: string
          image_url?: string
          is_active?: boolean | null
          link_url?: string | null
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      fan_profiles: {
        Row: {
          bio: string | null
          created_at: string
          favorite_categories: string[] | null
          id: string
          profile_image_url: string | null
          profile_name: string | null
          total_amount_spent: number | null
          total_gifts_sent: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          favorite_categories?: string[] | null
          id?: string
          profile_image_url?: string | null
          profile_name?: string | null
          total_amount_spent?: number | null
          total_gifts_sent?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          favorite_categories?: string[] | null
          id?: string
          profile_image_url?: string | null
          profile_name?: string | null
          total_amount_spent?: number | null
          total_gifts_sent?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fan_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      gift_order_items: {
        Row: {
          created_at: string
          gift_description: string | null
          gift_image_url: string | null
          gift_name: string
          gift_price: number
          gift_url: string
          id: string
          influencer_id: string
          message: string | null
          order_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          gift_description?: string | null
          gift_image_url?: string | null
          gift_name: string
          gift_price: number
          gift_url: string
          id?: string
          influencer_id: string
          message?: string | null
          order_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          gift_description?: string | null
          gift_image_url?: string | null
          gift_name?: string
          gift_price?: number
          gift_url?: string
          id?: string
          influencer_id?: string
          message?: string | null
          order_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "gift_order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "gift_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      gift_orders: {
        Row: {
          created_at: string
          id: string
          platform_fee: number
          status: string
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          platform_fee?: number
          status?: string
          total_amount?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          platform_fee?: number
          status?: string
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      gift_requests: {
        Row: {
          admin_approved: boolean | null
          admin_approved_at: string | null
          completed_at: string | null
          created_at: string | null
          id: string
          influencer_id: string
          influencer_response: string | null
          influencer_response_at: string | null
          message: string | null
          product_price: number | null
          product_title: string | null
          product_url: string
          sender_id: string
          status: Database["public"]["Enums"]["gift_request_status"] | null
          updated_at: string | null
        }
        Insert: {
          admin_approved?: boolean | null
          admin_approved_at?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          influencer_id: string
          influencer_response?: string | null
          influencer_response_at?: string | null
          message?: string | null
          product_price?: number | null
          product_title?: string | null
          product_url: string
          sender_id: string
          status?: Database["public"]["Enums"]["gift_request_status"] | null
          updated_at?: string | null
        }
        Update: {
          admin_approved?: boolean | null
          admin_approved_at?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          influencer_id?: string
          influencer_response?: string | null
          influencer_response_at?: string | null
          message?: string | null
          product_price?: number | null
          product_title?: string | null
          product_url?: string
          sender_id?: string
          status?: Database["public"]["Enums"]["gift_request_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gift_requests_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gift_requests_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      gift_selection_items: {
        Row: {
          created_at: string
          description: string | null
          gift_url: string | null
          id: string
          image_url: string
          is_featured: boolean | null
          name: string
          price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          gift_url?: string | null
          id?: string
          image_url: string
          is_featured?: boolean | null
          name: string
          price: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          gift_url?: string | null
          id?: string
          image_url?: string
          is_featured?: boolean | null
          name?: string
          price?: number
          updated_at?: string
        }
        Relationships: []
      }
      gifts_to_influencers: {
        Row: {
          created_at: string
          gift_item: string
          id: string
          influencer_id: string
          message: string | null
          sender_id: string
          status: string
        }
        Insert: {
          created_at?: string
          gift_item: string
          id?: string
          influencer_id: string
          message?: string | null
          sender_id: string
          status?: string
        }
        Update: {
          created_at?: string
          gift_item?: string
          id?: string
          influencer_id?: string
          message?: string | null
          sender_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "gifts_to_influencers_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "influencer_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gifts_to_influencers_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      influencer_addresses: {
        Row: {
          city: string
          country: string
          created_at: string
          id: string
          influencer_id: string
          is_primary: boolean | null
          postal_code: string
          state: string
          street_address: string
        }
        Insert: {
          city: string
          country?: string
          created_at?: string
          id?: string
          influencer_id: string
          is_primary?: boolean | null
          postal_code: string
          state: string
          street_address: string
        }
        Update: {
          city?: string
          country?: string
          created_at?: string
          id?: string
          influencer_id?: string
          is_primary?: boolean | null
          postal_code?: string
          state?: string
          street_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "influencer_addresses_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "influencer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      influencer_profiles: {
        Row: {
          about: string | null
          category: string | null
          created_at: string
          facebook_url: string | null
          followers: number
          hobbies: string[] | null
          id: string
          instagram_url: string | null
          name: string
          platform: string
          profile_image: string | null
          tiktok_url: string | null
          twitter_url: string | null
          updated_at: string
          youtube_url: string | null
        }
        Insert: {
          about?: string | null
          category?: string | null
          created_at?: string
          facebook_url?: string | null
          followers?: number
          hobbies?: string[] | null
          id?: string
          instagram_url?: string | null
          name: string
          platform: string
          profile_image?: string | null
          tiktok_url?: string | null
          twitter_url?: string | null
          updated_at?: string
          youtube_url?: string | null
        }
        Update: {
          about?: string | null
          category?: string | null
          created_at?: string
          facebook_url?: string | null
          followers?: number
          hobbies?: string[] | null
          id?: string
          instagram_url?: string | null
          name?: string
          platform?: string
          profile_image?: string | null
          tiktok_url?: string | null
          twitter_url?: string | null
          updated_at?: string
          youtube_url?: string | null
        }
        Relationships: []
      }
      influencer_wishlist: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          influencer_id: string
          product_image_url: string | null
          product_price: number | null
          product_title: string
          product_url: string
          updated_at: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          influencer_id: string
          product_image_url?: string | null
          product_price?: number | null
          product_title: string
          product_url: string
          updated_at?: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          influencer_id?: string
          product_image_url?: string | null
          product_price?: number | null
          product_title?: string
          product_url?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "influencer_wishlist_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "influencer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      navigation_items: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          order_index: number
          path: string
          roles: Database["public"]["Enums"]["nav_role"][] | null
          title: string
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          order_index: number
          path: string
          roles?: Database["public"]["Enums"]["nav_role"][] | null
          title: string
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          order_index?: number
          path?: string
          roles?: Database["public"]["Enums"]["nav_role"][] | null
          title?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          recipient_id: string
          reference_id: string | null
          sender_id: string | null
          type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          recipient_id: string
          reference_id?: string | null
          sender_id?: string | null
          type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          recipient_id?: string
          reference_id?: string | null
          sender_id?: string | null
          type?: string
        }
        Relationships: []
      }
      orders_completed: {
        Row: {
          completed_at: string
          created_at: string
          delivery_estimate: string | null
          id: string
          influencer_id: string | null
          message: string | null
          platform_fee: number | null
          product_price: number | null
          product_title: string | null
          product_url: string
          shipping_address: Json | null
          total_amount: number | null
          user_id: string | null
        }
        Insert: {
          completed_at?: string
          created_at: string
          delivery_estimate?: string | null
          id: string
          influencer_id?: string | null
          message?: string | null
          platform_fee?: number | null
          product_price?: number | null
          product_title?: string | null
          product_url: string
          shipping_address?: Json | null
          total_amount?: number | null
          user_id?: string | null
        }
        Update: {
          completed_at?: string
          created_at?: string
          delivery_estimate?: string | null
          id?: string
          influencer_id?: string | null
          message?: string | null
          platform_fee?: number | null
          product_price?: number | null
          product_title?: string | null
          product_url?: string
          shipping_address?: Json | null
          total_amount?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_completed_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "influencer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      orders_rejected: {
        Row: {
          created_at: string
          id: string
          influencer_id: string | null
          message: string | null
          original_order_id: string
          platform_fee: number | null
          product_price: number | null
          product_title: string | null
          product_url: string
          rejected_at: string | null
          rejected_by: string
          rejection_reason: string
          shipping_address: Json | null
          total_amount: number | null
          user_id: string | null
        }
        Insert: {
          created_at: string
          id?: string
          influencer_id?: string | null
          message?: string | null
          original_order_id: string
          platform_fee?: number | null
          product_price?: number | null
          product_title?: string | null
          product_url: string
          rejected_at?: string | null
          rejected_by: string
          rejection_reason: string
          shipping_address?: Json | null
          total_amount?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          influencer_id?: string | null
          message?: string | null
          original_order_id?: string
          platform_fee?: number | null
          product_price?: number | null
          product_title?: string | null
          product_url?: string
          rejected_at?: string | null
          rejected_by?: string
          rejection_reason?: string
          shipping_address?: Json | null
          total_amount?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      orders_under_process: {
        Row: {
          created_at: string
          id: string
          influencer_id: string | null
          message: string | null
          platform_fee: number | null
          product_price: number | null
          product_title: string | null
          product_url: string
          rejection_reason: string | null
          shipping_address: Json | null
          total_amount: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          influencer_id?: string | null
          message?: string | null
          platform_fee?: number | null
          product_price?: number | null
          product_title?: string | null
          product_url: string
          rejection_reason?: string | null
          shipping_address?: Json | null
          total_amount?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          influencer_id?: string | null
          message?: string | null
          platform_fee?: number | null
          product_price?: number | null
          product_title?: string | null
          product_url?: string
          rejection_reason?: string | null
          shipping_address?: Json | null
          total_amount?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_under_process_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "influencer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      product_preview_data: {
        Row: {
          created_at: string | null
          id: string
          platform: string | null
          price: number
          title: string
          updated_at: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          platform?: string | null
          price: number
          title: string
          updated_at?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          id?: string
          platform?: string | null
          price?: number
          title?: string
          updated_at?: string | null
          url?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          price: number
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          price: number
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          price?: number
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string | null
          updated_at: string
          user_type: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          name?: string | null
          updated_at?: string
          user_type: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          updated_at?: string
          user_type?: string
        }
        Relationships: []
      }
      shop_products: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_available: boolean
          is_featured: boolean | null
          name: string
          price: number
          product_url: string | null
          ranking: number | null
          shop_id: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean
          is_featured?: boolean | null
          name: string
          price: number
          product_url?: string | null
          ranking?: number | null
          shop_id: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean
          is_featured?: boolean | null
          name?: string
          price?: number
          product_url?: string | null
          ranking?: number | null
          shop_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shop_products_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      shops: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          is_featured: boolean | null
          logo_image_url: string | null
          name: string
          ranking: number | null
          updated_at: string
          website_url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_featured?: boolean | null
          logo_image_url?: string | null
          name: string
          ranking?: number | null
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_featured?: boolean | null
          logo_image_url?: string | null
          name?: string
          ranking?: number | null
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      size_preferences: {
        Row: {
          created_at: string
          food_preferences: string[] | null
          id: string
          influencer_id: string
          pants_length: string | null
          pants_waist: string | null
          shoe_size: string | null
          tshirt_size: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          food_preferences?: string[] | null
          id?: string
          influencer_id: string
          pants_length?: string | null
          pants_waist?: string | null
          shoe_size?: string | null
          tshirt_size?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          food_preferences?: string[] | null
          id?: string
          influencer_id?: string
          pants_length?: string | null
          pants_waist?: string | null
          shoe_size?: string | null
          tshirt_size?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "size_preferences_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: true
            referencedRelation: "influencer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          description: string
          id: string
          reference_id: string | null
          status: string
          type: string
          wallet_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description: string
          id?: string
          reference_id?: string | null
          status: string
          type: string
          wallet_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          id?: string
          reference_id?: string | null
          status?: string
          type?: string
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_transactions_wallet"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wallets: {
        Row: {
          balance: number
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      consolidate_user_wallets: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_monthly_leaderboard: {
        Args: { target_month: number; target_year: number }
        Returns: {
          fan_id: string
          fan_name: string
          fan_email: string
          total_gifts: number
          favorite_influencer_id: string
          favorite_influencer_name: string
          month: string
          year: number
        }[]
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      is_admin: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      move_order_to_accepted: {
        Args: { order_id: string }
        Returns: boolean
      }
      move_order_to_completed: {
        Args: { order_id: string; p_delivery_estimate: string }
        Returns: boolean
      }
      move_order_to_gift_request: {
        Args: { order_id: string }
        Returns: boolean
      }
      process_gift_payment: {
        Args: {
          p_user_id: string
          p_amount: number
          p_gift_request_id: string
          p_description: string
        }
        Returns: boolean
      }
      process_influencer_acceptance: {
        Args: { gift_request_id: string }
        Returns: boolean
      }
      query_raw: {
        Args: { query: string }
        Returns: Json
      }
      reject_order_with_reason: {
        Args: {
          order_id: string
          rejection_reason: string
          rejected_by?: string
        }
        Returns: boolean
      }
      top_up_wallet: {
        Args: { p_user_id: string; p_amount: number; p_description: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "fan" | "influencer" | "admin"
      ecommerce_platform: "amazon" | "flipkart"
      gift_request_status:
        | "pending"
        | "accepted"
        | "rejected"
        | "under process"
        | "completed"
      nav_role: "admin" | "user" | "influencer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["fan", "influencer", "admin"],
      ecommerce_platform: ["amazon", "flipkart"],
      gift_request_status: [
        "pending",
        "accepted",
        "rejected",
        "under process",
        "completed",
      ],
      nav_role: ["admin", "user", "influencer"],
    },
  },
} as const
