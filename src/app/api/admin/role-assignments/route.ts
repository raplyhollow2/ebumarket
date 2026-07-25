import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has permission to view role assignments
    const { data: roleCheck } = await supabase
      .from('admin_role_assignments')
      .select('admin_roles!inner(name, permissions)')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    const adminRole = roleCheck?.admin_roles as any
    const permissions = adminRole?.permissions as string[] || []
    const hasPermission = permissions.includes('*') ||
                         permissions.includes('admin.view') ||
                         adminRole?.name === 'Super Admin'

    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const roleId = searchParams.get('role_id')

    let query = supabase
      .from('admin_role_assignments')
      .select(`
        *,
        admin_roles (*),
        profiles (display_name, email)
      `)
      .order('assigned_at', { ascending: false })

    if (userId) {
      query = query.eq('user_id', userId)
    }

    if (roleId) {
      query = query.eq('role_id', roleId)
    }

    const { data: assignments, error } = await query

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: assignments,
      count: assignments?.length || 0
    })
  } catch (error) {
    console.error('Error fetching role assignments:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch role assignments'
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

    // Check if user has permission to manage role assignments
    const { data: roleCheck } = await supabase
      .from('admin_role_assignments')
      .select('admin_roles!inner(name, permissions)')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    const adminRole = roleCheck?.admin_roles as any
    const permissions = adminRole?.permissions as string[] || []
    const hasPermission = permissions.includes('*') ||
                         adminRole?.name === 'Super Admin'

    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { target_user_id, role_id, expires_at } = body

    if (!target_user_id || !role_id) {
      return NextResponse.json({ error: 'Target user ID and role ID are required' }, { status: 400 })
    }

    // Create role assignment
    const { data: assignment, error } = await supabase
      .from('admin_role_assignments')
      .insert({
        user_id: target_user_id,
        role_id,
        assigned_by: user.id,
        expires_at: expires_at || null
      })
      .select(`
        *,
        admin_roles (*),
        profiles (display_name, email)
      `)
      .single()

    if (error) throw error

    // Log the action
    await supabase.from('admin_audit_log').insert({
      actor_id: user.id,
      action: 'assign_admin_role',
      resource_type: 'admin_role_assignment',
      resource_id: assignment.id,
      metadata: {
        target_user_id,
        role_id,
        expires_at
      }
    })

    return NextResponse.json({
      success: true,
      data: assignment
    })
  } catch (error) {
    console.error('Error creating role assignment:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to create role assignment'
    }, { status: 500 })
  }
}