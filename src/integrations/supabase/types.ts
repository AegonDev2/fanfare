export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      ecommerce_credentials: {
        Row: {
          created_at: string
          encrypted_password: string
          id: string
          is_active: boolean | null
          platform: Database["public"]["Enums"]["ecommerce_platform"]
          updated_at: string
          username: string
        }
        Insert: {
          created_at?: string
          encrypted_password: string
          id?: string
          is_active?: boolean | null
          platform: Database["public"]["Enums"]["ecommerce_platform"]
          updated_at?: string
          username: string
        }
        Update: {
          created_at?: string
          encrypted_password?: string
          id?: string
          is_active?: boolean | null
          platform?: Database["public"]["Enums"]["ecommerce_platform"]
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      gift_requests: {
        Row: {
          created_at: string | null
          id: string
          influencer_id: string
          message: string | null
          product_price: number | null
          product_title: string | null
          product_url: string
          sender_id: string
          status: Database["public"]["Enums"]["gift_request_status"] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          influencer_id: string
          message?: string | null
          product_price?: number | null
          product_title?: string | null
          product_url: string
          sender_id: string
          status?: Database["public"]["Enums"]["gift_request_status"] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          influencer_id?: string
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
          created_at: string
          delivery_estimate: string | null
          id: string
          influencer_id: string | null
          platform_fee: number | null
          product_id: string | null
          product_price: number | null
          product_title: string | null
          product_url: string
          shipping_address_id: string | null
          status: string | null
          total_amount: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          delivery_estimate?: string | null
          id?: string
          influencer_id?: string | null
          platform_fee?: number | null
          product_id?: string | null
          product_price?: number | null
          product_title?: string | null
          product_url: string
          shipping_address_id?: string | null
          status?: string | null
          total_amount?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          delivery_estimate?: string | null
          id?: string
          influencer_id?: string | null
          platform_fee?: number | null
          product_id?: string | null
          product_price?: number | null
          product_title?: string | null
          product_url?: string
          shipping_address_id?: string | null
          status?: string | null
          total_amount?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "influencer_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_shipping_address_id_fkey"
            columns: ["shipping_address_id"]
            isOneToOne: false
            referencedRelation: "influencer_addresses"
            referencedColumns: ["id"]
          },
        ]
      }
      orders_accepted: {
        Row: {
          created_at: string
          id: string
          influencer_id: string | null
          message: string | null
          platform_fee: number | null
          processing_started_at: string | null
          product_price: number | null
          product_title: string | null
          product_url: string
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
          processing_started_at?: string | null
          product_price?: number | null
          product_title?: string | null
          product_url: string
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
          processing_started_at?: string | null
          product_price?: number | null
          product_title?: string | null
          product_url?: string
          shipping_address?: Json | null
          total_amount?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_accepted_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "influencer_profiles"
            referencedColumns: ["id"]
          },
        ]
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
          updated_at: string
          user_type: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          updated_at?: string
          user_type: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          updated_at?: string
          user_type?: string
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
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
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
        | "ordered"
        | "delivered"
      nav_role: "admin" | "user" | "influencer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
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
        "ordered",
        "delivered",
      ],
      nav_role: ["admin", "user", "influencer"],
    },
  },
} as const
