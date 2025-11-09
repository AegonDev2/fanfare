export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
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
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: unknown
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      device_tokens: {
        Row: {
          created_at: string
          id: string
          platform: string
          token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          platform: string
          token: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          platform?: string
          token?: string
          updated_at?: string
          user_id?: string
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
            referencedRelation: "mv_monthly_leaderboard"
            referencedColumns: ["fan_id"]
          },
          {
            foreignKeyName: "fan_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      gift_requests: {
        Row: {
          admin_approved: boolean | null
          admin_approved_at: string | null
          completed_at: string | null
          created_at: string | null
          delivery_estimate: string | null
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
          delivery_estimate?: string | null
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
          delivery_estimate?: string | null
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
            referencedRelation: "mv_monthly_leaderboard"
            referencedColumns: ["fan_id"]
          },
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
            referencedRelation: "mv_monthly_leaderboard"
            referencedColumns: ["fan_id"]
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
            referencedRelation: "mv_monthly_leaderboard"
            referencedColumns: ["fan_id"]
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
          birthday: string | null
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
          birthday?: string | null
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
          birthday?: string | null
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
      orders: {
        Row: {
          admin_approved: boolean | null
          admin_approved_at: string | null
          cancelled_at: string | null
          completed_at: string | null
          created_at: string | null
          delivery_estimate: string | null
          delivery_fee: number | null
          gift_type: boolean | null
          id: string
          influencer_id: string | null
          influencer_message: string | null
          influencer_response: string | null
          influencer_response_at: string | null
          message: string | null
          platform_fee: number | null
          product_price: number | null
          product_title: string | null
          product_url: string
          rejected_by: string | null
          rejection_reason: string | null
          sender_id: string | null
          shipping_address: Json | null
          status: string
          status_history: Json | null
          total_amount: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          admin_approved?: boolean | null
          admin_approved_at?: string | null
          cancelled_at?: string | null
          completed_at?: string | null
          created_at?: string | null
          delivery_estimate?: string | null
          delivery_fee?: number | null
          gift_type?: boolean | null
          id?: string
          influencer_id?: string | null
          influencer_message?: string | null
          influencer_response?: string | null
          influencer_response_at?: string | null
          message?: string | null
          platform_fee?: number | null
          product_price?: number | null
          product_title?: string | null
          product_url: string
          rejected_by?: string | null
          rejection_reason?: string | null
          sender_id?: string | null
          shipping_address?: Json | null
          status?: string
          status_history?: Json | null
          total_amount?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          admin_approved?: boolean | null
          admin_approved_at?: string | null
          cancelled_at?: string | null
          completed_at?: string | null
          created_at?: string | null
          delivery_estimate?: string | null
          delivery_fee?: number | null
          gift_type?: boolean | null
          id?: string
          influencer_id?: string | null
          influencer_message?: string | null
          influencer_response?: string | null
          influencer_response_at?: string | null
          message?: string | null
          platform_fee?: number | null
          product_price?: number | null
          product_title?: string | null
          product_url?: string
          rejected_by?: string | null
          rejection_reason?: string | null
          sender_id?: string | null
          shipping_address?: Json | null
          status?: string
          status_history?: Json | null
          total_amount?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
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
      testimonials: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          is_approved: boolean | null
          is_featured: boolean | null
          message: string
          name: string
          rating: number | null
          role: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          is_approved?: boolean | null
          is_featured?: boolean | null
          message: string
          name: string
          rating?: number | null
          role: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          is_approved?: boolean | null
          is_featured?: boolean | null
          message?: string
          name?: string
          rating?: number | null
          role?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
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
      mv_monthly_leaderboard: {
        Row: {
          fan_email: string | null
          fan_id: string | null
          fan_name: string | null
          favorite_influencer_id: string | null
          favorite_influencer_name: string | null
          month: string | null
          target_month: number | null
          target_year: number | null
          total_gifts: number | null
          year: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      accept_order_by_influencer: {
        Args: { order_id: string; response?: string }
        Returns: boolean
      }
      approve_order_for_influencer: {
        Args: { delivery_estimate?: string; order_id: string }
        Returns: boolean
      }
      cancel_order_by_user: { Args: { order_id: string }; Returns: boolean }
      complete_order: {
        Args: { delivery_estimate?: string; order_id: string }
        Returns: boolean
      }
      consolidate_user_wallets: { Args: never; Returns: undefined }
      create_admin_session_token: { Args: never; Returns: string }
      get_complete_user_data: { Args: { user_uuid: string }; Returns: Json }
      get_influencer_top_fans: {
        Args: { influencer_id_param: string }
        Returns: {
          fan_email: string
          fan_id: string
          fan_name: string
          profile_image_url: string
          total_gifts: number
        }[]
      }
      get_monthly_leaderboard: {
        Args: { target_month: number; target_year: number }
        Returns: {
          fan_email: string
          fan_id: string
          fan_name: string
          favorite_influencer_id: string
          favorite_influencer_name: string
          month: string
          total_gifts: number
          year: number
        }[]
      }
      get_top_gifted_creators: {
        Args: { target_month?: number; target_year?: number }
        Returns: {
          influencer_id: string
          influencer_name: string
          month: string
          top_fan_id: string
          top_fan_name: string
          total_amount_received: number
          total_gifts_received: number
          year: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { user_uuid: string }; Returns: boolean }
      migrate_gift_requests_to_orders: { Args: never; Returns: undefined }
      move_order_to_accepted: { Args: { order_id: string }; Returns: boolean }
      move_order_to_completed: {
        Args: { order_id: string; p_delivery_estimate: string }
        Returns: boolean
      }
      move_order_to_gift_request: {
        Args: { delivery_estimate?: string; order_id: string }
        Returns: boolean
      }
      process_gift_payment: {
        Args: {
          p_amount: number
          p_description: string
          p_gift_request_id: string
          p_user_id: string
        }
        Returns: boolean
      }
      process_influencer_acceptance: {
        Args: { gift_request_id: string }
        Returns: boolean
      }
      query_raw: { Args: { query: string }; Returns: Json }
      refresh_leaderboard_mv: { Args: never; Returns: undefined }
      reject_order: {
        Args: {
          order_id: string
          rejected_by?: string
          rejection_reason: string
        }
        Returns: boolean
      }
      reject_order_with_reason: {
        Args: {
          order_id: string
          rejected_by?: string
          rejection_reason: string
        }
        Returns: boolean
      }
      top_up_wallet: {
        Args: { p_amount: number; p_description: string; p_user_id: string }
        Returns: boolean
      }
      update_order_status: {
        Args: {
          delivery_estimate?: string
          influencer_response?: string
          new_status: string
          order_id: string
          rejection_reason?: string
        }
        Returns: boolean
      }
      verify_admin_access: { Args: never; Returns: boolean }
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
