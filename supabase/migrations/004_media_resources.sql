-- Media resources table to store structured resources like video links and courseware
CREATE TABLE IF NOT EXISTS public.media_resources (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  module_id UUID REFERENCES public.content_module(id) ON DELETE SET NULL,
  item_id UUID REFERENCES public.content_item(id) ON DELETE SET NULL,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('video_link','courseware','link','document')),
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  platform TEXT,
  description TEXT,
  meta JSONB DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_media_resources_module ON public.media_resources(module_id);
CREATE INDEX IF NOT EXISTS idx_media_resources_item ON public.media_resources(item_id);
CREATE INDEX IF NOT EXISTS idx_media_resources_type ON public.media_resources(resource_type);

-- Enable RLS and policies
ALTER TABLE public.media_resources ENABLE ROW LEVEL SECURITY;

-- Viewers can read, editors/admin can write
CREATE POLICY IF NOT EXISTS "media_resources_select_editors" ON public.media_resources
  FOR SELECT USING (public.is_content_editor() OR public.is_content_admin());

CREATE POLICY IF NOT EXISTS "media_resources_insert_editors" ON public.media_resources
  FOR INSERT WITH CHECK (public.is_content_editor() OR public.is_content_admin());

CREATE POLICY IF NOT EXISTS "media_resources_update_editors" ON public.media_resources
  FOR UPDATE USING (public.is_content_editor() OR public.is_content_admin()) WITH CHECK (public.is_content_editor() OR public.is_content_admin());

