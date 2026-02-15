import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { isAdmin } from '@/lib/utils/admin'

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// GET /api/admin/presets - List all presets (including inactive)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get('wallet')

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address required' },
        { status: 400 }
      )
    }

    // Check admin privileges
    if (!isAdmin(walletAddress)) {
      return NextResponse.json(
        { error: 'Access denied. Admin privileges required.' },
        { status: 403 }
      )
    }

    const supabase = getSupabaseAdmin()

    const { data: presets, error } = await supabase
      .from('preset_habits')
      .select('*')
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
      isActive: preset.is_active,
      createdAt: preset.created_at,
    }))

    return NextResponse.json({ presets: formattedPresets })
  } catch (error) {
    console.error('Admin presets API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/admin/presets - Create a new preset
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      walletAddress,
      name,
      description,
      category,
      goal,
      positiveActions,
      negativeActions,
      icon,
    } = body

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address required' },
        { status: 400 }
      )
    }

    // Check admin privileges
    if (!isAdmin(walletAddress)) {
      return NextResponse.json(
        { error: 'Access denied. Admin privileges required.' },
        { status: 403 }
      )
    }

    // Validate required fields
    if (!name || !category) {
      return NextResponse.json(
        { error: 'Name and category are required' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdmin()

    const { data: preset, error } = await supabase
      .from('preset_habits')
      .insert({
        name,
        description: description || null,
        category,
        goal: goal || null,
        positive_actions: positiveActions || [],
        negative_actions: negativeActions || [],
        icon: icon || null,
        is_active: true,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating preset:', error)
      return NextResponse.json(
        { error: 'Failed to create preset' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      preset: {
        id: preset.id,
        name: preset.name,
        description: preset.description,
        category: preset.category,
        goal: preset.goal,
        positiveActions: preset.positive_actions,
        negativeActions: preset.negative_actions,
        icon: preset.icon,
        isActive: preset.is_active,
        createdAt: preset.created_at,
      },
    })
  } catch (error) {
    console.error('Create preset error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/presets - Update a preset
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { walletAddress, presetId, updates } = body

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address required' },
        { status: 400 }
      )
    }

    // Check admin privileges
    if (!isAdmin(walletAddress)) {
      return NextResponse.json(
        { error: 'Access denied. Admin privileges required.' },
        { status: 403 }
      )
    }

    if (!presetId) {
      return NextResponse.json(
        { error: 'Preset ID required' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdmin()

    // Build update object
    const updateData: Record<string, unknown> = {}
    if (updates.name !== undefined) updateData.name = updates.name
    if (updates.description !== undefined)
      updateData.description = updates.description
    if (updates.category !== undefined) updateData.category = updates.category
    if (updates.goal !== undefined) updateData.goal = updates.goal
    if (updates.positiveActions !== undefined)
      updateData.positive_actions = updates.positiveActions
    if (updates.negativeActions !== undefined)
      updateData.negative_actions = updates.negativeActions
    if (updates.icon !== undefined) updateData.icon = updates.icon
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive

    const { data: preset, error } = await supabase
      .from('preset_habits')
      .update(updateData)
      .eq('id', presetId)
      .select()
      .single()

    if (error) {
      console.error('Error updating preset:', error)
      return NextResponse.json(
        { error: 'Failed to update preset' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      preset: {
        id: preset.id,
        name: preset.name,
        description: preset.description,
        category: preset.category,
        goal: preset.goal,
        positiveActions: preset.positive_actions,
        negativeActions: preset.negative_actions,
        icon: preset.icon,
        isActive: preset.is_active,
        createdAt: preset.created_at,
      },
    })
  } catch (error) {
    console.error('Update preset error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/presets - Delete a preset
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get('wallet')
    const presetId = searchParams.get('id')

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address required' },
        { status: 400 }
      )
    }

    // Check admin privileges
    if (!isAdmin(walletAddress)) {
      return NextResponse.json(
        { error: 'Access denied. Admin privileges required.' },
        { status: 403 }
      )
    }

    if (!presetId) {
      return NextResponse.json(
        { error: 'Preset ID required' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdmin()

    const { error } = await supabase
      .from('preset_habits')
      .delete()
      .eq('id', presetId)

    if (error) {
      console.error('Error deleting preset:', error)
      return NextResponse.json(
        { error: 'Failed to delete preset' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Preset deleted',
    })
  } catch (error) {
    console.error('Delete preset error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
