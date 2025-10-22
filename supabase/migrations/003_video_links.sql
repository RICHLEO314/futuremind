-- Create video_links table for managing video content
CREATE TABLE IF NOT EXISTS public.video_links (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    platform TEXT DEFAULT 'other' CHECK (platform IN ('youtube', 'bilibili', 'other')),
    description TEXT,
    module_id UUID REFERENCES public.content_module(id) ON DELETE SET NULL,
    item_id UUID REFERENCES public.content_item(id) ON DELETE SET NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.video_links ENABLE ROW LEVEL SECURITY;

-- Create policies for video_links
CREATE POLICY "Anyone can view video links" ON public.video_links
    FOR SELECT USING (true);

CREATE POLICY "Content editors can manage video links" ON public.video_links
    FOR ALL USING (public.is_content_editor());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_video_links_module_id ON public.video_links(module_id);
CREATE INDEX IF NOT EXISTS idx_video_links_item_id ON public.video_links(item_id);
CREATE INDEX IF NOT EXISTS idx_video_links_platform ON public.video_links(platform);

-- Insert some sample video links
INSERT INTO public.video_links (title, url, platform, description, module_id) VALUES
(
    '量子力学入门视频',
    'https://www.bilibili.com/video/BV1234567890',
    'bilibili',
    '这是一个关于量子力学基础概念的入门视频',
    (SELECT id FROM public.content_module WHERE key = 'quantum_mechanics' LIMIT 1)
),
(
    '西方哲学史概览',
    'https://www.youtube.com/watch?v=example123',
    'youtube',
    '西方哲学发展历程的概览性介绍',
    (SELECT id FROM public.content_module WHERE key = 'west_philosophy' LIMIT 1)
) ON CONFLICT DO NOTHING;
