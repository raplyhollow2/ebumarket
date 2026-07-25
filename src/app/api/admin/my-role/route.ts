import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check user's admin role assignments
    const { data: roleAssignments } = await supabase
      .from('admin_role_assignments')
      .select('admin_roles!inner(name, permissions)')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('assigned_at', { ascending: false })
      .limit(1)

    const adminRole = roleAssignments?.[0]?.admin_roles as any

    return NextResponse.json({
      success: true,
      data: {
        role: adminRole?.name || null,
        permissions: adminRole?.permissions || [],
        hasAdminAccess: !!adminRole
      }
    })
  } catch (error) {
    console.error('Error fetching user role:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch user role'
    }, { status: 500 })
  }
}