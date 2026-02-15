# Habits - Task Plan

> SINGLE SOURCE OF TRUTH for all tasks
> Updated: 2026-02-09

## Legend
- `[ ]` Pending
- `[~]` In Progress
- `[x]` Completed
- `[!]` Blocked

---

## Phase 1: Project Setup ✅

### 1.1 Initialize Next.js Project
- [x] **Task**: Create Next.js 14 app with TypeScript
- **Files**: `package.json`, `tsconfig.json`, `next.config.js`
- **Verify**: `npm run dev` works ✅

### 1.2 Install Dependencies
- [x] **Task**: Install all required packages
- **Files**: `package.json`
- **Verify**: No install errors ✅

### 1.3 Setup shadcn/ui
- [x] **Task**: Initialize shadcn/ui and add base components
- **Files**: `components.json`, `src/components/ui/*`
- **Verify**: Components in `src/components/ui/` ✅

### 1.4 Configure PWA
- [x] **Task**: Setup next-pwa configuration
- **Files**: `next.config.js`, `public/manifest.json`, `public/icons/*`
- **Verify**: Manifest accessible at `/manifest.json` ✅

### 1.5 Setup i18n
- [x] **Task**: Configure next-intl for internationalization
- **Files**: `src/i18n/request.ts`, `src/messages/en.json`
- **Verify**: i18n configured ✅

### 1.6 Setup Supabase
- [x] **Task**: Initialize Supabase client and types
- **Files**: `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`, `src/lib/supabase/types.ts`
- **Verify**: Clients ready ✅

### 1.7 Database Schema
- [x] **Task**: Create all database tables
- **Files**: `supabase/migrations/001_initial_schema.sql`
- **Verify**: Schema ready for deployment ✅

### 1.8 Seed Preset Habits
- [x] **Task**: Add preset habits to database
- **Files**: `supabase/seed.sql`
- **Verify**: Seed file ready ✅

---

## Phase 2: Wallet Integration ✅

### 2.1 Wallet Provider Setup
- [x] **Task**: Create Solana wallet provider
- **Files**: `src/components/wallet/WalletProvider.tsx`
- **Verify**: Wallet provider ready ✅

### 2.2 Connect Button
- [x] **Task**: Create wallet connect button component
- **Files**: `src/components/wallet/ConnectButton.tsx`
- **Verify**: ConnectButton ready ✅

### 2.3 Auth with Wallet
- [x] **Task**: Implement sign-message auth flow
- **Files**: `src/lib/solana/auth.ts`, `src/app/api/auth/route.ts`, `src/lib/hooks/useAuth.ts`
- **Verify**: Auth flow implemented ✅

---

## Phase 3: Core Layout ✅

### 3.1 Mobile Layout
- [x] **Task**: Create mobile-first layout with bottom nav
- **Files**: `src/components/layout/MobileLayout.tsx`, `src/components/layout/BottomNav.tsx`, `src/components/layout/Header.tsx`
- **Verify**: Layout ready ✅

### 3.2 App Layout
- [x] **Task**: Setup root layout with providers
- **Files**: `src/app/layout.tsx`
- **Verify**: Full layout renders ✅

### 3.3 Landing Page
- [x] **Task**: Create marketing landing page
- **Files**: `src/app/page.tsx`, `src/components/landing/*`
- **Verify**: Landing page loads ✅

### 3.4 Dashboard Page
- [x] **Task**: Create main dashboard
- **Files**: `src/app/dashboard/page.tsx`, `src/components/dashboard/*`
- **Verify**: Dashboard loads with mock data ✅

---

## Phase 4: Habits Feature ✅

### 4.1 Habits List Page
- [x] **Task**: Create habits list view
- **Files**: `src/app/habits/page.tsx`, `src/components/habits/HabitCard.tsx`
- **Verify**: Page renders ✅

### 4.2 Create Habit Page
- [x] **Task**: Create new habit form
- **Files**: `src/app/habits/new/page.tsx`, `src/components/habits/HabitForm.tsx`
- **Verify**: Form ready ✅

### 4.3 Habit Detail Page
- [x] **Task**: Create habit detail with logging
- **Files**: `src/app/habits/[id]/page.tsx`, `src/components/habits/ActionButton.tsx`, `src/components/habits/StreakBadge.tsx`
- **Verify**: Page renders ✅

### 4.4 Habits API
- [x] **Task**: Create habits CRUD API
- **Files**: `src/app/api/habits/route.ts`, `src/app/api/habits/[id]/route.ts`, `src/app/api/habits/presets/route.ts`
- **Verify**: API ready ✅

### 4.5 Habits Hook
- [x] **Task**: Create React hook for habits
- **Files**: `src/lib/hooks/useHabits.ts`
- **Verify**: Hook ready ✅

---

## Phase 5: Logging Feature ✅

### 5.1 Solana Connection
- [x] **Task**: Setup Solana client
- **Files**: `src/lib/solana/client.ts`
- **Verify**: Connection established ✅

### 5.2 Log Transaction Builder
- [x] **Task**: Create transaction for logging
- **Files**: `src/lib/solana/transactions.ts`
- **Verify**: Transaction builds correctly ✅

### 5.3 Action Logging UI
- [x] **Task**: Implement tap-to-log with transaction
- **Files**: `src/app/habits/[id]/page.tsx`, `src/lib/hooks/useLogging.ts`
- **Verify**: Full log flow works ✅

### 5.4 Logs API
- [x] **Task**: Create logs API
- **Files**: `src/app/api/logs/route.ts`
- **Verify**: Logs saved to database ✅

### 5.5 Points Calculation
- [x] **Task**: Award points on log
- **Files**: `src/app/api/logs/route.ts` (integrated)
- **Verify**: Points accumulate correctly ✅

### 5.6 Streak Calculation
- [x] **Task**: Calculate and update streaks
- **Files**: `src/app/api/logs/route.ts` (integrated)
- **Verify**: Streaks update correctly ✅

---

## Phase 6: Bets Feature ✅

### 6.1 Bets List Page
- [x] **Task**: Create bets list view
- **Files**: `src/app/bets/page.tsx`, `src/components/bets/BetCard.tsx`
- **Verify**: Page renders ✅

### 6.2 Create Bet Page
- [x] **Task**: Create bet form
- **Files**: `src/app/bets/new/page.tsx`, `src/components/bets/BetForm.tsx`
- **Verify**: Form renders ✅

### 6.3 Bet Escrow Transaction
- [x] **Task**: Create bet with SOL escrow
- **Files**: `src/lib/solana/transactions.ts`
- **Verify**: SOL transferred to escrow ✅

### 6.4 Bets API
- [x] **Task**: Create bets API
- **Files**: `src/app/api/bets/route.ts`, `src/app/api/bets/[id]/route.ts`
- **Verify**: API works ✅

### 6.5 Bet Resolution Logic
- [x] **Task**: Implement bet resolution
- **Files**: `src/app/api/bets/[id]/route.ts` (integrated)
- **Verify**: Resolution calculates correctly ✅

---

## Phase 7: Leaderboard ✅

### 7.1 Leaderboard Page
- [x] **Task**: Create leaderboard view
- **Files**: `src/app/leaderboard/page.tsx`
- **Features**:
  - Top users by points
  - Top users by streaks
  - User's rank
- **Verify**: Page renders ✅

### 7.2 Leaderboard API
- [x] **Task**: Create leaderboard API
- **Files**: `src/app/api/leaderboard/route.ts`
- **Endpoints**:
  - GET /api/leaderboard?type=points
  - GET /api/leaderboard?type=streaks
- **Verify**: Returns ranked users ✅

---

## Phase 8: Admin Panel ✅

### 8.1 Admin Page
- [x] **Task**: Create admin panel
- **Files**: `src/app/admin/page.tsx`
- **Features**:
  - Config editor
  - Platform stats
  - Preset management
- **Protected**: Only admin wallets ✅

### 8.2 Admin API
- [x] **Task**: Create admin API
- **Files**: `src/app/api/admin/route.ts`, `src/app/api/admin/config/route.ts`, `src/app/api/admin/presets/route.ts`
- **Endpoints**:
  - GET /api/admin/config - get all config
  - PUT /api/admin/config - update config
  - POST /api/admin/presets - add preset
- **Verify**: Config updates work ✅

### 8.3 Admin Auth
- [x] **Task**: Implement admin wallet check
- **Files**: `src/lib/utils/admin.ts`
- **Logic**:
  - Check wallet against ADMIN_WALLET_ADDRESSES env
  - Reject if not admin
- **Verify**: Non-admins blocked ✅

---

## Phase 9: Polish & Deploy

### 9.1 Error Handling
- [x] **Task**: Add global error handling
- **Files**: `src/app/error.tsx`, `src/app/not-found.tsx`
- **Features**:
  - Friendly error pages
  - Toast notifications for errors
- **Verify**: Errors display nicely ✅

### 9.2 Loading States
- [x] **Task**: Add loading skeletons
- **Files**: `src/app/loading.tsx`, various components
- **Features**:
  - Skeleton cards
  - Loading spinners
- **Verify**: No layout shift ✅

### 9.3 Responsive Design Check
- [x] **Task**: Test and fix responsive issues
- **Setup**: Mobile-first design with `max-w-md mx-auto`
- **Verify**: All pages use responsive Tailwind classes ✅

### 9.4 PWA Testing
- [x] **Task**: Setup PWA configuration
- **Files**: `next.config.js` (next-pwa), `public/manifest.json`
- **Verify**: PWA config ready ✅
- **Manual**: Test install flow on device

### 9.5 Deploy to Vercel
- [ ] **Task**: Deploy production build
- **Steps**:
  1. Connect repo to Vercel
  2. Add environment variables (see .env.example)
  3. Deploy
- **Verify**: App live at habits.vercel.app (or custom domain)

### 9.6 Switch to Mainnet
- [x] **Task**: Configure for mainnet
- **Config**: Via environment variables
- **Steps**:
  1. Set `NEXT_PUBLIC_SOLANA_RPC_URL` to mainnet RPC (Helius, etc.)
  2. Set `NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta`
  3. Set `ESCROW_WALLET_ADDRESS` to production escrow
- **Verify**: Ready for mainnet deployment ✅

---

## Phase 10: Launch

### 10.1 Final Testing
- [ ] **Task**: Full end-to-end test
- **Checklist**:
  - [ ] Connect wallet
  - [ ] Create habit
  - [ ] Log actions
  - [ ] Check streaks
  - [ ] View points
  - [ ] Check leaderboard
  - [ ] Admin panel works
- **Verify**: All flows work

### 10.2 Submit to dApp Store
- [ ] **Task**: Submit to Solana dApp Store
- **Steps**:
  1. Prepare app listing
  2. Create screenshots
  3. Write description
  4. Submit for review
- **Verify**: Submission accepted

---

## Summary

| Phase | Tasks | Status |
|-------|-------|--------|
| 1. Project Setup | 8 | ✅ Complete |
| 2. Wallet Integration | 3 | ✅ Complete |
| 3. Core Layout | 4 | ✅ Complete |
| 4. Habits Feature | 5 | ✅ Complete |
| 5. Logging Feature | 6 | ✅ Complete |
| 6. Bets Feature | 5 | ✅ Complete |
| 7. Leaderboard | 2 | ✅ Complete |
| 8. Admin Panel | 3 | ✅ Complete |
| 9. Polish & Deploy | 6 | 🔄 In Progress (5/6) |
| 10. Launch | 2 | Pending |
| **TOTAL** | **44** | **41 done** |

---

## Parallelization Notes

**Can run in parallel:**
- Phase 1.1-1.5 (setup tasks)
- Phase 4 + Phase 6 (habits + bets UI)
- Phase 7 + Phase 8 (leaderboard + admin)

**Must be sequential:**
- Phase 1 → Phase 2 (need setup before wallet)
- Phase 2 → Phase 3 (need wallet before layout)
- Phase 4 → Phase 5 (need habits before logging)
- Phase 9 → Phase 10 (need polish before launch)
