import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { isAdmin } from '@/lib/utils/admin'

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// GET /api/admin/config - Return all config values
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

    const { data: configs, error } = await supabase
      .from('config')
      .select('*')
      .order('key', { ascending: true })

    if (error) {
      console.error('Error fetching config:', error)
      return NextResponse.json(
        { error: 'Failed to fetch config' },
        { status: 500 }
      )
    }

    // Transform to key-value object
    const configMap: Record<string, { value: unknown; updatedAt: string }> = {}
    configs?.forEach((config) => {
      configMap[config.key] = {
        value: config.value,
        updatedAt: config.updated_at,
      }
    })

    return NextResponse.json({ config: configMap })
  } catch (error) {
    console.error('Config API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/config - Update config values
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { walletAddress, updates } = body

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

    if (!updates || typeof updates !== 'object') {
      return NextResponse.json(
        { error: 'Updates object required' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdmin()

    // Update each config key
    const updatePromises = Object.entries(updates).map(([key, value]) =>
      supabase
        .from('config')
        .upsert(
          {
            key,
            value,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'key' }
        )
        .select()
    )

    const results = await Promise.all(updatePromises)

    // Check for errors
    const errors = results.filter((r) => r.error)
    if (errors.length > 0) {
      console.error('Error updating config:', errors[0].error)
      return NextResponse.json(
        { error: 'Failed to update some config values' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Updated ${Object.keys(updates).length} config value(s)`,
    })
  } catch (error) {
    console.error('Config update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
