import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    // First get the asset to find the file path
    const { data: asset, error: fetchError } = await supabase
      .from('media_asset')
      .select('*')
      .eq('id', params.id)
      .single()

    if (fetchError) {
      console.error('Error fetching asset:', fetchError)
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    if (!asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 })
    }

    // Delete from database first
    const { error: dbError } = await supabase
      .from('media_asset')
      .delete()
      .eq('id', params.id)

    if (dbError) {
      console.error('Error deleting from database:', dbError)
      return NextResponse.json({ error: dbError.message }, { status: 500 })
    }

    // Try to delete from storage (optional, may fail if file doesn't exist)
    try {
      const uploadPath = asset.meta?.uploadPath
      if (uploadPath) {
        const { error: storageError } = await supabase.storage
          .from('media')
          .remove([uploadPath])
        
        if (storageError) {
          console.warn('Storage delete warning:', storageError)
        }
      }
    } catch (storageError) {
      console.warn('Storage delete warning:', storageError)
    }

    return NextResponse.json({ message: 'Asset deleted successfully' })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
