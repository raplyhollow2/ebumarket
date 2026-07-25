import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const blockType = searchParams.get('block_type')

    let query = supabase
      .from('cms_content_blocks')
      .select('*')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    if (blockType) {
      query = query.eq('block_type', blockType)
    }

    const { data: blocks, error } = await query

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: blocks,
      count: blocks?.length || 0
    })
  } catch (error) {
    console.error('Error fetching content blocks:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch content blocks'
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
      block_type,
      title,
      content,
      targeting_rules,
      schedule_start,
      schedule_end,
      priority,
      status
    } = body

    if (!block_type || !title || !content) {
      return NextResponse.json({ error: 'Block type, title, and content are required' }, { status: 400 })
    }

    // Create content block
    const { data: block, error } = await supabase
      .from('cms_content_blocks')
      .insert({
        block_type,
        title,
        content,
        targeting_rules: targeting_rules || {},
        schedule_start: schedule_start || null,
        schedule_end: schedule_end || null,
        priority: priority || 0,
        status: status || 'draft',
        created_by: user.id
      })
      .select()
      .single()

    if (error) throw error

    // Log the action
    await supabase.from('admin_audit_log').insert({
      actor_id: user.id,
      action: 'create_content_block',
      resource_type: 'cms_content_block',
      resource_id: block.id,
      metadata: { title, block_type }
    })

    return NextResponse.json({
      success: true,
      data: block
    })
  } catch (error) {
    console.error('Error creating content block:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to create content block'
    }, { status: 500 })
  }
}