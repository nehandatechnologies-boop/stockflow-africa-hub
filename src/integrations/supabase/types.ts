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
      asset_events: {
        Row: {
          asset_id: string
          created_at: string
          event_type: string
          id: string
          notes: string | null
          organization_id: string
          performed_by: string | null
        }
        Insert: {
          asset_id: string
          created_at?: string
          event_type: string
          id?: string
          notes?: string | null
          organization_id: string
          performed_by?: string | null
        }
        Update: {
          asset_id?: string
          created_at?: string
          event_type?: string
          id?: string
          notes?: string | null
          organization_id?: string
          performed_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "asset_events_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_events_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      assets: {
        Row: {
          asset_number: string | null
          assigned_to: string | null
          category_id: string | null
          condition: string | null
          created_at: string
          department_id: string | null
          id: string
          location: string | null
          name: string
          notes: string | null
          organization_id: string
          purchase_cost: number
          purchase_date: string | null
          serial_number: string | null
          status: Database["public"]["Enums"]["asset_status"]
          supplier_id: string | null
          updated_at: string
          warranty_expiry: string | null
        }
        Insert: {
          asset_number?: string | null
          assigned_to?: string | null
          category_id?: string | null
          condition?: string | null
          created_at?: string
          department_id?: string | null
          id?: string
          location?: string | null
          name: string
          notes?: string | null
          organization_id: string
          purchase_cost?: number
          purchase_date?: string | null
          serial_number?: string | null
          status?: Database["public"]["Enums"]["asset_status"]
          supplier_id?: string | null
          updated_at?: string
          warranty_expiry?: string | null
        }
        Update: {
          asset_number?: string | null
          assigned_to?: string | null
          category_id?: string | null
          condition?: string | null
          created_at?: string
          department_id?: string | null
          id?: string
          location?: string | null
          name?: string
          notes?: string | null
          organization_id?: string
          purchase_cost?: number
          purchase_date?: string | null
          serial_number?: string | null
          status?: Database["public"]["Enums"]["asset_status"]
          supplier_id?: string | null
          updated_at?: string
          warranty_expiry?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assets_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assets_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assets_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assets_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assets_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      attachments: {
        Row: {
          created_at: string
          entity_id: string
          entity_type: string
          file_name: string
          file_path: string
          id: string
          organization_id: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          entity_id: string
          entity_type: string
          file_name: string
          file_path: string
          id?: string
          organization_id: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          entity_id?: string
          entity_type?: string
          file_name?: string
          file_path?: string
          id?: string
          organization_id?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attachments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attachments_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
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
      fuel_coupons: {
        Row: {
          authorized_by: string | null
          coupon_number: string | null
          created_at: string
          department_id: string | null
          driver_name: string | null
          fuel_station: string | null
          fuel_type: string
          id: string
          issue_date: string | null
          issued_by: string | null
          litres: number
          notes: string | null
          odometer_reading: number | null
          organization_id: string
          redemption_date: string | null
          status: Database["public"]["Enums"]["coupon_status"]
          updated_at: string
          value: number
          vehicle_id: string | null
        }
        Insert: {
          authorized_by?: string | null
          coupon_number?: string | null
          created_at?: string
          department_id?: string | null
          driver_name?: string | null
          fuel_station?: string | null
          fuel_type?: string
          id?: string
          issue_date?: string | null
          issued_by?: string | null
          litres?: number
          notes?: string | null
          odometer_reading?: number | null
          organization_id: string
          redemption_date?: string | null
          status?: Database["public"]["Enums"]["coupon_status"]
          updated_at?: string
          value?: number
          vehicle_id?: string | null
        }
        Update: {
          authorized_by?: string | null
          coupon_number?: string | null
          created_at?: string
          department_id?: string | null
          driver_name?: string | null
          fuel_station?: string | null
          fuel_type?: string
          id?: string
          issue_date?: string | null
          issued_by?: string | null
          litres?: number
          notes?: string | null
          odometer_reading?: number | null
          organization_id?: string
          redemption_date?: string | null
          status?: Database["public"]["Enums"]["coupon_status"]
          updated_at?: string
          value?: number
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fuel_coupons_authorized_by_fkey"
            columns: ["authorized_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fuel_coupons_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fuel_coupons_issued_by_fkey"
            columns: ["issued_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fuel_coupons_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fuel_coupons_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      goods_received_notes: {
        Row: {
          checked_by: string | null
          created_at: string
          grn_number: string | null
          id: string
          notes: string | null
          organization_id: string
          purchase_order_id: string | null
          received_by: string | null
          received_date: string
          status: Database["public"]["Enums"]["doc_status"]
          store_id: string
          supplier_id: string | null
          updated_at: string
        }
        Insert: {
          checked_by?: string | null
          created_at?: string
          grn_number?: string | null
          id?: string
          notes?: string | null
          organization_id: string
          purchase_order_id?: string | null
          received_by?: string | null
          received_date?: string
          status?: Database["public"]["Enums"]["doc_status"]
          store_id: string
          supplier_id?: string | null
          updated_at?: string
        }
        Update: {
          checked_by?: string | null
          created_at?: string
          grn_number?: string | null
          id?: string
          notes?: string | null
          organization_id?: string
          purchase_order_id?: string | null
          received_by?: string | null
          received_date?: string
          status?: Database["public"]["Enums"]["doc_status"]
          store_id?: string
          supplier_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "goods_received_notes_checked_by_fkey"
            columns: ["checked_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goods_received_notes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goods_received_notes_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goods_received_notes_received_by_fkey"
            columns: ["received_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goods_received_notes_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goods_received_notes_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      grn_items: {
        Row: {
          batch_number: string | null
          condition: string | null
          created_at: string
          expiry_date: string | null
          grn_id: string
          id: string
          item_id: string
          ordered_quantity: number
          organization_id: string
          received_quantity: number
          rejected_quantity: number
          unit_cost: number
        }
        Insert: {
          batch_number?: string | null
          condition?: string | null
          created_at?: string
          expiry_date?: string | null
          grn_id: string
          id?: string
          item_id: string
          ordered_quantity?: number
          organization_id: string
          received_quantity: number
          rejected_quantity?: number
          unit_cost?: number
        }
        Update: {
          batch_number?: string | null
          condition?: string | null
          created_at?: string
          expiry_date?: string | null
          grn_id?: string
          id?: string
          item_id?: string
          ordered_quantity?: number
          organization_id?: string
          received_quantity?: number
          rejected_quantity?: number
          unit_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "grn_items_grn_id_fkey"
            columns: ["grn_id"]
            isOneToOne: false
            referencedRelation: "goods_received_notes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grn_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grn_items_organization_id_fkey"
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
          notes: string | null
          organization_id: string
          preferred_supplier_id: string | null
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
          notes?: string | null
          organization_id: string
          preferred_supplier_id?: string | null
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
          notes?: string | null
          organization_id?: string
          preferred_supplier_id?: string | null
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
            foreignKeyName: "items_preferred_supplier_id_fkey"
            columns: ["preferred_supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
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
      notifications: {
        Row: {
          body: string | null
          category: string
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          organization_id: string
          read_at: string | null
          title: string
          user_id: string | null
        }
        Insert: {
          body?: string | null
          category?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          organization_id: string
          read_at?: string | null
          title: string
          user_id?: string | null
        }
        Update: {
          body?: string | null
          category?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          organization_id?: string
          read_at?: string | null
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          address: string | null
          allow_negative_stock: boolean
          city: string | null
          country: string
          created_at: string
          currency: string
          description: string | null
          email: string | null
          fiscal_year_start_month: number
          id: string
          is_demo: boolean
          logo_url: string | null
          name: string
          organization_code: string
          phone: string | null
          plan: string
          status: Database["public"]["Enums"]["entity_status"]
          timezone: string
          updated_at: string
          valuation_method: string
        }
        Insert: {
          address?: string | null
          allow_negative_stock?: boolean
          city?: string | null
          country?: string
          created_at?: string
          currency?: string
          description?: string | null
          email?: string | null
          fiscal_year_start_month?: number
          id?: string
          is_demo?: boolean
          logo_url?: string | null
          name: string
          organization_code: string
          phone?: string | null
          plan?: string
          status?: Database["public"]["Enums"]["entity_status"]
          timezone?: string
          updated_at?: string
          valuation_method?: string
        }
        Update: {
          address?: string | null
          allow_negative_stock?: boolean
          city?: string | null
          country?: string
          created_at?: string
          currency?: string
          description?: string | null
          email?: string | null
          fiscal_year_start_month?: number
          id?: string
          is_demo?: boolean
          logo_url?: string | null
          name?: string
          organization_code?: string
          phone?: string | null
          plan?: string
          status?: Database["public"]["Enums"]["entity_status"]
          timezone?: string
          updated_at?: string
          valuation_method?: string
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
      purchase_order_items: {
        Row: {
          created_at: string
          id: string
          item_id: string
          organization_id: string
          purchase_order_id: string
          quantity: number
          received_quantity: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          item_id: string
          organization_id: string
          purchase_order_id: string
          quantity: number
          received_quantity?: number
          unit_price?: number
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string
          organization_id?: string
          purchase_order_id?: string
          quantity?: number
          received_quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchase_order_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_items_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_orders: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          expected_date: string | null
          id: string
          notes: string | null
          order_date: string
          organization_id: string
          po_number: string | null
          rejection_reason: string | null
          requested_by: string | null
          status: Database["public"]["Enums"]["doc_status"]
          supplier_id: string | null
          total_amount: number
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          expected_date?: string | null
          id?: string
          notes?: string | null
          order_date?: string
          organization_id: string
          po_number?: string | null
          rejection_reason?: string | null
          requested_by?: string | null
          status?: Database["public"]["Enums"]["doc_status"]
          supplier_id?: string | null
          total_amount?: number
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          expected_date?: string | null
          id?: string
          notes?: string | null
          order_date?: string
          organization_id?: string
          po_number?: string | null
          rejection_reason?: string | null
          requested_by?: string | null
          status?: Database["public"]["Enums"]["doc_status"]
          supplier_id?: string | null
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
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
      requisition_items: {
        Row: {
          approved_quantity: number | null
          created_at: string
          id: string
          issued_quantity: number
          item_id: string
          organization_id: string
          requested_quantity: number
          requisition_id: string
        }
        Insert: {
          approved_quantity?: number | null
          created_at?: string
          id?: string
          issued_quantity?: number
          item_id: string
          organization_id: string
          requested_quantity: number
          requisition_id: string
        }
        Update: {
          approved_quantity?: number | null
          created_at?: string
          id?: string
          issued_quantity?: number
          item_id?: string
          organization_id?: string
          requested_quantity?: number
          requisition_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "requisition_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requisition_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requisition_items_requisition_id_fkey"
            columns: ["requisition_id"]
            isOneToOne: false
            referencedRelation: "requisitions"
            referencedColumns: ["id"]
          },
        ]
      }
      requisitions: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          department_id: string | null
          destination_store_id: string | null
          id: string
          organization_id: string
          priority: string
          purpose: string | null
          rejection_reason: string | null
          requested_by: string | null
          required_date: string | null
          requisition_number: string | null
          source_store_id: string | null
          status: Database["public"]["Enums"]["doc_status"]
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          department_id?: string | null
          destination_store_id?: string | null
          id?: string
          organization_id: string
          priority?: string
          purpose?: string | null
          rejection_reason?: string | null
          requested_by?: string | null
          required_date?: string | null
          requisition_number?: string | null
          source_store_id?: string | null
          status?: Database["public"]["Enums"]["doc_status"]
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          department_id?: string | null
          destination_store_id?: string | null
          id?: string
          organization_id?: string
          priority?: string
          purpose?: string | null
          rejection_reason?: string | null
          requested_by?: string | null
          required_date?: string | null
          requisition_number?: string | null
          source_store_id?: string | null
          status?: Database["public"]["Enums"]["doc_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "requisitions_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requisitions_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requisitions_destination_store_id_fkey"
            columns: ["destination_store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requisitions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requisitions_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requisitions_source_store_id_fkey"
            columns: ["source_store_id"]
            isOneToOne: false
            referencedRelation: "stores"
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
      stock_incidents: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          attachment_path: string | null
          created_at: string
          description: string | null
          id: string
          incident_type: Database["public"]["Enums"]["incident_type"]
          item_id: string
          organization_id: string
          quantity: number
          reference: string | null
          rejection_reason: string | null
          reported_by: string | null
          status: Database["public"]["Enums"]["doc_status"]
          store_id: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          attachment_path?: string | null
          created_at?: string
          description?: string | null
          id?: string
          incident_type?: Database["public"]["Enums"]["incident_type"]
          item_id: string
          organization_id: string
          quantity: number
          reference?: string | null
          rejection_reason?: string | null
          reported_by?: string | null
          status?: Database["public"]["Enums"]["doc_status"]
          store_id: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          attachment_path?: string | null
          created_at?: string
          description?: string | null
          id?: string
          incident_type?: Database["public"]["Enums"]["incident_type"]
          item_id?: string
          organization_id?: string
          quantity?: number
          reference?: string | null
          rejection_reason?: string | null
          reported_by?: string | null
          status?: Database["public"]["Enums"]["doc_status"]
          store_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_incidents_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_incidents_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_incidents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_incidents_reported_by_fkey"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_incidents_store_id_fkey"
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
      stock_returns: {
        Row: {
          condition: string | null
          created_at: string
          from_store_id: string | null
          id: string
          item_id: string
          organization_id: string
          posted_at: string | null
          quantity: number
          reason: string | null
          return_number: string | null
          returned_by: string | null
          status: Database["public"]["Enums"]["doc_status"]
          to_store_id: string
          updated_at: string
        }
        Insert: {
          condition?: string | null
          created_at?: string
          from_store_id?: string | null
          id?: string
          item_id: string
          organization_id: string
          posted_at?: string | null
          quantity: number
          reason?: string | null
          return_number?: string | null
          returned_by?: string | null
          status?: Database["public"]["Enums"]["doc_status"]
          to_store_id: string
          updated_at?: string
        }
        Update: {
          condition?: string | null
          created_at?: string
          from_store_id?: string | null
          id?: string
          item_id?: string
          organization_id?: string
          posted_at?: string | null
          quantity?: number
          reason?: string | null
          return_number?: string | null
          returned_by?: string | null
          status?: Database["public"]["Enums"]["doc_status"]
          to_store_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_returns_from_store_id_fkey"
            columns: ["from_store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_returns_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_returns_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_returns_returned_by_fkey"
            columns: ["returned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_returns_to_store_id_fkey"
            columns: ["to_store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_transfer_items: {
        Row: {
          created_at: string
          dispatched_quantity: number
          id: string
          item_id: string
          organization_id: string
          received_quantity: number
          requested_quantity: number
          transfer_id: string
        }
        Insert: {
          created_at?: string
          dispatched_quantity?: number
          id?: string
          item_id: string
          organization_id: string
          received_quantity?: number
          requested_quantity: number
          transfer_id: string
        }
        Update: {
          created_at?: string
          dispatched_quantity?: number
          id?: string
          item_id?: string
          organization_id?: string
          received_quantity?: number
          requested_quantity?: number
          transfer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_transfer_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_transfer_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_transfer_items_transfer_id_fkey"
            columns: ["transfer_id"]
            isOneToOne: false
            referencedRelation: "stock_transfers"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_transfers: {
        Row: {
          approved_by: string | null
          created_at: string
          destination_store_id: string
          dispatched_at: string | null
          id: string
          notes: string | null
          organization_id: string
          received_at: string | null
          requested_by: string | null
          source_store_id: string
          status: Database["public"]["Enums"]["doc_status"]
          transfer_number: string | null
          updated_at: string
        }
        Insert: {
          approved_by?: string | null
          created_at?: string
          destination_store_id: string
          dispatched_at?: string | null
          id?: string
          notes?: string | null
          organization_id: string
          received_at?: string | null
          requested_by?: string | null
          source_store_id: string
          status?: Database["public"]["Enums"]["doc_status"]
          transfer_number?: string | null
          updated_at?: string
        }
        Update: {
          approved_by?: string | null
          created_at?: string
          destination_store_id?: string
          dispatched_at?: string | null
          id?: string
          notes?: string | null
          organization_id?: string
          received_at?: string | null
          requested_by?: string | null
          source_store_id?: string
          status?: Database["public"]["Enums"]["doc_status"]
          transfer_number?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_transfers_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_transfers_destination_store_id_fkey"
            columns: ["destination_store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_transfers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_transfers_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_transfers_source_store_id_fkey"
            columns: ["source_store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      stocktake_items: {
        Row: {
          created_at: string
          id: string
          item_id: string
          organization_id: string
          physical_quantity: number | null
          reason: string | null
          stocktake_id: string
          system_quantity: number
          unit_cost: number
        }
        Insert: {
          created_at?: string
          id?: string
          item_id: string
          organization_id: string
          physical_quantity?: number | null
          reason?: string | null
          stocktake_id: string
          system_quantity?: number
          unit_cost?: number
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string
          organization_id?: string
          physical_quantity?: number | null
          reason?: string | null
          stocktake_id?: string
          system_quantity?: number
          unit_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "stocktake_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stocktake_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stocktake_items_stocktake_id_fkey"
            columns: ["stocktake_id"]
            isOneToOne: false
            referencedRelation: "stocktakes"
            referencedColumns: ["id"]
          },
        ]
      }
      stocktakes: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          id: string
          notes: string | null
          organization_id: string
          reference: string | null
          started_by: string | null
          status: Database["public"]["Enums"]["doc_status"]
          store_id: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          organization_id: string
          reference?: string | null
          started_by?: string | null
          status?: Database["public"]["Enums"]["doc_status"]
          store_id: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          organization_id?: string
          reference?: string | null
          started_by?: string | null
          status?: Database["public"]["Enums"]["doc_status"]
          store_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stocktakes_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stocktakes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stocktakes_started_by_fkey"
            columns: ["started_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stocktakes_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
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
      vehicles: {
        Row: {
          created_at: string
          department_id: string | null
          id: string
          name: string | null
          organization_id: string
          registration_number: string
          status: Database["public"]["Enums"]["entity_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          department_id?: string | null
          id?: string
          name?: string | null
          organization_id: string
          registration_number: string
          status?: Database["public"]["Enums"]["entity_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          department_id?: string | null
          id?: string
          name?: string | null
          organization_id?: string
          registration_number?: string
          status?: Database["public"]["Enums"]["entity_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicles_organization_id_fkey"
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
      approve_purchase_order: {
        Args: { _approve: boolean; _po: string; _reason?: string }
        Returns: undefined
      }
      approve_requisition: {
        Args: { _approve: boolean; _reason?: string; _req: string }
        Returns: undefined
      }
      approve_stock_incident: {
        Args: { _approve: boolean; _incident: string; _reason?: string }
        Returns: undefined
      }
      approve_stocktake: { Args: { _stocktake: string }; Returns: undefined }
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
      dispatch_transfer: { Args: { _transfer: string }; Returns: undefined }
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
      issue_requisition: { Args: { _req: string }; Returns: undefined }
      join_organization: {
        Args: { _code: string; _role?: Database["public"]["Enums"]["app_role"] }
        Returns: string
      }
      next_transaction_reference: {
        Args: { _org: string; _prefix: string }
        Returns: string
      }
      notify_permission: {
        Args: {
          _body: string
          _category: string
          _entity_id: string
          _entity_type: string
          _org: string
          _permission: string
          _title: string
        }
        Returns: undefined
      }
      platform_stats: { Args: never; Returns: Json }
      populate_stocktake: { Args: { _stocktake: string }; Returns: number }
      post_goods_received_note: { Args: { _grn: string }; Returns: undefined }
      post_stock_return: { Args: { _return: string }; Returns: undefined }
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
      receive_transfer: { Args: { _transfer: string }; Returns: undefined }
      reverse_stock_transaction: {
        Args: { _reason: string; _transaction: string }
        Returns: string
      }
      submit_document: {
        Args: { _id: string; _table: string }
        Returns: undefined
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
      asset_status:
        | "ACTIVE"
        | "IN_REPAIR"
        | "DAMAGED"
        | "LOST"
        | "DISPOSED"
        | "TRANSFERRED"
      coupon_status:
        | "AVAILABLE"
        | "ISSUED"
        | "REDEEMED"
        | "CANCELLED"
        | "EXPIRED"
        | "LOST"
      doc_status:
        | "DRAFT"
        | "SUBMITTED"
        | "APPROVED"
        | "PARTIALLY_APPROVED"
        | "REJECTED"
        | "PARTIALLY_RECEIVED"
        | "RECEIVED"
        | "PARTIALLY_ISSUED"
        | "ISSUED"
        | "IN_TRANSIT"
        | "COMPLETED"
        | "CANCELLED"
      entity_status: "active" | "inactive" | "suspended"
      incident_type:
        | "BREAKAGE"
        | "DAMAGE"
        | "EXPIRED"
        | "SPOILT"
        | "THEFT"
        | "UNEXPLAINED_LOSS"
        | "OTHER"
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
      asset_status: [
        "ACTIVE",
        "IN_REPAIR",
        "DAMAGED",
        "LOST",
        "DISPOSED",
        "TRANSFERRED",
      ],
      coupon_status: [
        "AVAILABLE",
        "ISSUED",
        "REDEEMED",
        "CANCELLED",
        "EXPIRED",
        "LOST",
      ],
      doc_status: [
        "DRAFT",
        "SUBMITTED",
        "APPROVED",
        "PARTIALLY_APPROVED",
        "REJECTED",
        "PARTIALLY_RECEIVED",
        "RECEIVED",
        "PARTIALLY_ISSUED",
        "ISSUED",
        "IN_TRANSIT",
        "COMPLETED",
        "CANCELLED",
      ],
      entity_status: ["active", "inactive", "suspended"],
      incident_type: [
        "BREAKAGE",
        "DAMAGE",
        "EXPIRED",
        "SPOILT",
        "THEFT",
        "UNEXPLAINED_LOSS",
        "OTHER",
      ],
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
