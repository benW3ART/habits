'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useWallet } from '@solana/wallet-adapter-react'
import { MobileLayout } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Shield,
  Lock,
  Users,
  Flame,
  Trophy,
  Target,
  Settings,
  Plus,
  Loader2,
  RefreshCw,
  Save,
  X,
  Check,
  AlertTriangle,
} from 'lucide-react'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import { formatNumber, shortenAddress } from '@/lib/utils'

interface PlatformStats {
  overview: {
    totalUsers: number
    totalHabits: number
    totalLogs: number
    totalBets: number
    activeBets: number
    totalPointsAwarded: number
    activePresets: number
    totalStakedLamports: number
  }
  recentActivity: {
    newUsersLast7Days: number
    logsLast7Days: number
    betsLast7Days: number
  }
}

interface ConfigItem {
  value: unknown
  updatedAt: string
}

interface PresetHabit {
  id: string
  name: string
  description: string | null
  category: string
  goal: string | null
  positiveActions: Array<{ name: string; points: number }>
  negativeActions: Array<{ name: string; points: number }>
  icon: string | null
  isActive: boolean
  createdAt: string
}

export default function AdminPage() {
  const { connected, publicKey } = useWallet()
  const router = useRouter()

  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Stats state
  const [stats, setStats] = useState<PlatformStats | null>(null)

  // Config state
  const [config, setConfig] = useState<Record<string, ConfigItem>>({})
  const [editingConfig, setEditingConfig] = useState<string | null>(null)
  const [configDraft, setConfigDraft] = useState<string>('')
  const [savingConfig, setSavingConfig] = useState(false)

  // Presets state
  const [presets, setPresets] = useState<PresetHabit[]>([])
  const [showAddPreset, setShowAddPreset] = useState(false)
  const [newPreset, setNewPreset] = useState({
    name: '',
    description: '',
    category: 'health',
    goal: '',
    icon: '',
  })
  const [savingPreset, setSavingPreset] = useState(false)

  const walletAddress = publicKey?.toBase58()

  // Check admin status and fetch data
  const fetchAdminData = useCallback(async () => {
    if (!walletAddress) return

    setIsLoading(true)
    setError(null)

    try {
      // Fetch stats first to check admin status
      const statsResponse = await fetch(`/api/admin?wallet=${walletAddress}`)
      const statsData = await statsResponse.json()

      if (statsResponse.status === 403) {
        setIsAdmin(false)
        setIsLoading(false)
        return
      }

      if (!statsResponse.ok) {
        throw new Error(statsData.error || 'Failed to fetch admin data')
      }

      setIsAdmin(true)
      setStats(statsData.stats)

      // Fetch config and presets in parallel
      const [configResponse, presetsResponse] = await Promise.all([
        fetch(`/api/admin/config?wallet=${walletAddress}`),
        fetch(`/api/admin/presets?wallet=${walletAddress}`),
      ])

      const [configData, presetsData] = await Promise.all([
        configResponse.json(),
        presetsResponse.json(),
      ])

      if (configResponse.ok) {
        setConfig(configData.config || {})
      }

      if (presetsResponse.ok) {
        setPresets(presetsData.presets || [])
      }
    } catch (err) {
      console.error('Error fetching admin data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load admin data')
    } finally {
      setIsLoading(false)
    }
  }, [walletAddress])

  useEffect(() => {
    if (!connected) {
      router.push('/')
    } else {
      fetchAdminData()
    }
  }, [connected, router, fetchAdminData])

  // Save config changes
  const handleSaveConfig = async (key: string) => {
    if (!walletAddress) return

    setSavingConfig(true)
    try {
      let parsedValue
      try {
        parsedValue = JSON.parse(configDraft)
      } catch {
        setError('Invalid JSON format')
        setSavingConfig(false)
        return
      }

      const response = await fetch('/api/admin/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress,
          updates: { [key]: parsedValue },
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save config')
      }

      // Update local state
      setConfig((prev) => ({
        ...prev,
        [key]: { value: parsedValue, updatedAt: new Date().toISOString() },
      }))
      setEditingConfig(null)
      setConfigDraft('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save config')
    } finally {
      setSavingConfig(false)
    }
  }

  // Add new preset
  const handleAddPreset = async () => {
    if (!walletAddress || !newPreset.name || !newPreset.category) return

    setSavingPreset(true)
    try {
      const response = await fetch('/api/admin/presets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress,
          name: newPreset.name,
          description: newPreset.description || null,
          category: newPreset.category,
          goal: newPreset.goal || null,
          icon: newPreset.icon || null,
          positiveActions: [],
          negativeActions: [],
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create preset')
      }

      setPresets((prev) => [...prev, data.preset])
      setShowAddPreset(false)
      setNewPreset({
        name: '',
        description: '',
        category: 'health',
        goal: '',
        icon: '',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create preset')
    } finally {
      setSavingPreset(false)
    }
  }

  // Toggle preset active status
  const handleTogglePreset = async (presetId: string, currentActive: boolean) => {
    if (!walletAddress) return

    try {
      const response = await fetch('/api/admin/presets', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress,
          presetId,
          updates: { isActive: !currentActive },
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update preset')
      }

      setPresets((prev) =>
        prev.map((p) =>
          p.id === presetId ? { ...p, isActive: !currentActive } : p
        )
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update preset')
    }
  }

  // Not connected
  if (!connected) {
    return null
  }

  // Loading state
  if (isLoading) {
    return (
      <MobileLayout showNav={false}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MobileLayout>
    )
  }

  // Access Denied
  if (isAdmin === false) {
    return (
      <MobileLayout showNav={false}>
        <div className="p-4 flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="w-20 h-20 rounded-full bg-danger-bg flex items-center justify-center mb-6">
            <Lock className="w-10 h-10 text-danger" />
          </div>
          <h1 className="text-2xl font-display font-black text-foreground mb-2">
            ACCESS DENIED
          </h1>
          <p className="text-muted-foreground mb-2">
            Admin privileges required to access this page.
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            Connected: {walletAddress ? shortenAddress(walletAddress) : 'N/A'}
          </p>
          <Button variant="outline" onClick={() => router.push('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </MobileLayout>
    )
  }

  return (
    <MobileLayout showNav={false}>
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Shield className="w-5 h-5 text-black" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-black text-foreground">
                ADMIN
              </h1>
              <p className="text-xs text-muted-foreground">
                {walletAddress ? shortenAddress(walletAddress) : ''}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={fetchAdminData}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>

        {/* Error display */}
        {error && (
          <Card className="bg-danger-bg border-danger/30">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-danger flex-shrink-0" />
              <p className="text-sm text-danger">{error}</p>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-danger hover:text-danger/80"
              >
                <X className="w-4 h-4" />
              </button>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="w-full bg-surface">
            <TabsTrigger value="dashboard" className="flex-1">
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="config" className="flex-1">
              Config
            </TabsTrigger>
            <TabsTrigger value="presets" className="flex-1">
              Presets
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="mt-4 space-y-4">
            {stats && (
              <>
                {/* Overview Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <Card className="bg-surface">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4 text-primary" />
                        <span className="text-xs text-muted-foreground">
                          Total Users
                        </span>
                      </div>
                      <p className="text-2xl font-display font-bold text-foreground">
                        {formatNumber(stats.overview.totalUsers)}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-surface">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Flame className="w-4 h-4 text-primary" />
                        <span className="text-xs text-muted-foreground">
                          Total Bets
                        </span>
                      </div>
                      <p className="text-2xl font-display font-bold text-foreground">
                        {formatNumber(stats.overview.totalBets)}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-surface">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Trophy className="w-4 h-4 text-primary" />
                        <span className="text-xs text-muted-foreground">
                          Points Awarded
                        </span>
                      </div>
                      <p className="text-2xl font-display font-bold text-foreground">
                        {formatNumber(stats.overview.totalPointsAwarded)}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-surface">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="w-4 h-4 text-primary" />
                        <span className="text-xs text-muted-foreground">
                          Active Bets
                        </span>
                      </div>
                      <p className="text-2xl font-display font-bold text-foreground">
                        {formatNumber(stats.overview.activeBets)}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* More stats */}
                <Card className="bg-surface">
                  <CardHeader>
                    <CardTitle className="text-sm">Platform Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Total Habits
                      </span>
                      <span className="text-sm font-bold">
                        {formatNumber(stats.overview.totalHabits)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Total Logs
                      </span>
                      <span className="text-sm font-bold">
                        {formatNumber(stats.overview.totalLogs)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Active Presets
                      </span>
                      <span className="text-sm font-bold">
                        {formatNumber(stats.overview.activePresets)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Total Staked
                      </span>
                      <span className="text-sm font-bold text-primary">
                        {(
                          stats.overview.totalStakedLamports / LAMPORTS_PER_SOL
                        ).toFixed(2)}{' '}
                        SOL
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card className="bg-surface">
                  <CardHeader>
                    <CardTitle className="text-sm">
                      Last 7 Days Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        New Users
                      </span>
                      <Badge variant="success">
                        +{stats.recentActivity.newUsersLast7Days}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        New Logs
                      </span>
                      <Badge variant="success">
                        +{formatNumber(stats.recentActivity.logsLast7Days)}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        New Bets
                      </span>
                      <Badge variant="success">
                        +{stats.recentActivity.betsLast7Days}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Config Tab */}
          <TabsContent value="config" className="mt-4 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Settings className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">
                Platform Configuration
              </span>
            </div>

            {Object.entries(config).length === 0 ? (
              <Card className="bg-surface p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  No configuration values found.
                </p>
              </Card>
            ) : (
              Object.entries(config).map(([key, item]) => (
                <Card key={key} className="bg-surface">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-mono">{key}</CardTitle>
                      {editingConfig === key ? (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingConfig(null)
                              setConfigDraft('')
                            }}
                            disabled={savingConfig}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleSaveConfig(key)}
                            disabled={savingConfig}
                          >
                            {savingConfig ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Save className="w-3 h-3" />
                            )}
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingConfig(key)
                            setConfigDraft(JSON.stringify(item.value, null, 2))
                          }}
                        >
                          Edit
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {editingConfig === key ? (
                      <textarea
                        className="w-full h-32 bg-background border-2 border-border rounded-xl p-3 text-sm font-mono text-foreground focus:border-primary focus:outline-none resize-none"
                        value={configDraft}
                        onChange={(e) => setConfigDraft(e.target.value)}
                      />
                    ) : (
                      <pre className="text-xs text-muted-foreground bg-background rounded-lg p-3 overflow-x-auto">
                        {JSON.stringify(item.value, null, 2)}
                      </pre>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      Updated:{' '}
                      {new Date(item.updatedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Presets Tab */}
          <TabsContent value="presets" className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">
                  Preset Habits ({presets.length})
                </span>
              </div>
              <Button size="sm" onClick={() => setShowAddPreset(true)}>
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>

            {/* Add Preset Form */}
            {showAddPreset && (
              <Card className="bg-surface border-primary">
                <CardHeader>
                  <CardTitle className="text-sm">New Preset Habit</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">
                      Name *
                    </label>
                    <Input
                      placeholder="e.g., Morning Meditation"
                      value={newPreset.name}
                      onChange={(e) =>
                        setNewPreset((prev) => ({ ...prev, name: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">
                      Category *
                    </label>
                    <select
                      className="w-full h-11 rounded-xl border-2 border-border bg-surface px-4 py-2 text-sm text-white focus:border-primary focus:outline-none"
                      value={newPreset.category}
                      onChange={(e) =>
                        setNewPreset((prev) => ({
                          ...prev,
                          category: e.target.value,
                        }))
                      }
                    >
                      <option value="health">Health</option>
                      <option value="fitness">Fitness</option>
                      <option value="mental">Mental</option>
                      <option value="nutrition">Nutrition</option>
                      <option value="learning">Learning</option>
                      <option value="digital">Digital Wellness</option>
                      <option value="finance">Finance</option>
                      <option value="social">Social</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">
                      Description
                    </label>
                    <Input
                      placeholder="Brief description..."
                      value={newPreset.description}
                      onChange={(e) =>
                        setNewPreset((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">
                      Goal
                    </label>
                    <Input
                      placeholder="e.g., Meditate 10 min daily"
                      value={newPreset.goal}
                      onChange={(e) =>
                        setNewPreset((prev) => ({ ...prev, goal: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">
                      Icon (emoji)
                    </label>
                    <Input
                      placeholder="e.g., 🧘"
                      value={newPreset.icon}
                      onChange={(e) =>
                        setNewPreset((prev) => ({ ...prev, icon: e.target.value }))
                      }
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setShowAddPreset(false)
                        setNewPreset({
                          name: '',
                          description: '',
                          category: 'health',
                          goal: '',
                          icon: '',
                        })
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={handleAddPreset}
                      disabled={
                        savingPreset || !newPreset.name || !newPreset.category
                      }
                    >
                      {savingPreset ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        'Create'
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Presets List */}
            {presets.length === 0 ? (
              <Card className="bg-surface p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  No preset habits found.
                </p>
              </Card>
            ) : (
              presets.map((preset) => (
                <Card
                  key={preset.id}
                  className={`bg-surface ${
                    !preset.isActive ? 'opacity-60' : ''
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {preset.icon && (
                          <span className="text-2xl">{preset.icon}</span>
                        )}
                        <div>
                          <h3 className="font-bold text-foreground">
                            {preset.name}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {preset.category}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant={preset.isActive ? 'outline' : 'default'}
                        onClick={() =>
                          handleTogglePreset(preset.id, preset.isActive)
                        }
                      >
                        {preset.isActive ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          <X className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                    {preset.description && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {preset.description}
                      </p>
                    )}
                    {preset.goal && (
                      <p className="text-xs text-primary mt-1">
                        Goal: {preset.goal}
                      </p>
                    )}
                    <div className="flex gap-2 mt-3">
                      <Badge variant="secondary">
                        +{preset.positiveActions?.length || 0} positive
                      </Badge>
                      <Badge variant="destructive">
                        {preset.negativeActions?.length || 0} negative
                      </Badge>
                      {!preset.isActive && (
                        <Badge variant="outline">Inactive</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>

        {/* Back button */}
        <div className="pt-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.push('/dashboard')}
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    </MobileLayout>
  )
}
