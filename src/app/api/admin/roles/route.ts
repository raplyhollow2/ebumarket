import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has permission to view admin roles
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

    // Get all admin roles
    const { data: roles, error } = await supabase
      .from('admin_roles')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: roles,
      count: roles?.length || 0
    })
  } catch (error) {
    console.error('Error fetching admin roles:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch admin roles'
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

    // Check if user has permission to manage admin roles
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
    const { name, description, permissions: rolePermissions } = body

    if (!name || !rolePermissions) {
      return NextResponse.json({ error: 'Name and permissions are required' }, { status: 400 })
    }

    // Create new admin role
    const { data: newRole, error } = await supabase
      .from('admin_roles')
      .insert({
        name,
        description: description || null,
        permissions: rolePermissions
      })
      .select()
      .single()

    if (error) throw error

    // Log the action
    await supabase.from('admin_audit_log').insert({
      actor_id: user.id,
      action: 'create_admin_role',
      resource_type: 'admin_role',
      resource_id: newRole.id,
      metadata: { role_name: name }
    })

    return NextResponse.json({
      success: true,
      data: newRole
    })
  } catch (error) {
    console.error('Error creating admin role:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to create admin role'
    }, { status: 500 })
  }
}