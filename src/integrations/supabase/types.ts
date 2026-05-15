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
      ai_cache: {
        Row: {
          cache_key: string
          cache_type: string
          created_at: string
          expires_at: string
          id: string
          result: Json
        }
        Insert: {
          cache_key: string
          cache_type: string
          created_at?: string
          expires_at: string
          id?: string
          result: Json
        }
        Update: {
          cache_key?: string
          cache_type?: string
          created_at?: string
          expires_at?: string
          id?: string
          result?: Json
        }
        Relationships: []
      }
      b2b_prospects: {
        Row: {
          ai_notes: string | null
          alamat: string | null
          catatan: string | null
          created_at: string
          email_draft: string | null
          id: number
          is_bookmarked: boolean
          kota: string | null
          lat: number | null
          lng: number | null
          nama: string
          place_id: string
          provinsi: string | null
          rating: number | null
          sektor: string
          status: string
          synced_at: string
          telepon: string | null
          total_reviews: number | null
          updated_at: string
          website: string | null
        }
        Insert: {
          ai_notes?: string | null
          alamat?: string | null
          catatan?: string | null
          created_at?: string
          email_draft?: string | null
          id?: number
          is_bookmarked?: boolean
          kota?: string | null
          lat?: number | null
          lng?: number | null
          nama: string
          place_id: string
          provinsi?: string | null
          rating?: number | null
          sektor?: string
          status?: string
          synced_at?: string
          telepon?: string | null
          total_reviews?: number | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          ai_notes?: string | null
          alamat?: string | null
          catatan?: string | null
          created_at?: string
          email_draft?: string | null
          id?: number
          is_bookmarked?: boolean
          kota?: string | null
          lat?: number | null
          lng?: number | null
          nama?: string
          place_id?: string
          provinsi?: string | null
          rating?: number | null
          sektor?: string
          status?: string
          synced_at?: string
          telepon?: string | null
          total_reviews?: number | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bidang_usaha: string[]
          created_at: string
          id: string
          nama_lengkap: string | null
          nama_perusahaan: string | null
          onboarding_done: boolean
          provinsi_operasional: string[]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bidang_usaha?: string[]
          created_at?: string
          id: string
          nama_lengkap?: string | null
          nama_perusahaan?: string | null
          onboarding_done?: boolean
          provinsi_operasional?: string[]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bidang_usaha?: string[]
          created_at?: string
          id?: string
          nama_lengkap?: string | null
          nama_perusahaan?: string | null
          onboarding_done?: boolean
          provinsi_operasional?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      rup_packages: {
        Row: {
          ai_category: string | null
          ai_reasoning: string | null
          ai_score: number | null
          created_at: string
          id: string
          is_bookmarked: boolean
          jenis_pengadaan: string | null
          kode_rup: string
          metode_pengadaan: string | null
          nama_instansi: string | null
          nama_kabupaten: string | null
          nama_paket: string
          nama_provinsi: string | null
          nama_satker: string | null
          pagu: number | null
          raw_data: Json | null
          status_aktif: string | null
          sumber_dana: string | null
          tahun_anggaran: number
          tanggal_pekerjaan_mulai: string | null
          tanggal_pekerjaan_selesai: string | null
          tanggal_pemilihan_mulai: string | null
          tanggal_pemilihan_selesai: string | null
          updated_at: string
          uraian_pekerjaan: string | null
        }
        Insert: {
          ai_category?: string | null
          ai_reasoning?: string | null
          ai_score?: number | null
          created_at?: string
          id?: string
          is_bookmarked?: boolean
          jenis_pengadaan?: string | null
          kode_rup: string
          metode_pengadaan?: string | null
          nama_instansi?: string | null
          nama_kabupaten?: string | null
          nama_paket: string
          nama_provinsi?: string | null
          nama_satker?: string | null
          pagu?: number | null
          raw_data?: Json | null
          status_aktif?: string | null
          sumber_dana?: string | null
          tahun_anggaran?: number
          tanggal_pekerjaan_mulai?: string | null
          tanggal_pekerjaan_selesai?: string | null
          tanggal_pemilihan_mulai?: string | null
          tanggal_pemilihan_selesai?: string | null
          updated_at?: string
          uraian_pekerjaan?: string | null
        }
        Update: {
          ai_category?: string | null
          ai_reasoning?: string | null
          ai_score?: number | null
          created_at?: string
          id?: string
          is_bookmarked?: boolean
          jenis_pengadaan?: string | null
          kode_rup?: string
          metode_pengadaan?: string | null
          nama_instansi?: string | null
          nama_kabupaten?: string | null
          nama_paket?: string
          nama_provinsi?: string | null
          nama_satker?: string | null
          pagu?: number | null
          raw_data?: Json | null
          status_aktif?: string | null
          sumber_dana?: string | null
          tahun_anggaran?: number
          tanggal_pekerjaan_mulai?: string | null
          tanggal_pekerjaan_selesai?: string | null
          tanggal_pemilihan_mulai?: string | null
          tanggal_pemilihan_selesai?: string | null
          updated_at?: string
          uraian_pekerjaan?: string | null
        }
        Relationships: []
      }
      sync_log: {
        Row: {
          created_at: string
          durasi_detik: number | null
          id: string
          jumlah_data: number
          pesan: string | null
          status: string
          tipe: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          durasi_detik?: number | null
          id?: string
          jumlah_data?: number
          pesan?: string | null
          status?: string
          tipe: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          durasi_detik?: number | null
          id?: string
          jumlah_data?: number
          pesan?: string | null
          status?: string
          tipe?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          created_at: string
          filter_instansi: string[]
          filter_kategori: string[]
          filter_pagu_min: number
          filter_relevansi_min: number
          filter_sektor_b2b: string[]
          id: string
          notif_email_aktif: boolean
          notif_emails: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          filter_instansi?: string[]
          filter_kategori?: string[]
          filter_pagu_min?: number
          filter_relevansi_min?: number
          filter_sektor_b2b?: string[]
          id?: string
          notif_email_aktif?: boolean
          notif_emails?: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          filter_instansi?: string[]
          filter_kategori?: string[]
          filter_pagu_min?: number
          filter_relevansi_min?: number
          filter_sektor_b2b?: string[]
          id?: string
          notif_email_aktif?: boolean
          notif_emails?: string[]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      watchlist: {
        Row: {
          catatan: string
          created_at: string
          id: string
          item_id: string
          item_type: string
          user_id: string
        }
        Insert: {
          catatan?: string
          created_at?: string
          id?: string
          item_id: string
          item_type: string
          user_id: string
        }
        Update: {
          catatan?: string
          created_at?: string
          id?: string
          item_id?: string
          item_type?: string
          user_id?: string
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
