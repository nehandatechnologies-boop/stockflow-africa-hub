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
      audit_logs: {
        Row: {
          action: string
          after_data: Json | null
          before_data: Json | null
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: string | null
          organization_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          organization_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          organization_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          name: string
          organization_id: string
          status: Database["public"]["Enums"]["entity_status"]
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          organization_id: string
          status?: Database["public"]["Enums"]["entity_status"]
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          organization_id?: string
          status?: Database["public"]["Enums"]["entity_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          manager_id: string | null
          name: string
          organization_id: string
          status: Database["public"]["Enums"]["entity_status"]
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          manager_id?: string | null
          name: string
          organization_id: string
          status?: Database["public"]["Enums"]["entity_status"]
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          manager_id?: string | null
          name?: string
          organization_id?: string
          status?: Database["public"]["Enums"]["entity_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "departments_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "departments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      items: {
        Row: {
          active: boolean
          barcode: string | null
          category_id: string | null
          created_at: string
          default_unit_cost: number
          description: string | null
          id: string
          item_code: string
          maximum_stock_level: number | null
          minimum_stock_level: number
          name: string
          organization_id: string
          reorder_level: number
          sku: string | null
          track_batch: boolean
          track_expiry: boolean
          track_serial_number: boolean
          unit_of_measure_id: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          barcode?: string | null
          category_id?: string | null
          created_at?: string
          default_unit_cost?: number
          description?: string | null
          id?: string
          item_code: string
          maximum_stock_level?: number | null
          minimum_stock_level?: number
          name: string
          organization_id: string
          reorder_level?: number
          sku?: string | null
          track_batch?: boolean
          track_expiry?: boolean
          track_serial_number?: boolean
          unit_of_measure_id?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          barcode?: string | null
          category_id?: string | null
          created_at?: string
          default_unit_cost?: number
          description?: string | null
          id?: string
          item_code?: string
          maximum_stock_level?: number | null
          minimum_stock_level?: number
          name?: string
          organization_id?: string
          reorder_level?: number
          sku?: string | null
          track_batch?: boolean
          track_expiry?: boolean
          track_serial_number?: boolean
          unit_of_measure_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "items_unit_of_measure_id_fkey"
            columns: ["unit_of_measure_id"]
            isOneToOne: false
            referencedRelation: "units_of_measure"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          address: string | null
          city: string | null
          country: string
          created_at: string
          currency: string
          description: string | null
          email: string | null
          id: string
          is_demo: boolean
          logo_url: string | null
          name: string
          organization_code: string
          phone: string | null
          status: Database["public"]["Enums"]["entity_status"]
          timezone: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          country?: string
          created_at?: string
          currency?: string
          description?: string | null
          email?: string | null
          id?: string
          is_demo?: boolean
          logo_url?: string | null
          name: string
          organization_code: string
          phone?: string | null
          status?: Database["public"]["Enums"]["entity_status"]
          timezone?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string | null
          country?: string
          created_at?: string
          currency?: string
          description?: string | null
          email?: string | null
          id?: string
          is_demo?: boolean
          logo_url?: string | null
          name?: string
          organization_code?: string
          phone?: string | null
          status?: Database["public"]["Enums"]["entity_status"]
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          job_title: string | null
          organization_id: string | null
          phone: string | null
          status: Database["public"]["Enums"]["entity_status"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          job_title?: string | null
          organization_id?: string | null
          phone?: string | null
          status?: Database["public"]["Enums"]["entity_status"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          job_title?: string | null
          organization_id?: string | null
          phone?: string | null
          status?: Database["public"]["Enums"]["entity_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      reference_counters: {
        Row: {
          last_number: number
          organization_id: string
          prefix: string
          year: number
        }
        Insert: {
          last_number?: number
          organization_id: string
          prefix: string
          year: number
        }
        Update: {
          last_number?: number
          organization_id?: string
          prefix?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "reference_counters_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          id: string
          permission: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          id?: string
          permission: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          id?: string
          permission?: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: []
      }
      stock_balances: {
        Row: {
          average_cost: number
          id: string
          item_id: string
          organization_id: string
          quantity: number
          reserved_quantity: number
          store_id: string
          total_value: number
          updated_at: string
        }
        Insert: {
          average_cost?: number
          id?: string
          item_id: string
          organization_id: string
          quantity?: number
          reserved_quantity?: number
          store_id: string
          total_value?: number
          updated_at?: string
        }
        Update: {
          average_cost?: number
          id?: string
          item_id?: string
          organization_id?: string
          quantity?: number
          reserved_quantity?: number
          store_id?: string
          total_value?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_balances_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_balances_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_balances_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_ledger: {
        Row: {
          approved_by: string | null
          balance_after: number
          created_at: string
          department_id: string | null
          destination_store_id: string | null
          id: string
          item_id: string
          organization_id: string
          quantity: number
          reason: string | null
          related_transaction_id: string | null
          source_store_id: string | null
          store_id: string
          total_value: number
          transaction_date: string
          transaction_reference: string
          transaction_type: Database["public"]["Enums"]["stock_txn_type"]
          unit_cost: number
          user_id: string | null
        }
        Insert: {
          approved_by?: string | null
          balance_after?: number
          created_at?: string
          department_id?: string | null
          destination_store_id?: string | null
          id?: string
          item_id: string
          organization_id: string
          quantity: number
          reason?: string | null
          related_transaction_id?: string | null
          source_store_id?: string | null
          store_id: string
          total_value?: number
          transaction_date?: string
          transaction_reference: string
          transaction_type: Database["public"]["Enums"]["stock_txn_type"]
          unit_cost?: number
          user_id?: string | null
        }
        Update: {
          approved_by?: string | null
          balance_after?: number
          created_at?: string
          department_id?: string | null
          destination_store_id?: string | null
          id?: string
          item_id?: string
          organization_id?: string
          quantity?: number
          reason?: string | null
          related_transaction_id?: string | null
          source_store_id?: string | null
          store_id?: string
          total_value?: number
          transaction_date?: string
          transaction_reference?: string
          transaction_type?: Database["public"]["Enums"]["stock_txn_type"]
          unit_cost?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_ledger_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_ledger_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_ledger_destination_store_id_fkey"
            columns: ["destination_store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_ledger_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_ledger_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_ledger_related_transaction_id_fkey"
            columns: ["related_transaction_id"]
            isOneToOne: false
            referencedRelation: "stock_ledger"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_ledger_source_store_id_fkey"
            columns: ["source_store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_ledger_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_ledger_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      store_users: {
        Row: {
          created_at: string
          id: string
          organization_id: string
          store_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id: string
          store_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string
          store_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_users_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "store_users_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "store_users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      stores: {
        Row: {
          code: string
          created_at: string
          department_id: string | null
          id: string
          location: string | null
          manager_id: string | null
          name: string
          organization_id: string
          status: Database["public"]["Enums"]["entity_status"]
          store_type: Database["public"]["Enums"]["store_type"]
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          department_id?: string | null
          id?: string
          location?: string | null
          manager_id?: string | null
          name: string
          organization_id: string
          status?: Database["public"]["Enums"]["entity_status"]
          store_type?: Database["public"]["Enums"]["store_type"]
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          department_id?: string | null
          id?: string
          location?: string | null
          manager_id?: string | null
          name?: string
          organization_id?: string
          status?: Database["public"]["Enums"]["entity_status"]
          store_type?: Database["public"]["Enums"]["store_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stores_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stores_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stores_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string | null
          contact_person: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          organization_id: string
          payment_terms: string | null
          phone: string | null
          status: Database["public"]["Enums"]["entity_status"]
          supplier_code: string
          tax_number: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          organization_id: string
          payment_terms?: string | null
          phone?: string | null
          status?: Database["public"]["Enums"]["entity_status"]
          supplier_code: string
          tax_number?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          organization_id?: string
          payment_terms?: string | null
          phone?: string | null
          status?: Database["public"]["Enums"]["entity_status"]
          supplier_code?: string
          tax_number?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "suppliers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      units_of_measure: {
        Row: {
          abbreviation: string
          created_at: string
          id: string
          name: string
          organization_id: string
          status: Database["public"]["Enums"]["entity_status"]
          updated_at: string
        }
        Insert: {
          abbreviation: string
          created_at?: string
          id?: string
          name: string
          organization_id: string
          status?: Database["public"]["Enums"]["entity_status"]
          updated_at?: string
        }
        Update: {
          abbreviation?: string
          created_at?: string
          id?: string
          name?: string
          organization_id?: string
          status?: Database["public"]["Enums"]["entity_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "units_of_measure_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          organization_id: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id?: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_supreme_admin: { Args: never; Returns: boolean }
      create_organization: {
        Args: {
          _code: string
          _country?: string
          _currency?: string
          _name: string
          _timezone?: string
        }
        Returns: string
      }
      current_org_id: { Args: never; Returns: string }
      has_permission: { Args: { _permission: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      in_org: { Args: { _org: string }; Returns: boolean }
      is_supreme_admin: { Args: never; Returns: boolean }
      join_organization: {
        Args: { _code: string; _role?: Database["public"]["Enums"]["app_role"] }
        Returns: string
      }
      next_transaction_reference: {
        Args: { _org: string; _prefix: string }
        Returns: string
      }
      platform_stats: { Args: never; Returns: Json }
      post_stock_transaction: {
        Args: {
          _department?: string
          _destination_store?: string
          _item: string
          _org: string
          _quantity: number
          _reason?: string
          _related?: string
          _store: string
          _type: Database["public"]["Enums"]["stock_txn_type"]
          _unit_cost?: number
        }
        Returns: string
      }
      reverse_stock_transaction: {
        Args: { _reason: string; _transaction: string }
        Returns: string
      }
    }
    Enums: {
      app_role:
        | "supreme_admin"
        | "org_admin"
        | "central_store_manager"
        | "store_clerk"
        | "department_head"
        | "finance"
        | "auditor"
      entity_status: "active" | "inactive" | "suspended"
      stock_txn_type:
        | "RECEIPT"
        | "ISSUE"
        | "TRANSFER_OUT"
        | "TRANSFER_IN"
        | "RETURN"
        | "BREAKAGE"
        | "LOSS"
        | "ADJUSTMENT"
        | "STOCKTAKE_ADJUSTMENT"
        | "OPENING_BALANCE"
        | "REVERSAL"
      store_type: "CENTRAL" | "DEPARTMENTAL" | "SPECIALIZED"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: [
        "supreme_admin",
        "org_admin",
        "central_store_manager",
        "store_clerk",
        "department_head",
        "finance",
        "auditor",
      ],
      entity_status: ["active", "inactive", "suspended"],
      stock_txn_type: [
        "RECEIPT",
        "ISSUE",
        "TRANSFER_OUT",
        "TRANSFER_IN",
        "RETURN",
        "BREAKAGE",
        "LOSS",
        "ADJUSTMENT",
        "STOCKTAKE_ADJUSTMENT",
        "OPENING_BALANCE",
        "REVERSAL",
      ],
      store_type: ["CENTRAL", "DEPARTMENTAL", "SPECIALIZED"],
    },
  },
} as const
