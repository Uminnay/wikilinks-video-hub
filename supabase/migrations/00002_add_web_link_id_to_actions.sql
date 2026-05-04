-- Añadir soporte de acciones vinculadas a web_links
ALTER TABLE actions ADD COLUMN IF NOT EXISTS web_link_id TEXT;
