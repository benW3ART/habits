import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// GET /api/habits/presets - List all preset habits
export async function GET() {
  try {
    const supabase = getSupabaseAdmin()

    const { data: presets, error } = await supabase
      .from('preset_habits')
      .select('*')
      .eq('is_active', true)
      .order('category', { ascending: true })
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching presets:', error)
      return NextResponse.json(
        { error: 'Failed to fetch presets' },
        { status: 500 }
      )
    }

    const formattedPresets = presets?.map((preset) => ({
      id: preset.id,
      name: preset.name,
      description: preset.description,
      category: preset.category,
      goal: preset.goal,
      positiveActions: preset.positive_actions,
      negativeActions: preset.negative_actions,
      icon: preset.icon,
    }))

    return NextResponse.json({ presets: formattedPresets })
  } catch (error) {
    console.error('Presets API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
