-- Users (linked to wallet)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT UNIQUE NOT NULL,
  username TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habits
CREATE TABLE habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  goal TEXT,
  positive_actions JSONB DEFAULT '[]',
  negative_actions JSONB DEFAULT '[]',
  is_preset BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Action Logs
CREATE TABLE logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  action_name TEXT NOT NULL,
  value INTEGER DEFAULT 1,
  comment TEXT,
  points_earned INTEGER DEFAULT 0,
  tx_signature TEXT,
  logged_at TIMESTAMPTZ DEFAULT NOW()
);

-- Streaks (computed, cached)
CREATE TABLE streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_log_date DATE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(habit_id, user_id)
);

-- Bets
CREATE TABLE bets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  habit_id UUID REFERENCES habits(id) ON DELETE SET NULL,
  goal_description TEXT NOT NULL,
  stake_amount BIGINT NOT NULL,
  stake_tx_signature TEXT,
  duration_days INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT DEFAULT 'active',
  daily_log_required BOOLEAN DEFAULT TRUE,
  missed_days INTEGER DEFAULT 0,
  payout_tx_signature TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- Points (for future $HABITS airdrop)
CREATE TABLE points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  amount INTEGER NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Preset Habits (admin-managed)
CREATE TABLE preset_habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  goal TEXT,
  positive_actions JSONB DEFAULT '[]',
  negative_actions JSONB DEFAULT '[]',
  icon TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Config (admin panel)
CREATE TABLE config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_habits_user_id ON habits(user_id);
CREATE INDEX idx_logs_habit_id ON logs(habit_id);
CREATE INDEX idx_logs_user_id ON logs(user_id);
CREATE INDEX idx_logs_logged_at ON logs(logged_at);
CREATE INDEX idx_bets_user_id ON bets(user_id);
CREATE INDEX idx_bets_status ON bets(status);
CREATE INDEX idx_points_user_id ON points(user_id);
CREATE INDEX idx_streaks_user_id ON streaks(user_id);

-- RLS Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE points ENABLE ROW LEVEL SECURITY;

-- Users can view/update their own data
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (true);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (true);

-- Habits policies
CREATE POLICY "Users can view own habits" ON habits FOR SELECT USING (true);
CREATE POLICY "Users can insert own habits" ON habits FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own habits" ON habits FOR UPDATE USING (true);
CREATE POLICY "Users can delete own habits" ON habits FOR DELETE USING (true);

-- Logs policies
CREATE POLICY "Users can view own logs" ON logs FOR SELECT USING (true);
CREATE POLICY "Users can insert own logs" ON logs FOR INSERT WITH CHECK (true);

-- Streaks policies
CREATE POLICY "Users can view own streaks" ON streaks FOR SELECT USING (true);
CREATE POLICY "Users can manage own streaks" ON streaks FOR ALL USING (true);

-- Bets policies
CREATE POLICY "Users can view own bets" ON bets FOR SELECT USING (true);
CREATE POLICY "Users can insert own bets" ON bets FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own bets" ON bets FOR UPDATE USING (true);

-- Points policies
CREATE POLICY "Users can view own points" ON points FOR SELECT USING (true);
CREATE POLICY "Users can insert own points" ON points FOR INSERT WITH CHECK (true);

-- Preset habits are public
ALTER TABLE preset_habits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view preset habits" ON preset_habits FOR SELECT USING (true);

-- Config is public read
ALTER TABLE config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view config" ON config FOR SELECT USING (true);
