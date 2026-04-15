-- Crear tabla de Nodos
CREATE TABLE IF NOT EXISTS nodos (
  id VARCHAR(255) PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  ubicacion VARCHAR(255) NOT NULL,
  version_fw VARCHAR(50) NOT NULL,
  estado VARCHAR(50) DEFAULT 'online' CHECK (estado IN ('online', 'offline', 'alerta')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de Métricas/Logs
CREATE TABLE IF NOT EXISTS metricas_log (
  id SERIAL PRIMARY KEY,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  nodo_id VARCHAR(255) NOT NULL,
  vatios_generados FLOAT NOT NULL,
  voltaje FLOAT NOT NULL,
  status_code INT NOT NULL,
  criticidad VARCHAR(50) NOT NULL CHECK (criticidad IN ('info', 'warning', 'error')),
  mensaje TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (nodo_id) REFERENCES nodos(id) ON DELETE CASCADE
);

-- Crear índices para optimizar consultas
CREATE INDEX idx_metricas_timestamp ON metricas_log(timestamp DESC);
CREATE INDEX idx_metricas_nodo_id ON metricas_log(nodo_id);
CREATE INDEX idx_metricas_criticidad ON metricas_log(criticidad);
CREATE INDEX idx_nodos_estado ON nodos(estado);

-- Insertar datos de ejemplo
INSERT INTO nodos (id, nombre, ubicacion, version_fw, estado) VALUES
  ('NODE_1', 'Inversor Central Mixco', 'Techo A1', '2.1.0', 'online'),
  ('NODE_2', 'Inversor Sur Guatemala', 'Techo A2', '2.1.0', 'online'),
  ('NODE_3', 'Inversor Zona 10', 'Techo B1', '2.0.5', 'online'),
  ('NODE_4', 'Inversor Antigua', 'Techo B2', '2.1.0', 'offline'),
  ('NODE_5', 'Inversor Petapa', 'Techo C1', '2.1.0', 'online')
ON CONFLICT DO NOTHING;
