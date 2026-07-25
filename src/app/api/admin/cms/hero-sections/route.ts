import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    const { data: heroes, error } = await supabase
      .from('cms_hero_sections')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: heroes,
      count: heroes?.length || 0
    })
  } catch (error) {
    console.error('Error fetching hero sections:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch hero sections'
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has permission to manage content
    const { data: roleCheck } = await supabase
      .from('admin_role_assignments')
      .select('admin_roles!inner(name, permissions)')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    const adminRole = roleCheck?.admin_roles as any
    const permissions = adminRole?.permissions as string[] || []
    const hasPermission = permissions.includes('*') ||
                         permissions.includes('cms.manage') ||
                         adminRole?.name === 'Super Admin'

    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const {
      name,
      hero_type,
      slides,
      settings,
      ab_test_config,
      is_active
    } = body

    if (!name || !hero_type || !slides) {
      return NextResponse.json({ error: 'Name, hero type, and slides are required' }, { status: 400 })
    }

    // Create hero section
    const { data: hero, error } = await supabase
      .from('cms_hero_sections')
      .insert({
        name,
        hero_type,
        slides,
        settings: settings || {},
        ab_test_config: ab_test_config || {},
        is_active: is_active || false,
        created_by: user.id
      })
      .select()
      .single()

    if (error) throw error

    // Log the action
    await supabase.from('admin_audit_log').insert({
      actor_id: user.id,
      action: 'create_hero_section',
      resource_type: 'cms_hero_section',
      resource_id: hero.id,
      metadata: { name, hero_type }
    })

    return NextResponse.json({
      success: true,
      data: hero
    })
  } catch (error) {
    console.error('Error creating hero section:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to create hero section'
    }, { status: 500 })
  }
}