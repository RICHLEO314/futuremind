import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient, getClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const admin = getAdminClient()
    const supabase = await getClient()

    const formData = await request.formData()
    const file = formData.get('file') as File
    const module_id = (formData.get('module_id') as string) || null
    const item_id = (formData.get('item_id') as string) || null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file size (50MB max)
    const maxSize = 50 * 1024 * 1024 // 50MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large. Maximum size is 50MB.' }, { status: 400 })
    }

    // Get current user for auditing (optional)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `uploads/${fileName}`

    // Upload to Supabase Storage with service role (bypass RLS)
    const { error: uploadError } = await admin.storage
      .from('media')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    // Get public URL
    const { data: urlData } = admin.storage.from('media').getPublicUrl(filePath)

    // Determine file category
    let fileType = 'document'
    if (file.type?.startsWith('audio/')) fileType = 'audio'
    else if (file.type?.startsWith('image/')) fileType = 'image'
    else if (file.type?.startsWith('video/')) fileType = 'video'

    // Save to database with service role (bypass RLS)
    const { data: assetData, error: dbError } = await admin
      .from('media_asset')
      .insert({
        module_id,
        item_id,
        url: urlData.publicUrl,
        type: fileType,
        meta: {
          originalName: file.name,
          size: file.size,
          mimetype: file.type,
          uploadPath: filePath,
        },
        created_by: user?.id ?? null,
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      // Try to clean up uploaded file
      await admin.storage.from('media').remove([filePath])
      return NextResponse.json({ error: dbError.message }, { status: 500 })
    }

    // Fire N8N webhook if configured
    const webhook = process.env.N8N_UPLOAD_WEBHOOK
    if (webhook) {
      try {
        await fetch(webhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'media_asset.created',
            data: assetData,
          }),
        })
      } catch (e) {
        console.warn('N8N webhook call failed (media_asset.created):', e)
      }
    }

    return NextResponse.json(
      {
        asset: assetData,
        message: 'File uploaded successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const admin = getAdminClient()

    const { data: assets, error } = await admin
      .from('media_asset')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching media assets:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ assets })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
