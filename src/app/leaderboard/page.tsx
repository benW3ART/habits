'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useWallet } from '@solana/wallet-adapter-react'
import { MobileLayout } from '@/components/layout'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Trophy, Flame, Loader2, Medal } from 'lucide-react'

interface LeaderboardUser {
  rank: number
  walletAddress: string
  username: string | null
  totalPoints?: number
  maxStreak?: number
}

interface LeaderboardResponse {
  leaderboard: LeaderboardUser[]
  userRank: LeaderboardUser | null
  type: 'points' | 'streaks'
}

function abbreviateWallet(address: string): string {
  if (!address || address.length < 8) return address
  return `${address.slice(0, 4)}...${address.slice(-4)}`
}

function getRankBadge(rank: number) {
  switch (rank) {
    case 1:
      return (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-500 text-black font-bold">
          <Medal className="w-5 h-5" />
        </div>
      )
    case 2:
      return (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-400 text-black font-bold">
          <Medal className="w-5 h-5" />
        </div>
      )
    case 3:
      return (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-700 text-white font-bold">
          <Medal className="w-5 h-5" />
        </div>
      )
    default:
      return (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-surface border border-border text-muted-foreground font-bold text-sm">
          {rank}
        </div>
      )
  }
}

function LeaderboardEntry({
  user,
  type,
  isCurrentUser,
}: {
  user: LeaderboardUser
  type: 'points' | 'streaks'
  isCurrentUser: boolean
}) {
  return (
    <Card
      className={`p-3 flex items-center gap-3 ${isCurrentUser ? 'border-primary bg-primary/10' : ''}`}
    >
      {getRankBadge(user.rank)}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground truncate">
          {user.username || abbreviateWallet(user.walletAddress)}
        </p>
        {user.username && (
          <p className="text-xs text-muted-foreground">
            {abbreviateWallet(user.walletAddress)}
          </p>
        )}
      </div>
      <div className="text-right">
        {type === 'points' ? (
          <Badge variant="default" className="font-mono">
            {(user.totalPoints || 0).toLocaleString()} pts
          </Badge>
        ) : (
          <Badge variant="outline" className="font-mono">
            <Flame className="w-3 h-3 mr-1" />
            {user.maxStreak || 0} days
          </Badge>
        )}
      </div>
    </Card>
  )
}

export default function LeaderboardPage() {
  const { connected, publicKey } = useWallet()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'points' | 'streaks'>('points')
  const [pointsData, setPointsData] = useState<LeaderboardResponse | null>(null)
  const [streaksData, setStreaksData] = useState<LeaderboardResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLeaderboard = useCallback(
    async (type: 'points' | 'streaks') => {
      try {
        const walletParam = publicKey ? `&wallet=${publicKey.toBase58()}` : ''
        const response = await fetch(`/api/leaderboard?type=${type}&limit=50${walletParam}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch leaderboard')
        }

        return data as LeaderboardResponse
      } catch (err) {
        console.error(`Error fetching ${type} leaderboard:`, err)
        throw err
      }
    },
    [publicKey]
  )

  const loadData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const [points, streaks] = await Promise.all([
        fetchLeaderboard('points'),
        fetchLeaderboard('streaks'),
      ])
      setPointsData(points)
      setStreaksData(streaks)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load leaderboard')
    } finally {
      setIsLoading(false)
    }
  }, [fetchLeaderboard])

  useEffect(() => {
    if (!connected) {
      router.push('/')
    } else {
      loadData()
    }
  }, [connected, router, loadData])

  if (!connected) {
    return null
  }

  const currentData = activeTab === 'points' ? pointsData : streaksData
  const currentUserRank = currentData?.userRank
  const walletAddress = publicKey?.toBase58() || ''

  return (
    <MobileLayout>
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary">
            <Trophy className="w-6 h-6 text-black" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-black text-foreground">
              LEADERBOARD
            </h1>
            <p className="text-sm text-muted-foreground">
              Top performers this season
            </p>
          </div>
        </div>

        {/* User's Rank Card */}
        {currentUserRank && (
          <Card className="p-4 bg-primary/5 border-primary">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Your Rank</p>
                <p className="text-3xl font-display font-black text-primary">
                  #{currentUserRank.rank}
                </p>
              </div>
              <div className="text-right">
                {activeTab === 'points' ? (
                  <>
                    <p className="text-sm text-muted-foreground">Total Points</p>
                    <p className="text-2xl font-bold text-foreground">
                      {(currentUserRank.totalPoints || 0).toLocaleString()}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">Best Streak</p>
                    <p className="text-2xl font-bold text-foreground flex items-center justify-end gap-1">
                      <Flame className="w-5 h-5 text-primary" />
                      {currentUserRank.maxStreak || 0}
                    </p>
                  </>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <Card className="p-4 bg-red-500/10 border-red-500/30">
            <p className="text-sm text-red-400">{error}</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={loadData}>
              Retry
            </Button>
          </Card>
        )}

        {/* Leaderboard content */}
        {!isLoading && !error && (
          <Tabs
            defaultValue="points"
            className="w-full"
            onValueChange={(value) => setActiveTab(value as 'points' | 'streaks')}
          >
            <TabsList className="w-full bg-surface">
              <TabsTrigger value="points" className="flex-1">
                <Trophy className="w-4 h-4 mr-2" />
                Points
              </TabsTrigger>
              <TabsTrigger value="streaks" className="flex-1">
                <Flame className="w-4 h-4 mr-2" />
                Streaks
              </TabsTrigger>
            </TabsList>

            <TabsContent value="points" className="mt-4 space-y-2">
              {pointsData && pointsData.leaderboard.length > 0 ? (
                pointsData.leaderboard.map((user) => (
                  <LeaderboardEntry
                    key={user.walletAddress}
                    user={user}
                    type="points"
                    isCurrentUser={user.walletAddress.toLowerCase() === walletAddress.toLowerCase()}
                  />
                ))
              ) : (
                <Card className="p-8 bg-surface border-border text-center">
                  <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-display font-bold text-foreground mb-2">
                    No rankings yet
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Be the first to earn points and claim the top spot!
                  </p>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="streaks" className="mt-4 space-y-2">
              {streaksData && streaksData.leaderboard.length > 0 ? (
                streaksData.leaderboard.map((user) => (
                  <LeaderboardEntry
                    key={user.walletAddress}
                    user={user}
                    type="streaks"
                    isCurrentUser={user.walletAddress.toLowerCase() === walletAddress.toLowerCase()}
                  />
                ))
              ) : (
                <Card className="p-8 bg-surface border-border text-center">
                  <Flame className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-display font-bold text-foreground mb-2">
                    No streaks yet
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Log your habits daily to start building a streak!
                  </p>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </MobileLayout>
  )
}
