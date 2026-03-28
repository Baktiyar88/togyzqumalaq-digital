-- Togyzqumalaq Digital: Initial Schema
-- Source: PRD section 6

-- Profiles (extends auth.users)
CREATE TABLE profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name    TEXT NOT NULL,
  avatar_url      TEXT,
  club            TEXT,
  rating          INT DEFAULT 0,
  role            TEXT DEFAULT 'player' CHECK (role IN ('player', 'arbiter', 'admin')),
  locale          TEXT DEFAULT 'kk' CHECK (locale IN ('kk', 'ru', 'en')),
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- Tournaments
CREATE TABLE tournaments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  location        TEXT,
  start_date      DATE,
  end_date        DATE,
  organizer_id    UUID REFERENCES profiles(id),
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Games
CREATE TABLE games (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id     UUID REFERENCES tournaments(id),
  white_player_id   UUID REFERENCES profiles(id),
  black_player_id   UUID REFERENCES profiles(id),
  result            TEXT CHECK (result IN ('white', 'black', 'draw', 'ongoing')),
  round             INT,
  date_played       DATE,
  source_type       TEXT CHECK (source_type IN ('ocr', 'manual')),
  source_file_url   TEXT,
  ocr_model_used    TEXT,
  ocr_confidence    FLOAT,
  notes             TEXT,
  created_by        UUID REFERENCES profiles(id),
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

-- Moves
CREATE TABLE moves (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id         UUID REFERENCES games(id) ON DELETE CASCADE,
  move_number     INT NOT NULL,
  side            TEXT NOT NULL CHECK (side IN ('white', 'black')),
  from_pit        INT NOT NULL CHECK (from_pit BETWEEN 1 AND 9),
  fen_after       TEXT NOT NULL,
  timestamp       TIMESTAMPTZ DEFAULT now(),
  UNIQUE(game_id, move_number, side)
);

-- OCR Jobs
CREATE TABLE ocr_jobs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES profiles(id),
  game_id         UUID REFERENCES games(id),
  file_path       TEXT NOT NULL,
  model           TEXT NOT NULL DEFAULT 'deepseek-ocr',
  status          TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  progress        INT DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  raw_result      JSONB,
  error_message   TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  completed_at    TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_games_created_by ON games(created_by);
CREATE INDEX idx_games_tournament ON games(tournament_id);
CREATE INDEX idx_games_white ON games(white_player_id);
CREATE INDEX idx_games_black ON games(black_player_id);
CREATE INDEX idx_moves_game ON moves(game_id);
CREATE INDEX idx_ocr_jobs_user ON ocr_jobs(user_id);
CREATE INDEX idx_ocr_jobs_status ON ocr_jobs(status);

-- Full-text search on games
CREATE INDEX idx_games_search ON games USING gin(to_tsvector('simple', coalesce(notes, '')));

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER games_updated_at BEFORE UPDATE ON games FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', 'Player'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('blanks', 'blanks', false);
