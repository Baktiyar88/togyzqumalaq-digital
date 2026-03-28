/** Generated database types for Supabase */

export type UserRole = "player" | "arbiter" | "admin";
export type Locale = "kk" | "ru" | "en";
export type GameResult = "white" | "black" | "draw" | "ongoing";
export type SourceType = "ocr" | "manual";
export type MoveSide = "white" | "black";
export type OcrStatus = "pending" | "processing" | "completed" | "failed";

export interface Profile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  club: string | null;
  rating: number;
  role: UserRole;
  locale: Locale;
  created_at: string;
  updated_at: string;
}

export interface Tournament {
  id: string;
  name: string;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  organizer_id: string | null;
  created_at: string;
}

export interface Game {
  id: string;
  tournament_id: string | null;
  white_player_id: string | null;
  black_player_id: string | null;
  result: GameResult | null;
  round: number | null;
  date_played: string | null;
  source_type: SourceType | null;
  source_file_url: string | null;
  ocr_model_used: string | null;
  ocr_confidence: number | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface GameMove {
  id: string;
  game_id: string;
  move_number: number;
  side: MoveSide;
  from_pit: number;
  fen_after: string;
  timestamp: string;
}

export interface OcrJob {
  id: string;
  user_id: string | null;
  game_id: string | null;
  file_path: string;
  model: string;
  status: OcrStatus;
  progress: number;
  raw_result: unknown;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile> & { id: string; display_name: string }; Update: Partial<Profile> };
      tournaments: { Row: Tournament; Insert: Partial<Tournament> & { name: string }; Update: Partial<Tournament> };
      games: { Row: Game; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      moves: { Row: GameMove; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      ocr_jobs: { Row: OcrJob; Insert: Record<string, unknown>; Update: Record<string, unknown> };
    };
  };
}
