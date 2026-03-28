-- Row Level Security policies (from PRD 6.6)

-- Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select" ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_update" ON profiles FOR UPDATE TO authenticated
  USING (id = auth.uid() OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));
CREATE POLICY "profiles_delete" ON profiles FOR DELETE TO authenticated
  USING (id = auth.uid() OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- Tournaments
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tournaments_select" ON tournaments FOR SELECT TO authenticated USING (true);
CREATE POLICY "tournaments_insert" ON tournaments FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('arbiter', 'admin')));
CREATE POLICY "tournaments_update" ON tournaments FOR UPDATE TO authenticated
  USING (organizer_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Games
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
CREATE POLICY "games_select" ON games FOR SELECT TO authenticated USING (true);
CREATE POLICY "games_insert" ON games FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
CREATE POLICY "games_update" ON games FOR UPDATE TO authenticated
  USING (created_by = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('arbiter', 'admin')));

-- Moves
ALTER TABLE moves ENABLE ROW LEVEL SECURITY;
CREATE POLICY "moves_select" ON moves FOR SELECT TO authenticated USING (true);
CREATE POLICY "moves_insert" ON moves FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM games WHERE id = game_id AND created_by = auth.uid()));

-- OCR Jobs
ALTER TABLE ocr_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ocr_select" ON ocr_jobs FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "ocr_insert" ON ocr_jobs FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "ocr_update" ON ocr_jobs FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Storage policies
CREATE POLICY "avatars_select" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "avatars_insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars');
CREATE POLICY "blanks_select" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'blanks' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "blanks_insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'blanks' AND auth.uid()::text = (storage.foldername(name))[1]);
