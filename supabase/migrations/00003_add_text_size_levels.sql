-- AÑADIR COLUMNA PARA TAMAÑO DE TEXTO (NORMAL, GRANDE, MUY GRANDE)
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS text_size TEXT DEFAULT 'normal';

-- MIGRAR DATOS EXISTENTES (SI ERA TRUE -> LARGE, SI ERA FALSE -> NORMAL)
UPDATE user_settings SET text_size = 'large' WHERE large_text_mode = true AND text_size = 'normal';
