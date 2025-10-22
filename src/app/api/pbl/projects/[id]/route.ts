import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    const { data: project, error } = await supabase
      .from('pbl_projects')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
      console.error('Error fetching project:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    return NextResponse.json({ project })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    const { title, description, max_participants, status } = body

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const updateData: any = {
      title: title.trim(),
      description: description?.trim() || null,
    }

    if (max_participants !== undefined) {
      updateData.max_participants = max_participants
    }

    if (status && ['active', 'completed', 'paused'].includes(status)) {
      updateData.status = status
    }

    const { data: project, error } = await supabase
      .from('pbl_projects')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating project:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    return NextResponse.json({ project })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    const { error } = await supabase
      .from('pbl_projects')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Error deleting project:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'Project deleted successfully' })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
