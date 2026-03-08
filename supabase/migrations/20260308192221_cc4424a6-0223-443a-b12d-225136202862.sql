
-- Create table for action plan tasks
CREATE TABLE public.action_items (
  id SERIAL PRIMARY KEY,
  challenge_category TEXT NOT NULL DEFAULT '',
  area_of_improvement TEXT NOT NULL DEFAULT '',
  stream_owner TEXT NOT NULL DEFAULT '',
  priority TEXT NOT NULL DEFAULT '',
  planned_actions TEXT NOT NULL DEFAULT '',
  summary TEXT NOT NULL DEFAULT '',
  dashboard_owner TEXT NOT NULL DEFAULT '',
  task_supporters TEXT NOT NULL DEFAULT '',
  ecd TEXT NOT NULL DEFAULT '',
  update_status TEXT NOT NULL DEFAULT '',
  remarks TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create table for app settings (key-value store for all configs)
CREATE TABLE public.app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create table for owner photos (base64 stored in DB)
CREATE TABLE public.owner_photos (
  photo_key TEXT PRIMARY KEY,
  data_url TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.action_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.owner_photos ENABLE ROW LEVEL SECURITY;

-- Public read access (shared dashboard visible to all)
CREATE POLICY "Anyone can read action items" ON public.action_items FOR SELECT USING (true);
CREATE POLICY "Anyone can read settings" ON public.app_settings FOR SELECT USING (true);
CREATE POLICY "Anyone can read photos" ON public.owner_photos FOR SELECT USING (true);

-- Public write access (admin auth handled at app level)
CREATE POLICY "Anyone can insert action items" ON public.action_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update action items" ON public.action_items FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete action items" ON public.action_items FOR DELETE USING (true);

CREATE POLICY "Anyone can insert settings" ON public.app_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update settings" ON public.app_settings FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete settings" ON public.app_settings FOR DELETE USING (true);

CREATE POLICY "Anyone can insert photos" ON public.owner_photos FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update photos" ON public.owner_photos FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete photos" ON public.owner_photos FOR DELETE USING (true);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_action_items_updated_at
  BEFORE UPDATE ON public.action_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_app_settings_updated_at
  BEFORE UPDATE ON public.app_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_owner_photos_updated_at
  BEFORE UPDATE ON public.owner_photos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
