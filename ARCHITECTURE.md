# Habits - Technical Architecture

> Change2Earn PWA for Solana Seeker | Ship this week

## Tech Stack

| Layer | Technology | Why |
|-------|------------|-----|
| **Frontend** | Next.js 14 (App Router) | Fast dev, great DX, SSR/SSG |
| **Styling** | TailwindCSS + shadcn/ui | Rapid UI development |
| **Language** | TypeScript (strict) | Type safety, fewer bugs |
| **PWA** | next-pwa | Installable on Seeker |
| **i18n** | next-intl | Ready for translations |
| **Wallet** | @solana/wallet-adapter | Phantom + Seed Vault |
| **Blockchain** | Solana (mainnet-beta) | Fast, cheap transactions |
| **Solana Program** | Anchor | Simplified program development |
| **Database** | Supabase (PostgreSQL) | Auth + realtime + fast setup |
| **Hosting** | Vercel | Zero-config deploys |
| **RPC** | Helius (free tier) | Reliable Solana RPC |

---

## Project Structure

```
habits/
├── .claude/
│   ├── plan.md                 # SINGLE SOURCE OF TRUTH for tasks
│   ├── discovery/
│   │   └── DISCOVERY.xml
│   └── skills/                 # Genius Team skills
├── .genius/
│   ├── state.json
│   ├── config.json
│   └── memory/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── [locale]/           # i18n wrapper
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx        # Landing/Dashboard
│   │   │   ├── habits/
│   │   │   │   ├── page.tsx    # Habits list
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx # Create habit
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx # Habit detail + logging
│   │   │   ├── bets/
│   │   │   │   ├── page.tsx    # Active bets
│   │   │   │   └── new/
│   │   │   │       └── page.tsx # Create bet
│   │   │   ├── leaderboard/
│   │   │   │   └── page.tsx
│   │   │   └── admin/
│   │   │       └── page.tsx    # Admin panel (protected)
│   │   ├── api/
│   │   │   ├── habits/
│   │   │   │   └── route.ts
│   │   │   ├── logs/
│   │   │   │   └── route.ts
│   │   │   ├── bets/
│   │   │   │   └── route.ts
│   │   │   ├── points/
│   │   │   │   └── route.ts
│   │   │   ├── leaderboard/
│   │   │   │   └── route.ts
│   │   │   └── admin/
│   │   │       └── route.ts
│   │   ├── globals.css
│   │   └── manifest.ts         # PWA manifest
│   ├── components/
│   │   ├── ui/                 # shadcn components
│   │   ├── wallet/
│   │   │   ├── WalletProvider.tsx
│   │   │   └── ConnectButton.tsx
│   │   ├── habits/
│   │   │   ├── HabitCard.tsx
│   │   │   ├── HabitForm.tsx
│   │   │   ├── ActionButton.tsx
│   │   │   └── StreakBadge.tsx
│   │   ├── bets/
│   │   │   ├── BetCard.tsx
│   │   │   └── BetForm.tsx
│   │   ├── dashboard/
│   │   │   ├── StatsCard.tsx
│   │   │   ├── ActivityFeed.tsx
│   │   │   └── PointsTeaser.tsx
│   │   └── layout/
│   │       ├── Header.tsx
│   │       ├── BottomNav.tsx
│   │       └── MobileLayout.tsx
│   ├── lib/
│   │   ├── solana/
│   │   │   ├── client.ts       # Solana connection
│   │   │   ├── program.ts      # Anchor program interface
│   │   │   └── transactions.ts # TX builders
│   │   ├── supabase/
│   │   │   ├── client.ts       # Supabase client
│   │   │   ├── server.ts       # Server-side client
│   │   │   └── types.ts        # Generated types
│   │   ├── hooks/
│   │   │   ├── useHabits.ts
│   │   │   ├── useBets.ts
│   │   │   ├── usePoints.ts
│   │   │   └── useLeaderboard.ts
│   │   └── utils/
│   │       ├── constants.ts
│   │       ├── formatting.ts
│   │       └── validation.ts
│   ├── i18n/
│   │   ├── request.ts
│   │   └── routing.ts
│   └── messages/
│       ├── en.json
│       └── fr.json             # Ready for translation
├── programs/                   # Solana Anchor programs
│   └── habits/
│       ├── Anchor.toml
│       ├── Cargo.toml
│       └── src/
│           └── lib.rs          # Main program
├── public/
│   ├── icons/                  # PWA icons
│   └── images/
├── supabase/
│   ├── migrations/             # Database schema
│   └── seed.sql                # Preset habits
├── .env.example
├── .env.local
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Data Model

### Supabase Tables

```sql
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
  positive_actions JSONB DEFAULT '[]',  -- [{name, emoji, points}]
  negative_actions JSONB DEFAULT '[]',  -- [{name, emoji, points}]
  is_preset BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Action Logs
CREATE TABLE logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,            -- 'positive' | 'negative'
  action_name TEXT NOT NULL,
  value INTEGER DEFAULT 1,              -- For counted actions
  comment TEXT,
  points_earned INTEGER DEFAULT 0,
  tx_signature TEXT,                    -- Solana transaction
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
  stake_amount BIGINT NOT NULL,         -- Lamports
  stake_tx_signature TEXT,
  duration_days INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT DEFAULT 'active',         -- 'active' | 'won' | 'lost' | 'forfeited'
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
  action TEXT NOT NULL,                 -- 'log' | 'streak_7' | 'streak_30' | 'bet_won' | 'referral'
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

-- Initial config values
INSERT INTO config (key, value) VALUES
  ('points_per_log', '{"positive": 10, "negative": 5}'),
  ('streak_bonus', '{"7": 50, "30": 250}'),
  ('bet_rake_percent', '5'),
  ('daily_log_limit', '50'),
  ('bet_forfeit_percent', '20');
```

### Supabase RLS Policies

```sql
-- Users can only see their own data
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (wallet_address = current_setting('app.wallet_address'));
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (wallet_address = current_setting('app.wallet_address'));

-- Similar policies for habits, logs, bets, points...
```

---

## Solana Program (Anchor)

### V1 Scope (MVP)
Simple program that records habit logs on-chain:

```rust
use anchor_lang::prelude::*;

declare_id!("HaBiT..."); // Program ID

#[program]
pub mod habits {
    use super::*;

    // Log a habit action (creates on-chain record)
    pub fn log_action(
        ctx: Context<LogAction>,
        habit_id: String,
        action_type: String,
        action_name: String,
        value: u32,
    ) -> Result<()> {
        let log = &mut ctx.accounts.log_account;
        log.user = ctx.accounts.user.key();
        log.habit_id = habit_id;
        log.action_type = action_type;
        log.action_name = action_name;
        log.value = value;
        log.timestamp = Clock::get()?.unix_timestamp;
        Ok(())
    }

    // Create a bet (escrow SOL)
    pub fn create_bet(
        ctx: Context<CreateBet>,
        goal: String,
        duration_days: u32,
        stake_amount: u64,
    ) -> Result<()> {
        // Transfer SOL to escrow PDA
        // Store bet details
        Ok(())
    }

    // Resolve bet (winner/loser)
    pub fn resolve_bet(
        ctx: Context<ResolveBet>,
        won: bool,
    ) -> Result<()> {
        // Return stake to winner (minus rake) or transfer to protocol
        Ok(())
    }
}

#[account]
pub struct LogAccount {
    pub user: Pubkey,
    pub habit_id: String,
    pub action_type: String,
    pub action_name: String,
    pub value: u32,
    pub timestamp: i64,
}

#[account]
pub struct BetAccount {
    pub user: Pubkey,
    pub goal: String,
    pub stake_amount: u64,
    pub duration_days: u32,
    pub start_timestamp: i64,
    pub end_timestamp: i64,
    pub status: u8, // 0=active, 1=won, 2=lost
}
```

### Transaction Cost
- Log action: ~0.000005 SOL (rent-exempt minimum for small account)
- Create bet: ~0.001 SOL (larger account + escrow)

---

## API Routes

### Public Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/habits` | List user's habits |
| POST | `/api/habits` | Create new habit |
| GET | `/api/habits/presets` | Get preset habits |
| POST | `/api/logs` | Log an action |
| GET | `/api/logs?habit_id=X` | Get logs for habit |
| GET | `/api/bets` | List user's bets |
| POST | `/api/bets` | Create new bet |
| GET | `/api/points` | Get user's points |
| GET | `/api/leaderboard` | Get top users |

### Admin Endpoints (Protected)

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/admin/config` | Get all config |
| PUT | `/api/admin/config/:key` | Update config value |
| GET | `/api/admin/stats` | Get platform stats |
| POST | `/api/admin/presets` | Add preset habit |

---

## Authentication Flow

1. User clicks "Connect Wallet"
2. Wallet adapter prompts for connection (Phantom/Seed Vault)
3. On connect, sign a message to verify ownership
4. Backend creates/updates user in Supabase
5. JWT with wallet_address claim for API auth

---

## PWA Configuration

```js
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
});

module.exports = withPWA({
  // Next.js config
});
```

### Manifest
```json
{
  "name": "Habits - Change2Earn",
  "short_name": "Habits",
  "description": "Log your habits, earn rewards",
  "theme_color": "#8B5CF6",
  "background_color": "#0F0F0F",
  "display": "standalone",
  "orientation": "portrait",
  "scope": "/",
  "start_url": "/",
  "icons": [...]
}
```

---

## Environment Variables

```bash
# .env.local

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Solana
NEXT_PUBLIC_SOLANA_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY
NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
NEXT_PUBLIC_HABITS_PROGRAM_ID=

# Admin
ADMIN_WALLET_ADDRESSES=wallet1,wallet2
```

---

## Security Considerations

1. **Wallet verification**: Sign message on connect, verify signature
2. **Rate limiting**: Max 50 logs/day per user (configurable)
3. **Input validation**: Sanitize all user inputs
4. **RLS policies**: Supabase row-level security for data isolation
5. **Admin protection**: Whitelist wallet addresses for admin routes
6. **Transaction validation**: Verify tx signatures before awarding points

---

## Performance Targets

| Metric | Target |
|--------|--------|
| LCP (Largest Contentful Paint) | < 2.5s |
| FID (First Input Delay) | < 100ms |
| CLS (Cumulative Layout Shift) | < 0.1 |
| API Response Time | < 200ms |
| Transaction Confirmation | < 1s (Solana) |

---

## Deployment Strategy

### Phase 1: Devnet (Day 1-2)
- Deploy Anchor program to devnet
- Deploy Next.js to Vercel (preview)
- Test full flow with devnet SOL

### Phase 2: Mainnet (Day 3-4)
- Deploy program to mainnet-beta
- Switch RPC to mainnet
- Deploy to production Vercel

### Phase 3: dApp Store (Day 5+)
- Submit to Solana dApp Store
- Create marketing materials
- Announce on Twitter/Discord

---

## Next Steps

1. Generate `.claude/plan.md` with all tasks
2. User approval
3. Begin execution with genius-orchestrator
