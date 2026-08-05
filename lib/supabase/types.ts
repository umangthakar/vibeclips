/**
 * Hand-maintained types for the QuizStar schema.
 * Keep in sync with supabase/migrations/*.sql.
 */

/** One quiz question. Exactly four options; `correct_index` points into them. */
export type QuizQuestion = {
  text: string;
  options: [string, string, string, string];
  correct_index: 0 | 1 | 2 | 3;
};

export type Influencer = {
  id: string;
  name: string;
  /** normalised: lowercase, no leading '@' */
  instagram_handle: string;
  pin_hash: string;
  total_earnings: number;
  current_balance: number;
  created_at: string;
};

export type Quiz = {
  id: string;
  influencer_id: string;
  title: string;
  slug: string;
  questions: QuizQuestion[];
  created_at: string;
};

export type AnalyticsLog = {
  id: string;
  quiz_id: string;
  influencer_id: string;
  session_id: string;
  ip_address: string | null;
  timestamp: string;
  simulated_revenue: number;
  was_credited: boolean;
  credited_amount: number;
};

export type Payout = {
  id: string;
  influencer_id: string;
  amount: number;
  timestamp: string;
};

/** Columns the database fills in for us. */
type Generated = "id" | "created_at";

export type Database = {
  public: {
    Tables: {
      influencers: {
        Row: Influencer;
        Insert: Omit<Influencer, Generated | "total_earnings" | "current_balance"> &
          Partial<Pick<Influencer, Generated | "total_earnings" | "current_balance">>;
        Update: Partial<Omit<Influencer, "id">>;
        Relationships: [];
      };
      quizzes: {
        Row: Quiz;
        Insert: Omit<Quiz, Generated> & Partial<Pick<Quiz, Generated>>;
        Update: Partial<Omit<Quiz, "id">>;
        Relationships: [];
      };
      analytics_logs: {
        Row: AnalyticsLog;
        Insert: Omit<AnalyticsLog, "id" | "timestamp"> &
          Partial<Pick<AnalyticsLog, "id" | "timestamp">>;
        Update: Partial<Omit<AnalyticsLog, "id">>;
        Relationships: [];
      };
      payouts: {
        Row: Payout;
        Insert: Omit<Payout, "id" | "timestamp"> &
          Partial<Pick<Payout, "id" | "timestamp">>;
        Update: Partial<Omit<Payout, "id">>;
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
};
