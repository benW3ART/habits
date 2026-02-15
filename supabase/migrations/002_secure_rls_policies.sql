-- Migration: Secure RLS Policies
-- This migration drops the permissive USING (true) policies and implements proper security.
--
-- NOTE: This app uses wallet-based authentication (not Supabase Auth), so we can't use auth.uid().
-- All API requests use the service_role key which bypasses RLS.
-- These policies provide defense-in-depth for any future anon key usage.

-- ============================================================================
-- DROP EXISTING PERMISSIVE POLICIES
-- ============================================================================

-- Users table
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

-- Habits table
DROP POLICY IF EXISTS "Users can view own habits" ON habits;
DROP POLICY IF EXISTS "Users can insert own habits" ON habits;
DROP POLICY IF EXISTS "Users can update own habits" ON habits;
DROP POLICY IF EXISTS "Users can delete own habits" ON habits;

-- Logs table
DROP POLICY IF EXISTS "Users can view own logs" ON logs;
DROP POLICY IF EXISTS "Users can insert own logs" ON logs;

-- Streaks table
DROP POLICY IF EXISTS "Users can view own streaks" ON streaks;
DROP POLICY IF EXISTS "Users can manage own streaks" ON streaks;

-- Bets table
DROP POLICY IF EXISTS "Users can view own bets" ON bets;
DROP POLICY IF EXISTS "Users can insert own bets" ON bets;
DROP POLICY IF EXISTS "Users can update own bets" ON bets;

-- Points table
DROP POLICY IF EXISTS "Users can view own points" ON points;
DROP POLICY IF EXISTS "Users can insert own points" ON points;

-- Preset habits table
DROP POLICY IF EXISTS "Anyone can view preset habits" ON preset_habits;

-- Config table
DROP POLICY IF EXISTS "Anyone can view config" ON config;

-- ============================================================================
-- HELPER FUNCTION: Get current user ID from JWT claims
-- ============================================================================

-- This function extracts user_id from a custom JWT claim set by the API.
-- For wallet-based auth, the API should set this claim when creating the JWT.
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS UUID AS $$
BEGIN
  -- Try to get user_id from JWT claims
  RETURN NULLIF(current_setting('request.jwt.claims', true)::json->>'user_id', '')::UUID;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- USERS TABLE: Own profile only
-- ============================================================================

-- Users can view their own profile only
CREATE POLICY "users_select_own"
  ON users FOR SELECT
  USING (id = get_current_user_id());

-- Users can update their own profile only  
CREATE POLICY "users_update_own"
  ON users FOR UPDATE
  USING (id = get_current_user_id())
  WITH CHECK (id = get_current_user_id());

-- Users can insert their own profile (initial registration via API)
-- This is permissive for registration flow - API validates wallet ownership
CREATE POLICY "users_insert_own"
  ON users FOR INSERT
  WITH CHECK (true); -- Registration is validated at API level via wallet signature

-- ============================================================================
-- HABITS TABLE: Own habits only
-- ============================================================================

CREATE POLICY "habits_select_own"
  ON habits FOR SELECT
  USING (user_id = get_current_user_id());

CREATE POLICY "habits_insert_own"
  ON habits FOR INSERT
  WITH CHECK (user_id = get_current_user_id());

CREATE POLICY "habits_update_own"
  ON habits FOR UPDATE
  USING (user_id = get_current_user_id())
  WITH CHECK (user_id = get_current_user_id());

CREATE POLICY "habits_delete_own"
  ON habits FOR DELETE
  USING (user_id = get_current_user_id());

-- ============================================================================
-- LOGS TABLE: Own logs only
-- ============================================================================

CREATE POLICY "logs_select_own"
  ON logs FOR SELECT
  USING (user_id = get_current_user_id());

CREATE POLICY "logs_insert_own"
  ON logs FOR INSERT
  WITH CHECK (user_id = get_current_user_id());

-- Logs are immutable - no update/delete policies

-- ============================================================================
-- STREAKS TABLE: Own streaks only
-- ============================================================================

CREATE POLICY "streaks_select_own"
  ON streaks FOR SELECT
  USING (user_id = get_current_user_id());

-- Streaks are managed by the system, not directly by users
-- Only service_role can insert/update/delete

-- ============================================================================
-- BETS TABLE: Public read (leaderboard), own write
-- ============================================================================

-- Anyone can view bets (for leaderboard)
CREATE POLICY "bets_select_public"
  ON bets FOR SELECT
  USING (true);

-- Users can only create their own bets
CREATE POLICY "bets_insert_own"
  ON bets FOR INSERT
  WITH CHECK (user_id = get_current_user_id());

-- Users can only update their own bets (limited - status changes via API)
CREATE POLICY "bets_update_own"
  ON bets FOR UPDATE
  USING (user_id = get_current_user_id())
  WITH CHECK (user_id = get_current_user_id());

-- Users cannot delete bets (financial records should be immutable)

-- ============================================================================
-- POINTS TABLE: Public read (leaderboard), system write only
-- ============================================================================

-- Anyone can view points (for leaderboard)
CREATE POLICY "points_select_public"
  ON points FOR SELECT
  USING (true);

-- Points can only be inserted by service_role (no policy = denied for anon)
-- This means no INSERT policy - only service_role can insert

-- ============================================================================
-- PRESET HABITS TABLE: Public read, admin write
-- ============================================================================

-- Anyone can view preset habits
CREATE POLICY "preset_habits_select_public"
  ON preset_habits FOR SELECT
  USING (true);

-- Admin writes are handled via service_role (no INSERT/UPDATE/DELETE policies)

-- ============================================================================
-- CONFIG TABLE: Public read, admin write
-- ============================================================================

-- Anyone can view config
CREATE POLICY "config_select_public"
  ON config FOR SELECT
  USING (true);

-- Admin writes are handled via service_role (no INSERT/UPDATE/DELETE policies)

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON FUNCTION get_current_user_id() IS 'Extracts user_id from JWT claims for RLS policies. Returns NULL if no JWT or claim present.';
COMMENT ON POLICY "users_select_own" ON users IS 'Users can only view their own profile';
COMMENT ON POLICY "habits_select_own" ON habits IS 'Users can only view their own habits';
COMMENT ON POLICY "bets_select_public" ON bets IS 'Public read for leaderboard functionality';
COMMENT ON POLICY "points_select_public" ON points IS 'Public read for leaderboard functionality';
