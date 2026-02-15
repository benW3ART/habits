export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          wallet_address: string
          username: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          wallet_address: string
          username?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          wallet_address?: string
          username?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      habits: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          category: string | null
          goal: string | null
          positive_actions: Json
          negative_actions: Json
          is_preset: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          category?: string | null
          goal?: string | null
          positive_actions?: Json
          negative_actions?: Json
          is_preset?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          category?: string | null
          goal?: string | null
          positive_actions?: Json
          negative_actions?: Json
          is_preset?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      logs: {
        Row: {
          id: string
          habit_id: string
          user_id: string
          action_type: string
          action_name: string
          value: number
          comment: string | null
          points_earned: number
          tx_signature: string | null
          logged_at: string
        }
        Insert: {
          id?: string
          habit_id: string
          user_id: string
          action_type: string
          action_name: string
          value?: number
          comment?: string | null
          points_earned?: number
          tx_signature?: string | null
          logged_at?: string
        }
        Update: {
          id?: string
          habit_id?: string
          user_id?: string
          action_type?: string
          action_name?: string
          value?: number
          comment?: string | null
          points_earned?: number
          tx_signature?: string | null
          logged_at?: string
        }
      }
      streaks: {
        Row: {
          id: string
          habit_id: string
          user_id: string
          current_streak: number
          longest_streak: number
          last_log_date: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          habit_id: string
          user_id: string
          current_streak?: number
          longest_streak?: number
          last_log_date?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          habit_id?: string
          user_id?: string
          current_streak?: number
          longest_streak?: number
          last_log_date?: string | null
          updated_at?: string
        }
      }
      bets: {
        Row: {
          id: string
          user_id: string
          habit_id: string | null
          goal_description: string
          stake_amount: number
          stake_tx_signature: string | null
          duration_days: number
          start_date: string
          end_date: string
          status: string
          daily_log_required: boolean
          missed_days: number
          payout_tx_signature: string | null
          created_at: string
          resolved_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          habit_id?: string | null
          goal_description: string
          stake_amount: number
          stake_tx_signature?: string | null
          duration_days: number
          start_date: string
          end_date: string
          status?: string
          daily_log_required?: boolean
          missed_days?: number
          payout_tx_signature?: string | null
          created_at?: string
          resolved_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          habit_id?: string | null
          goal_description?: string
          stake_amount?: number
          stake_tx_signature?: string | null
          duration_days?: number
          start_date?: string
          end_date?: string
          status?: string
          daily_log_required?: boolean
          missed_days?: number
          payout_tx_signature?: string | null
          created_at?: string
          resolved_at?: string | null
        }
      }
      points: {
        Row: {
          id: string
          user_id: string
          action: string
          amount: number
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          action: string
          amount: number
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          action?: string
          amount?: number
          metadata?: Json | null
          created_at?: string
        }
      }
      preset_habits: {
        Row: {
          id: string
          name: string
          description: string | null
          category: string
          goal: string | null
          positive_actions: Json
          negative_actions: Json
          icon: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          category: string
          goal?: string | null
          positive_actions?: Json
          negative_actions?: Json
          icon?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          category?: string
          goal?: string | null
          positive_actions?: Json
          negative_actions?: Json
          icon?: string | null
          is_active?: boolean
          created_at?: string
        }
      }
      config: {
        Row: {
          key: string
          value: Json
          updated_at: string
        }
        Insert: {
          key: string
          value: Json
          updated_at?: string
        }
        Update: {
          key?: string
          value?: Json
          updated_at?: string
        }
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
  }
}
