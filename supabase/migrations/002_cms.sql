-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- Profiles: add role for RBAC
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user','content_viewer','content_editor','content_admin'));

-- CMS core tables
CREATE TABLE IF NOT EXISTS public.content_module (
	id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
	key TEXT UNIQUE NOT NULL,
	title TEXT NOT NULL,
	description TEXT,
	created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
	created_at TIMESTAMPTZ DEFAULT NOW(),
	updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.content_item (
	id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
	module_id UUID REFERENCES public.content_module(id) ON DELETE CASCADE,
	slug TEXT NOT NULL,
	title TEXT NOT NULL,
	summary TEXT,
	default_locale TEXT DEFAULT 'zh-CN',
	created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
	created_at TIMESTAMPTZ DEFAULT NOW(),
	updated_at TIMESTAMPTZ DEFAULT NOW(),
	UNIQUE (module_id, slug)
);

CREATE TABLE IF NOT EXISTS public.content_version (
	id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
	item_id UUID REFERENCES public.content_item(id) ON DELETE CASCADE,
	version_number INTEGER NOT NULL,
	state TEXT NOT NULL CHECK (state IN ('draft','review','published')),
	created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
	created_at TIMESTAMPTZ DEFAULT NOW(),
	UNIQUE (item_id, version_number)
);

CREATE TABLE IF NOT EXISTS public.content_locale (
	id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
	version_id UUID REFERENCES public.content_version(id) ON DELETE CASCADE,
	locale TEXT NOT NULL,
	title TEXT NOT NULL,
	summary TEXT,
	content JSONB NOT NULL DEFAULT '{}'::jsonb,
	UNIQUE (version_id, locale)
);

CREATE TABLE IF NOT EXISTS public.media_asset (
	id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
	module_id UUID REFERENCES public.content_module(id) ON DELETE SET NULL,
	item_id UUID REFERENCES public.content_item(id) ON DELETE SET NULL,
	url TEXT NOT NULL,
	type TEXT,
	meta JSONB DEFAULT '{}'::jsonb,
	created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
	created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.content_relation (
	id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
	source_item_id UUID REFERENCES public.content_item(id) ON DELETE CASCADE,
	target_item_id UUID REFERENCES public.content_item(id) ON DELETE CASCADE,
	relation_type TEXT NOT NULL,
	weight REAL DEFAULT 1.0
);

CREATE TABLE IF NOT EXISTS public.publish_log (
	id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
	item_id UUID REFERENCES public.content_item(id) ON DELETE CASCADE,
	version_id UUID REFERENCES public.content_version(id) ON DELETE CASCADE,
	action TEXT NOT NULL,
	actor UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
	notes TEXT,
	created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.audit_log (
	id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
	entity_type TEXT NOT NULL,
	entity_id UUID NOT NULL,
	action TEXT NOT NULL,
	actor UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
	diff JSONB DEFAULT '{}'::jsonb,
	created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Extend user_progress for CMS-driven progress hooks
ALTER TABLE public.user_progress
ADD COLUMN IF NOT EXISTS progress_type TEXT CHECK (progress_type IN ('reading','meditation','pbl','insight','artifact')),
ADD COLUMN IF NOT EXISTS ref_item_id UUID REFERENCES public.content_item(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS progress_value INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS note TEXT;

-- Latest published content view
CREATE OR REPLACE VIEW public.v_published_content AS
SELECT
	m.id               AS module_id,
	m.key              AS module_key,
	m.title            AS module_title,
	i.id               AS item_id,
	i.slug             AS item_slug,
	coalesce(cl.locale, i.default_locale) AS locale,
	cl.title           AS item_title,
	cl.summary         AS item_summary,
	cl.content         AS item_content,
	cv.version_number  AS version_number,
	cv.created_at      AS published_at
FROM public.content_item i
JOIN public.content_module m ON m.id = i.module_id
JOIN LATERAL (
	SELECT cv1.*
	FROM public.content_version cv1
	WHERE cv1.item_id = i.id AND cv1.state = 'published'
	ORDER BY cv1.version_number DESC, cv1.created_at DESC
	LIMIT 1
) AS cv ON TRUE
LEFT JOIN public.content_locale cl ON cl.version_id = cv.id;

-- RLS enable
ALTER TABLE public.content_module ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_version ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_locale ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_asset ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_relation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publish_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Helper predicates
CREATE OR REPLACE FUNCTION public.is_content_viewer() RETURNS BOOLEAN AS $$
	SELECT EXISTS (
		SELECT 1 FROM public.profiles p
		WHERE p.id = auth.uid() AND p.role IN ('content_viewer','content_editor','content_admin')
	);
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION public.is_content_editor() RETURNS BOOLEAN AS $$
	SELECT EXISTS (
		SELECT 1 FROM public.profiles p
		WHERE p.id = auth.uid() AND p.role IN ('content_editor','content_admin')
	);
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION public.is_content_admin() RETURNS BOOLEAN AS $$
	SELECT EXISTS (
		SELECT 1 FROM public.profiles p
		WHERE p.id = auth.uid() AND p.role = 'content_admin'
	);
$$ LANGUAGE sql STABLE;

-- Policies: modules
CREATE POLICY "modules_select_viewers" ON public.content_module
	FOR SELECT USING (public.is_content_viewer());
CREATE POLICY "modules_insert_editors" ON public.content_module
	FOR INSERT WITH CHECK (public.is_content_editor());
CREATE POLICY "modules_update_editors_or_admin" ON public.content_module
	FOR UPDATE USING (public.is_content_editor()) WITH CHECK (public.is_content_editor());

-- Policies: items
CREATE POLICY "items_select_viewers" ON public.content_item
	FOR SELECT USING (public.is_content_viewer());
CREATE POLICY "items_insert_editors" ON public.content_item
	FOR INSERT WITH CHECK (public.is_content_editor());
CREATE POLICY "items_update_editors_or_admin" ON public.content_item
	FOR UPDATE USING (public.is_content_editor()) WITH CHECK (public.is_content_editor());

-- Policies: versions
CREATE POLICY "versions_select_viewers" ON public.content_version
	FOR SELECT USING (public.is_content_viewer());
CREATE POLICY "versions_insert_editors" ON public.content_version
	FOR INSERT WITH CHECK (public.is_content_editor());
CREATE POLICY "versions_update_admin" ON public.content_version
	FOR UPDATE USING (public.is_content_admin()) WITH CHECK (public.is_content_admin());

-- Policies: locales
CREATE POLICY "locales_select_viewers" ON public.content_locale
	FOR SELECT USING (public.is_content_viewer());
CREATE POLICY "locales_insert_editors" ON public.content_locale
	FOR INSERT WITH CHECK (public.is_content_editor());
CREATE POLICY "locales_update_editors" ON public.content_locale
	FOR UPDATE USING (public.is_content_editor()) WITH CHECK (public.is_content_editor());

-- Policies: media
CREATE POLICY "media_select_viewers" ON public.media_asset
	FOR SELECT USING (public.is_content_viewer());
CREATE POLICY "media_insert_editors" ON public.media_asset
	FOR INSERT WITH CHECK (public.is_content_editor());
CREATE POLICY "media_update_editors" ON public.media_asset
	FOR UPDATE USING (public.is_content_editor()) WITH CHECK (public.is_content_editor());

-- Policies: relations
CREATE POLICY "relations_select_viewers" ON public.content_relation
	FOR SELECT USING (public.is_content_viewer());
CREATE POLICY "relations_write_editors" ON public.content_relation
	FOR INSERT WITH CHECK (public.is_content_editor());

-- Policies: logs (read by admins; insert by system/editors)
CREATE POLICY "publish_log_select_admin" ON public.publish_log
	FOR SELECT USING (public.is_content_admin());
CREATE POLICY "publish_log_insert_editors" ON public.publish_log
	FOR INSERT WITH CHECK (public.is_content_editor());

CREATE POLICY "audit_log_select_admin" ON public.audit_log
	FOR SELECT USING (public.is_content_admin());
CREATE POLICY "audit_log_insert_editors" ON public.audit_log
	FOR INSERT WITH CHECK (public.is_content_editor());

-- Public read for view
GRANT SELECT ON TABLE public.v_published_content TO anon, authenticated, service_role;

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_content_item_module ON public.content_item(module_id);
CREATE INDEX IF NOT EXISTS idx_content_version_item ON public.content_version(item_id);
CREATE INDEX IF NOT EXISTS idx_content_locale_version ON public.content_locale(version_id);
CREATE INDEX IF NOT EXISTS idx_content_relation_src ON public.content_relation(source_item_id);
CREATE INDEX IF NOT EXISTS idx_content_relation_tgt ON public.content_relation(target_item_id); 