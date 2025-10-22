import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient, getClient } from '@/lib/supabase'
import { z } from 'zod'

const CoursewareSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  module_id: z.string().uuid(),
  item_id: z.string().uuid(),
  file_url: z.string().url(),
  file_type: z.enum(['pdf', 'doc', 'ppt', 'txt', 'other']).default('other'),
})

function err(status: number, message: string) {
  return NextResponse.json({ error: { code: status, message } }, { status })
}

function getErrorMessage(e: unknown): string {
  if (e instanceof Error) return e.message
  try { return JSON.stringify(e) } catch { return String(e) }
}

export async function GET(req: NextRequest) {
  try {
    const admin = getAdminClient()
    const moduleId = req.nextUrl.searchParams.get('module')
    const itemId = req.nextUrl.searchParams.get('item')

    let query = admin
      .from('media_resources')
      .select(`
        *,
        content_module:module_id (
          id,
          title,
          key
        ),
        content_item:item_id (
          id,
          title,
          slug
        )
      `)
      .eq('resource_type', 'courseware')
      .order('created_at', { ascending: false })

    if (moduleId) query = query.eq('module_id', moduleId)
    if (itemId) query = query.eq('item_id', itemId)

    const { data, error } = await query

    if (error) {
      return err(500, error.message)
    }

    return NextResponse.json({ data: data || [] })
  } catch (e: unknown) {
    return err(500, getErrorMessage(e))
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = getAdminClient()
    const supabase = await getClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return err(401, 'Unauthorized')

    const body = await req.json()
    const parsed = CoursewareSchema.safeParse(body)
    if (!parsed.success) {
      return err(400, parsed.error.issues.map(i => i.message).join('; '))
    }

    const { title, description, module_id, item_id, file_url, file_type } = parsed.data

    const insertData = {
      title,
      description: description ?? null,
      module_id,
      item_id,
      url: file_url,
      resource_type: 'courseware',
      meta: {
        file_type,
      },
      created_by: user.id,
    }

    const { data: courseware, error } = await admin
      .from('media_resources')
      .insert(insertData)
      .select(`
        *,
        content_module:module_id (
          id,
          title,
          key
        ),
        content_item:item_id (
          id,
          title,
          slug
        )
      `)
      .single()

    if (error) {
      return err(500, error.message)
    }

    // Fire N8N webhook if configured
    const webhook = process.env.N8N_UPLOAD_WEBHOOK
    if (webhook) {
      try {
        await fetch(webhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'courseware.created',
            data: courseware,
          }),
        })
      } catch (e) {
        console.warn('N8N webhook call failed (courseware.created):', e)
      }
    }

    return NextResponse.json({ data: courseware }, { status: 201 })
  } catch (e: unknown) {
    return err(500, getErrorMessage(e))
  }
}
