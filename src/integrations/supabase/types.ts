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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      events: {
        Row: {
          city: string | null
          country: string | null
          created_at: string | null
          device: string | null
          event_type: string
          id: string
          metadata: Json | null
          referrer: string | null
          vitrine_id: string | null
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string | null
          device?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          referrer?: string | null
          vitrine_id?: string | null
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string | null
          device?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          referrer?: string | null
          vitrine_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_vitrine_id_fkey"
            columns: ["vitrine_id"]
            isOneToOne: false
            referencedRelation: "vitrines"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          created_at: string | null
          email: string
          id: string
          metadata: Json | null
          name: string | null
          source: string | null
          vitrine_id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          metadata?: Json | null
          name?: string | null
          source?: string | null
          vitrine_id: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          metadata?: Json | null
          name?: string | null
          source?: string | null
          vitrine_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_vitrine_id_fkey"
            columns: ["vitrine_id"]
            isOneToOne: false
            referencedRelation: "vitrines"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          amount: number
          buyer_email: string | null
          buyer_name: string | null
          created_at: string | null
          id: string
          metadata: Json | null
          payment_id: string | null
          payment_method: string | null
          payment_status: string | null
          product_title: string | null
          updated_at: string | null
          vitrine_id: string
        }
        Insert: {
          amount: number
          buyer_email?: string | null
          buyer_name?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          payment_id?: string | null
          payment_method?: string | null
          payment_status?: string | null
          product_title?: string | null
          updated_at?: string | null
          vitrine_id: string
        }
        Update: {
          amount?: number
          buyer_email?: string | null
          buyer_name?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          payment_id?: string | null
          payment_method?: string | null
          payment_status?: string | null
          product_title?: string | null
          updated_at?: string | null
          vitrine_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_vitrine_id_fkey"
            columns: ["vitrine_id"]
            isOneToOne: false
            referencedRelation: "vitrines"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          last_sign_in_at: string | null
          provider: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          last_sign_in_at?: string | null
          provider?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          last_sign_in_at?: string | null
          provider?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      vitrines: {
        Row: {
          avatar_url: string | null
          bio: string | null
          blocks: Json | null
          created_at: string | null
          design: Json | null
          display_name: string | null
          id: string
          links: Json | null
          products: Json | null
          published: boolean | null
          testimonials: Json | null
          theme: string | null
          updated_at: string | null
          user_id: string
          username: string
          whatsapp: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          blocks?: Json | null
          created_at?: string | null
          design?: Json | null
          display_name?: string | null
          id?: string
          links?: Json | null
          products?: Json | null
          published?: boolean | null
          testimonials?: Json | null
          theme?: string | null
          updated_at?: string | null
          user_id: string
          username: string
          whatsapp?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          blocks?: Json | null
          created_at?: string | null
          design?: Json | null
          display_name?: string | null
          id?: string
          links?: Json | null
          products?: Json | null
          published?: boolean | null
          testimonials?: Json | null
          theme?: string | null
          updated_at?: string | null
          user_id?: string
          username?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
