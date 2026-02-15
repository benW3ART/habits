-- Preset Habits Seed Data
-- Run this after migrations to populate preset_habits table

INSERT INTO preset_habits (name, description, category, goal, positive_actions, negative_actions, icon, is_active) VALUES

-- Health & Fitness
(
  'Quit Smoking',
  'Break free from nicotine addiction and reclaim your health',
  'health',
  'Stay smoke-free for 30 days',
  '[{"name": "Resisted craving", "points": 10}, {"name": "Used nicotine patch", "points": 5}, {"name": "Exercised instead", "points": 15}]',
  '[{"name": "Smoked a cigarette", "points": -20}, {"name": "Bummed a smoke", "points": -15}, {"name": "Bought a pack", "points": -30}]',
  '🚭',
  true
),
(
  'Exercise Daily',
  'Build strength and endurance through consistent physical activity',
  'fitness',
  'Work out at least 30 minutes daily',
  '[{"name": "Completed workout", "points": 20}, {"name": "Walked 10k steps", "points": 15}, {"name": "Stretched/yoga", "points": 10}, {"name": "Active commute", "points": 10}]',
  '[{"name": "Skipped planned workout", "points": -15}, {"name": "Sedentary all day", "points": -10}]',
  '💪',
  true
),
(
  'Drink Water',
  'Stay hydrated for better energy, skin, and overall health',
  'health',
  'Drink 8 glasses (2L) of water daily',
  '[{"name": "Drank a glass", "points": 5}, {"name": "Hit daily goal", "points": 20}, {"name": "Morning hydration", "points": 10}]',
  '[{"name": "Drank soda instead", "points": -10}, {"name": "Forgot to hydrate", "points": -5}]',
  '💧',
  true
),

-- Mental Wellness
(
  'Meditate',
  'Cultivate inner peace and mental clarity through mindfulness',
  'mental',
  'Meditate for at least 10 minutes daily',
  '[{"name": "Morning meditation", "points": 15}, {"name": "Evening wind-down", "points": 15}, {"name": "Breathing exercise", "points": 10}, {"name": "Mindful moment", "points": 5}]',
  '[{"name": "Skipped meditation", "points": -10}, {"name": "Let stress take over", "points": -5}]',
  '🧘',
  true
),
(
  'Read Books',
  'Expand your mind and knowledge through daily reading',
  'learning',
  'Read at least 20 pages daily',
  '[{"name": "Read 20+ pages", "points": 15}, {"name": "Finished a chapter", "points": 20}, {"name": "Read before bed", "points": 10}, {"name": "Listened to audiobook", "points": 10}]',
  '[{"name": "Scrolled instead of reading", "points": -10}, {"name": "Skipped reading time", "points": -5}]',
  '📚',
  true
),

-- Digital Wellness
(
  'No Social Media',
  'Reclaim your time and attention from endless scrolling',
  'digital',
  'Limit social media to 30 minutes or less daily',
  '[{"name": "Social-free morning", "points": 15}, {"name": "Stayed under limit", "points": 20}, {"name": "Deleted an app", "points": 25}, {"name": "Used app blocker", "points": 10}]',
  '[{"name": "Mindless scrolling", "points": -15}, {"name": "Exceeded time limit", "points": -10}, {"name": "Checked first thing", "points": -10}]',
  '📵',
  true
),

-- Sleep & Rest
(
  'Sleep Early',
  'Optimize your rest for better energy and mental clarity',
  'health',
  'Be in bed by 10:30 PM every night',
  '[{"name": "In bed on time", "points": 20}, {"name": "No screens before bed", "points": 15}, {"name": "8 hours of sleep", "points": 15}, {"name": "Morning energy boost", "points": 10}]',
  '[{"name": "Stayed up late", "points": -15}, {"name": "Screen time in bed", "points": -10}, {"name": "Hit snooze 3+ times", "points": -5}]',
  '😴',
  true
),

-- Nutrition
(
  'Eat Healthy',
  'Fuel your body with nutritious, whole foods',
  'nutrition',
  'Eat at least 5 servings of fruits/vegetables daily',
  '[{"name": "Ate vegetables", "points": 10}, {"name": "Chose healthy snack", "points": 10}, {"name": "Cooked at home", "points": 15}, {"name": "Skipped junk food", "points": 15}, {"name": "Meal prepped", "points": 20}]',
  '[{"name": "Fast food meal", "points": -15}, {"name": "Sugary snack", "points": -10}, {"name": "Skipped breakfast", "points": -5}, {"name": "Late night eating", "points": -10}]',
  '🥗',
  true
);

-- Add default config values
INSERT INTO config (key, value) VALUES
('points_per_log', '{"base": 10, "streak_bonus": 5, "max_streak_bonus": 50}'),
('bet_settings', '{"min_stake_lamports": 10000000, "max_stake_lamports": 1000000000, "rake_percent": 5, "min_duration_days": 7, "max_duration_days": 90}'),
('token_settings', '{"symbol": "HABITS", "total_supply": 1000000000, "airdrop_allocation_percent": 20}'),
('skr_optimization', '{"target_daily_txs": 3, "max_daily_txs": 5, "memo_prefix": "HABITS:"}')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
