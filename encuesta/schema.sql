-- Esquema completo para una base NUEVA. (Para la base que ya existe se agregaron las columnas v y fp con ALTER TABLE.)
CREATE TABLE IF NOT EXISTS respuestas (
  id   TEXT PRIMARY KEY,
  ts   TEXT NOT NULL,
  data TEXT NOT NULL,
  v    TEXT NOT NULL DEFAULT 'ok',  -- ok | admin | revisada cuentan; 'no' = sin verificar (no cuenta)
  fp   TEXT                         -- huella cifrada de IP + navegador, solo para detectar grupos raros
);
CREATE INDEX IF NOT EXISTS idx_respuestas_ts ON respuestas (ts);

-- Una sola fila (id = 1): los insights que el ponente publica con ayuda de Claude.
CREATE TABLE IF NOT EXISTS insights (
  id   INTEGER PRIMARY KEY CHECK (id = 1),
  data TEXT NOT NULL,
  ts   TEXT NOT NULL
);

-- Entradas de un solo uso ya gastadas.
CREATE TABLE IF NOT EXISTS usados (
  nonce TEXT PRIMARY KEY,
  ts    TEXT NOT NULL
);
