-- TABLA DE AJUSTES GLOBALES DEL USUARIO
CREATE TABLE IF NOT EXISTS user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'dark',
  large_text_mode BOOLEAN DEFAULT FALSE,
  user_profile JSONB DEFAULT '{"name": "Usuario"}',
  categories JSONB DEFAULT '[]',
  priorities JSONB DEFAULT '[]',
  time_filters JSONB DEFAULT '[]',
  tags JSONB DEFAULT '[]',
  notion_config JSONB DEFAULT '{}'
);
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own settings" ON user_settings FOR ALL USING (auth.uid() = user_id);

-- TABLA DE VÍDEOS
CREATE TABLE IF NOT EXISTS videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  youtube_video_id TEXT,
  title TEXT NOT NULL,
  channel_name TEXT,
  thumbnail_url TEXT,
  duration_seconds INTEGER,
  published_at TIMESTAMP WITH TIME ZONE,
  category TEXT NOT NULL,
  priority TEXT,
  status TEXT DEFAULT 'pending',
  notion_status TEXT DEFAULT 'none',
  notion_title TEXT,
  notion_category TEXT,
  notion_personal_note TEXT,
  notion_related_project TEXT,
  notion_date TEXT,
  personal_notes TEXT,
  ai_summary TEXT,
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  tags TEXT[] DEFAULT '{}'
);
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own videos" ON videos FOR ALL USING (auth.uid() = user_id);

-- TABLA DE ENLACES WEB
CREATE TABLE IF NOT EXISTS web_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  priority TEXT,
  status TEXT DEFAULT 'pending',
  notion_status TEXT DEFAULT 'none',
  notion_title TEXT,
  notion_category TEXT,
  notion_personal_note TEXT,
  notion_related_project TEXT,
  notion_date TEXT,
  personal_notes TEXT,
  ai_summary TEXT,
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  tags TEXT[] DEFAULT '{}'
);
ALTER TABLE web_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own web_links" ON web_links FOR ALL USING (auth.uid() = user_id);

-- TABLA DE ACCIONES (SUBTAREAS)
CREATE TABLE IF NOT EXISTS actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  video_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
ALTER TABLE actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own actions" ON actions FOR ALL USING (auth.uid() = user_id);
