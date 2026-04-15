# Dashboard de Monitoreo de Energía IoT

Un dashboard en tiempo real para monitorear nodos solares ficticios, construido con arquitectura limpia y patrón repositorio.

## Estructura del Proyecto

```
Dashboard/
├── backend/                 # API REST y WebSocket
│   ├── src/
│   │   ├── domain/         # Modelos e Interfaces
│   │   ├── application/    # Servicios (Casos de Uso)
│   │   ├── infrastructure/ # Repositorios y Config
│   │   ├── presentation/   # Controladores y Rutas
│   │   └── index.ts        # Entrada Principal
│   ├── database/           # Scripts SQL
│   ├── simulator.ts        # Generador de datos IoT
│   └── package.json
├── frontend/               # Dashboard React
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── services/       # API y WebSocket
│   │   ├── styles/         # Estilos CSS
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── public/            # Assets estáticos
│   └── package.json
└── docker-compose.yml     # Orquestación de servicios
```

## Inicio Rápido

### Prerrequisitos

- Node.js 18+
- Docker y Docker Compose
- PostgreSQL (o usar Docker)

### Instalación

1. **Clonar el Repositorio**
```bash
git clone <repo-url>
cd Dashboard
```

2. **Instalar Backend**
```bash
cd backend
npm install
```

3. **Instalar Frontend**
```bash
cd ../frontend
npm install
```

### Configuración de Base de Datos

1.  **Crear la Base de Datos:**
```bash
psql -U postgres -f backend/database/init.sql
```

O si usas Docker:
```bash
docker-compose up -d postgres
psql -h localhost -U postgres -d iot_dashboard -f backend/database/init.sql
```

### Ejecución

**Opción 1: Con Docker Compose (Recomendado)**
```bash
docker-compose up -d
```

**Opción 2: Ejecución Manual**

Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

Terminal 2 - Simulador:
```bash
cd backend
npm run simulator
```

Terminal 3 - Frontend:
```bash
cd frontend
npm start
```

## URLs de Acceso

**Con Docker Compose:**
- **Dashboard Frontend:** 
  - http://localhost (puerto 80)
  - http://localhost:3001 (mismo contenedor)
- **API REST:** http://localhost:3000/api
- **Health Check:** http://localhost:3000/health
- **WebSocket:** ws://localhost:3000
- **Base de Datos:** localhost:5432

**Con Ejecución Manual (Local):**
- **Dashboard Frontend:** http://localhost:3001
- **API REST:** http://localhost:3000/api
- **Health Check:** http://localhost:3000/health
- **WebSocket:** ws://localhost:3000
- **Base de Datos:** localhost:5432

## 📡 API Endpoints

### Nodos
```
GET    /api/nodes              # Obtener todos los nodos
GET    /api/nodes/:id          # Obtener nodo por ID
GET    /api/nodes/stats        # Estadísticas de nodos
POST   /api/nodes              # Crear nodo
PATCH  /api/nodes/:id/estado   # Actualizar estado
DELETE /api/nodes/:id          # Eliminar nodo
```

### Métricas
```
POST   /api/metrics            # Registrar métrica
GET    /api/metrics/node/:id   # Métricas por nodo
GET    /api/metrics/filters    # Métricas con filtros
GET    /api/metrics/recent     # Métricas recientes
GET    /api/metrics/report     # Reporte de métricas
```

## Eventos WebSocket

### Cliente → Servidor
```javascript
socket.emit('subscribe_node', 'NODE_1');      // Suscribirse a nodo
socket.emit('unsubscribe_node', 'NODE_1');    // Desuscribirse
```

### Servidor → Cliente
```javascript
socket.on('nueva_metrica', (metric) => {});           // Nueva métrica
socket.on('nueva_metrica_global', (metric) => {});    // Métrica global
socket.on('alerta_critica', (alert) => {});           // Alerta crítica
socket.on('actualizacion_estado_nodo', (update) => {}); // Cambio estado
```

## Esquema de Base de Datos

### Tabla: `nodos`
```sql
id              VARCHAR(255) PRIMARY KEY
nombre          VARCHAR(255)
ubicacion       VARCHAR(255)
version_fw      VARCHAR(50)
estado          VARCHAR(50) - online|offline|alerta
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

### Tabla: `metricas_log`
```sql
id              SERIAL PRIMARY KEY
timestamp       TIMESTAMP
nodo_id         VARCHAR(255) FK
vatios_generados FLOAT
voltaje         FLOAT
status_code     INT
criticidad      VARCHAR(50) - info|warning|error
mensaje         TEXT
created_at      TIMESTAMP
```

## Testing

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

## Dashboard Features

### 1. Selector de Nodos
- Visualización de todos los nodos con su estado
- Selección rápida para ver detalles en tiempo real
- Indicadores visuales del estado

### 2. Gráfica de Líneas
- Datos en tiempo real de los últimos 5 minutos
- Muestra vatios y voltaje simultáneamente
- Actualización automática con WebSockets

### 3. Gráfica de Barras
- Comparativa de generación por día
- Últimos 7 días de historial
- Muestra total y promedio

### 4. Gráfica de Dona
- Distribución de nodos por estado
- Online, Offline, Alerta
- Actualización en tiempo real

### 5. Tabla de Logs Avanzada
- Filtros por rango de fechas
- Filtros por criticidad
- Búsqueda por ID de nodo
- Scroll horizontal en móviles

## Arquitectura Limpia

El proyecto sigue el patrón de **Arquitectura Limpia de 3 Capas**:

### 1. **Domain Layer** 
- Modelos e Interfaces de Repositorio
- Lógica pura del negocio
- No depende de frameworks externos

### 2. **Application Layer**
- Casos de Uso (Services)
- Orquesta la lógica del negocio
- Valida reglas de negocio

### 3. **Infrastructure Layer**
- Implementaciones de Repositorios
- Conexión a Base de Datos
- Configuración técnica

### 4. **Presentation Layer**
- Controladores (Handlers de rutas)
- Manejo de HTTP
- Validación de entrada/salida

## Patrón Repositorio

```typescript
// Interface (Contrato)
export interface IMetricRepository {
  createMetric(metric: IMetric): Promise<IMetric>;
  getMetricsByNodeId(nodo_id: string): Promise<IMetric[]>;
  // ...
}

// Implementación PostgreSQL
export class PostgresMetricRepository implements IMetricRepository {
  async createMetric(metric: IMetric): Promise<IMetric> {
    // Implementar lógica SQL
  }
}

// Servicio usa la interfaz, no la implementación
export class MetricService {
  constructor(private metricRepository: IMetricRepository) {}
  
  async recordMetric(...) {
    return this.metricRepository.createMetric(metric);
  }
}
```

## Seguridad

- ✅ JWT tokens (preparado para Auth0)
- ✅ CORS habilitado y configurable
- ✅ Validación de entrada en controladores
- ✅ Manejo seguro de contraseñas en BD
- ✅ Conexión segura a PostgreSQL

## Deployment

### Docker
```bash
docker build -t iot-dashboard-backend ./backend
docker run -e DB_HOST=host.docker.internal -p 3000:3000 iot-dashboard-backend
```

### Heroku / Vercel / AWS
- Configurar variables de entorno
- Ejecutar migraciones de BD
- Deploym ent automático con GitHub

## Logs y Monitoreo

El sistema registra:
- Conexiones de WebSocket
- Errores de Base de Datos
- Métricas anómalas (voltaje fuera de rango)
- Intentos de acceso no autorizados

## Contribuir

1. Fork el repositorio
2. Crear rama de feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Open Pull Request