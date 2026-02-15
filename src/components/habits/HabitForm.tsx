'use client'

import { FC, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, Minus, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Action {
  name: string
  points: number
}

interface PresetHabit {
  id: string
  name: string
  description: string | null
  category: string
  goal: string | null
  positiveActions: Action[]
  negativeActions: Action[]
  icon: string
}

interface HabitFormProps {
  presets?: PresetHabit[]
  onSubmit: (data: {
    name: string
    description: string
    category: string
    goal: string
    positiveActions: Action[]
    negativeActions: Action[]
    isPreset: boolean
    presetId?: string
  }) => Promise<void>
  isSubmitting?: boolean
}

const categories = ['health', 'fitness', 'mental', 'digital', 'learning', 'nutrition', 'other']

export const HabitForm: FC<HabitFormProps> = ({ presets = [], onSubmit, isSubmitting: externalIsSubmitting }) => {
  const router = useRouter()
  const [mode, setMode] = useState<'preset' | 'custom'>('preset')
  const [selectedPreset, setSelectedPreset] = useState<PresetHabit | null>(null)
  const [internalIsSubmitting, setInternalIsSubmitting] = useState(false)

  const isSubmitting = externalIsSubmitting ?? internalIsSubmitting

  // Custom form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('health')
  const [goal, setGoal] = useState('')
  const [positiveActions, setPositiveActions] = useState<Action[]>([
    { name: '', points: 10 },
  ])
  const [negativeActions, setNegativeActions] = useState<Action[]>([
    { name: '', points: -10 },
  ])

  const handlePresetSelect = (preset: PresetHabit) => {
    setSelectedPreset(preset)
    setName(preset.name)
    setDescription(preset.description || '')
    setCategory(preset.category)
    setGoal(preset.goal || '')
    setPositiveActions(preset.positiveActions)
    setNegativeActions(preset.negativeActions)
  }

  const addAction = (type: 'positive' | 'negative') => {
    if (type === 'positive') {
      setPositiveActions([...positiveActions, { name: '', points: 10 }])
    } else {
      setNegativeActions([...negativeActions, { name: '', points: -10 }])
    }
  }

  const removeAction = (type: 'positive' | 'negative', index: number) => {
    if (type === 'positive') {
      setPositiveActions(positiveActions.filter((_, i) => i !== index))
    } else {
      setNegativeActions(negativeActions.filter((_, i) => i !== index))
    }
  }

  const updateAction = (
    type: 'positive' | 'negative',
    index: number,
    field: 'name' | 'points',
    value: string | number
  ) => {
    if (type === 'positive') {
      const updated = [...positiveActions]
      updated[index] = { ...updated[index], [field]: value }
      setPositiveActions(updated)
    } else {
      const updated = [...negativeActions]
      updated[index] = { ...updated[index], [field]: value }
      setNegativeActions(updated)
    }
  }

  const handleSubmit = async () => {
    if (!name.trim()) return

    setInternalIsSubmitting(true)
    try {
      await onSubmit({
        name,
        description,
        category,
        goal,
        positiveActions: positiveActions.filter((a) => a.name.trim()),
        negativeActions: negativeActions.filter((a) => a.name.trim()),
        isPreset: mode === 'preset' && !!selectedPreset,
        presetId: selectedPreset?.id,
      })
      // Only redirect if not using external control
      if (externalIsSubmitting === undefined) {
        router.push('/habits')
      }
    } catch (error) {
      console.error('Failed to create habit:', error)
    } finally {
      setInternalIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Mode toggle */}
      <div className="flex gap-2">
        <Button
          variant={mode === 'preset' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMode('preset')}
          className="flex-1"
        >
          From Preset
        </Button>
        <Button
          variant={mode === 'custom' ? 'default' : 'outline'}
          size="sm"
          onClick={() => {
            setMode('custom')
            setSelectedPreset(null)
          }}
          className="flex-1"
        >
          Custom
        </Button>
      </div>

      {/* Preset selection */}
      {mode === 'preset' && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">Choose a preset</h3>
          <div className="grid grid-cols-2 gap-2">
            {presets.map((preset) => (
              <Card
                key={preset.id}
                className={cn(
                  'p-3 bg-surface border-border cursor-pointer transition-colors',
                  selectedPreset?.id === preset.id
                    ? 'border-primary bg-primary/10'
                    : 'hover:border-primary/50'
                )}
                onClick={() => handlePresetSelect(preset)}
              >
                <div className="text-2xl mb-1">{preset.icon}</div>
                <div className="text-sm font-bold text-foreground truncate">
                  {preset.name}
                </div>
                <div className="text-xs text-muted-foreground capitalize">
                  {preset.category}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Form fields */}
      {(mode === 'custom' || selectedPreset) && (
        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Habit Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Exercise Daily"
              disabled={mode === 'preset'}
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <Badge
                  key={cat}
                  variant={category === cat ? 'default' : 'outline'}
                  className="cursor-pointer capitalize"
                  onClick={() => mode === 'custom' && setCategory(cat)}
                >
                  {cat}
                </Badge>
              ))}
            </div>
          </div>

          {/* Goal */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Goal (optional)
            </label>
            <Input
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g., Work out 30 minutes daily"
            />
          </div>

          {/* Positive actions */}
          <div>
            <label className="text-sm font-medium text-green-400 mb-2 block">
              Positive Actions
            </label>
            <div className="space-y-2">
              {positiveActions.map((action, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={action.name}
                    onChange={(e) =>
                      updateAction('positive', index, 'name', e.target.value)
                    }
                    placeholder="Action name"
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={action.points}
                    onChange={(e) =>
                      updateAction('positive', index, 'points', parseInt(e.target.value) || 0)
                    }
                    className="w-20"
                  />
                  {positiveActions.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeAction('positive', index)}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => addAction('positive')}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Action
              </Button>
            </div>
          </div>

          {/* Negative actions */}
          <div>
            <label className="text-sm font-medium text-red-400 mb-2 block">
              Negative Actions
            </label>
            <div className="space-y-2">
              {negativeActions.map((action, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={action.name}
                    onChange={(e) =>
                      updateAction('negative', index, 'name', e.target.value)
                    }
                    placeholder="Action name"
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={action.points}
                    onChange={(e) =>
                      updateAction('negative', index, 'points', parseInt(e.target.value) || 0)
                    }
                    className="w-20"
                  />
                  {negativeActions.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeAction('negative', index)}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => addAction('negative')}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Action
              </Button>
            </div>
          </div>

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            disabled={!name.trim() || isSubmitting}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Habit'
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
