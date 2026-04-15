# 📚 Documentación Técnica Completa - Dashboard IoT

## 🎯 Descripción General

Dashboard de monitoreo de energía IoT en tiempo real que simula nodos solares distribuidos. Sistema full-stack con arquitectura limpia, patrones de diseño avanzados y comunicación en tiempo real mediante WebSockets.

**Caso de Uso:** Una empresa de energía solar necesita monitorear múltiples inversores distribuidos en diferentes ubicaciones. El dashboard permite:
- Ver estado en tiempo real de cada nodo
- Monitorear generación de energía (Vatios)
- Controlar voltaje de salida
- Analizar historial de 7 días
- Recibir alertas de anomalías

---

## 📁 Estructura de Archivos y Funcionalidad

### BACKEND (Node.js + Express)

```
backend/
├── src/
│   ├── domain/                    # Capa de Dominio
│   │   ├── models/
│   │   │   ├── Node.js           # Modelo de Nodo
│   │   │   └── Metric.js         # Modelo de Métrica
│   │   └── interfaces/
│   │       ├── INodeRepository.js # Contrato de datos de Nodos
│   │       └── IMetricRepository.js # Contrato de datos de Métricas
│   │
│   ├── application/               # Capa de Aplicación (Lógica de Negocio)
│   │   └── services/
│   │       ├── NodeService.js    # Casos de uso para Nodos
│   │       └── MetricService.js  # Casos de uso para Métricas
│   │
│   ├── infrastructure/            # Capa de Infraestructura
│   │   ├── repositories/
│   │   │   ├── PostgresNodeRepository.js    # Acceso a datos de Nodos
│   │   │   └── PostgresMetricRepository.js  # Acceso a datos de Métricas
│   │   ├── websocket/
│   │   │   └── socketManager.js  # Manejo de conexiones WebSocket
│   │   └── config/
│   │       └── database.js       # Conexión a PostgreSQL
│   │
│   ├── presentation/             # Capa de Presentación (HTTP)
│   │   ├── controllers/
│   │   │   ├── NodeController.js    # Endpoints de Nodos
│   │   │   └── MetricController.js  # Endpoints de Métricas
│   │   └── routes/
│   │       ├── nodeRoutes.js       # Rutas /api/nodes
│   │       └── metricRoutes.js     # Rutas /api/metrics
│   │
│   └── index.js                 # Punto de entrada - Servidor Express
│
├── database/
│   └── init.sql                 # Script SQL para crear tablas
│
├── simulator.js                 # Generador de datos IoT simulados
├── .env                         # Variables de entorno
└── package.json                 # Dependencias
```

**¿Para qué sirve cada archivo?**

- **Node.js / Metric.js**: Clases que representan la estructura de datos. Encapsulan propiedades como ID, nombre, estado.
- **INodeRepository / IMetricRepository**: Interfaces (contratos) que definen qué métodos debe tener una clase que acceda a datos.
- **PostgresNodeRepository / PostgresMetricRepository**: Implementan las interfaces. Realizan consultas SQL reales a la BD.
- **NodeService / MetricService**: Orquestan la lógica. Validaciones, cálculos, llamadas a repositorios.
- **NodeController / MetricController**: Reciben requests HTTP, llaman servicios, devuelven respuestas.
- **socketManager.js**: Maneja conexiones WebSocket. Cuando hay nuevas métricas, notifica a clientes conectados.
- **init.sql**: Crea tablas `nodos` y `metricas_log` en PostgreSQL.
- **simulator.js**: Script que genera métricas falsas cada 5 segundos para simular inversores reales.

### FRONTEND (React)

```
frontend/
├── src/
│   ├── components/              # Componentes React
│   │   ├── Dashboard.jsx        # Componente principal
│   │   ├── LineChart.jsx        # Gráfica de líneas (Vatios/Voltaje)
│   │   ├── BarChart.jsx         # Gráfica de barras (Histórico 7 días)
│   │   ├── DoughnutChart.jsx    # Gráfica de dona (Estado de nodos)
│   │   └── LogsTable.jsx        # Tabla de métricas
│   │
│   ├── services/                # Servicios de comunicación
│   │   ├── api.js               # Cliente HTTP (Axios)
│   │   └── socketService.js     # Cliente WebSocket (Socket.io)
│   │
│   ├── styles/                  # Estilos CSS
│   │   ├── Dashboard.css
│   │   └── LogsTable.css
│   │
│   ├── App.jsx                  # Componente raíz
│   └── index.jsx                # Punto de entrada React
│
├── .env                         # Variables de entorno
└── package.json                 # Dependencias
```

**¿Para qué sirve cada archivo?**

- **Dashboard.jsx**: Componente principal. Carga nodos, maneja selección, renderiza gráficas.
- **LineChart.jsx / BarChart.jsx / DoughnutChart.jsx**: Visualizan datos usando librería Recharts.
- **LogsTable.jsx**: Muestra tabla de métricas con filtros.
- **api.js**: Crea cliente Axios configurado para llamar API REST. Métodos para GET/POST/PATCH/DELETE.
- **socketService.js**: Crea conexión WebSocket. Escucha eventos como 'nueva_metrica' del servidor.
- **.env**: Define `REACT_APP_API_URL=http://localhost:3000/api` para que frontend sepa dónde está API.

### BASE DE DATOS (PostgreSQL)

```sql
-- Tabla de NODOS (Inversores solares)
nodos
├── id (VARCHAR PK)              -- Identificador único: "NODE_1", "NODE_2"
├── nombre (VARCHAR)             -- "Inversor Central Mixco"
├── ubicacion (VARCHAR)          -- "Techo A1"
├── version_fw (VARCHAR)         -- Versión firmware: "2.1.0"
├── estado (VARCHAR CHECK)       -- "online" | "offline" | "alerta"
├── created_at (TIMESTAMP)       -- Cuando fue creado
└── updated_at (TIMESTAMP)       -- Última actualización

-- Tabla de MÉTRICAS (Registros de generación)
metricas_log
├── id (SERIAL PK)               -- Contador auto-incremental
├── timestamp (TIMESTAMP)        -- Cuándo se registró
├── nodo_id (VARCHAR FK)         -- Referencia a qué nodo
├── vatios_generados (FLOAT)     -- Watts: 1800-3200
├── voltaje (FLOAT)              -- Voltios: 213-227
├── status_code (INT)            -- HTTP code: 200, 201, etc
├── criticidad (VARCHAR CHECK)   -- "info" | "warning" | "error"
├── mensaje (TEXT)               -- Descripción
└── created_at (TIMESTAMP)       -- Fecha registro
```

---

## 🚀 Cómo Iniciar la Aplicación

### OPCIÓN 1: Con Docker (Recomendado)

```bash
# Desde raíz del proyecto
docker-compose up -d

# Ver logs
docker-compose logs -f

# Acceder
# Frontend: http://localhost
# API: http://localhost:3000/api/nodes
# Health: http://localhost:3000/health
```

**¿Qué hace docker-compose.yml?**
- Inicia contenedor PostgreSQL (BD)
- Inicia contenedor Backend (API)
- Inicia contenedor Frontend (React)
- Inicia contenedor Simulator (datos ficticios)
- Conecta todo en red interna
- Mapea puertos a tu máquina

### OPCIÓN 2: Ejecución Manual (Desarrollo Local)

**Terminal 1 - Iniciar PostgreSQL:**
```bash
# Si usas PostgreSQL local
psql -U postgres

# Crear BD
CREATE DATABASE iot_dashboard;

# Cargar esquema
\c iot_dashboard
\i backend/database/init.sql

# Salir
\q
```

**Terminal 2 - Backend:**
```bash
cd backend
npm install              # Primera vez
npm run dev             # Inicia con nodemon en puerto 3000
```

**Terminal 3 - Simulador:**
```bash
cd backend
npm run simulator       # Genera datos ficticios
```

**Terminal 4 - Frontend:**
```bash
cd frontend
npm install             # Primera vez
npm start              # Inicia en puerto 3001
```

**Acceder:**
- Frontend: http://localhost:3001
- API: http://localhost:3000/api
- Health: http://localhost:3000/health

---

## 📡 API REST - Endpoints Disponibles

### Nodos

```bash
# Obtener todos los nodos
GET /api/nodes
Respuesta: [
  { id: "NODE_1", nombre: "Inversor Central Mixco", estado: "online", ... },
  ...
]

# Obtener nodo específico
GET /api/nodes/:id
GET /api/nodes/NODE_1
Respuesta: { id: "NODE_1", nombre: "...", estado: "online" }

# Obtener estadísticas
GET /api/nodes/stats
Respuesta: { total: 10, online: 9, offline: 1, alerta: 0 }

# Crear nodo
POST /api/nodes
Body: { nombre: "Nuevo Inversor", ubicacion: "Techo C1", version_fw: "2.1.0" }
Respuesta: { id: "NODE_123...", nombre: "Nuevo Inversor", ... }

# Cambiar estado de nodo
PATCH /api/nodes/:id/estado
Body: { estado: "offline" }
Respuesta: { id: "NODE_1", estado: "offline" }

# Eliminar nodo
DELETE /api/nodes/:id
Respuesta: 204 No Content
```

### Métricas

```bash
# Registrar nueva métrica
POST /api/metrics
Body: {
  nodo_id: "NODE_1",
  vatios_generados: 2500.5,
  voltaje: 220.5,
  status_code: 200,
  criticidad: "info",
  mensaje: "Operación normal"
}
Respuesta: { id: 1234, timestamp: "2026-04-14T18:30:00Z", ... }

# Métricas de un nodo
GET /api/metrics/node/NODE_1
Respuesta: [ { id: 1, nodo_id: "NODE_1", vatios_generados: 2500, ... }, ... ]

# Métricas con filtros
GET /api/metrics/filters?criticidad=warning&nodo_id=NODE_1
Respuesta: [ { criticidad: "warning", nodo_id: "NODE_1", ... } ]

# Últimas métricas (últimos N minutos)
GET /api/metrics/recent?minutes=5
Respuesta: [ { timestamp: "2026-04-14T18:35:00Z", ... } ]

# Reporte de métricas
GET /api/metrics/report?nodo_id=NODE_1
Respuesta: { total: 150, promedio_vatios: 2450, ... }
```

---

## 🔌 WebSocket Events

### Servidor envía al Cliente

```javascript
// Cuando hay nueva métrica de un nodo específico
socket.on('nueva_metrica', (metric) => {
  console.log(`NODE ${metric.nodo_id}: ${metric.vatios_generados}W @ ${metric.voltaje}V`);
  // Frontend actualiza gráficas automáticamente
});

// Métrica global (de cualquier nodo)
socket.on('nueva_metrica_global', (metric) => {
  console.log("Métrica de:", metric.nodo_id);
});

// Alerta crítica (voltaje/vatios fuera de rango)
socket.on('alerta_critica', (alert) => {
  console.error("ALERTA:", alert.mensaje);
  // Mostrar notificación roja
});

// Cambio de estado de nodo
socket.on('actualizacion_estado_nodo', (update) => {
  console.log(`${update.nodo_id} ahora está ${update.estado}`);
  // Actualizar color de nodo en selector
});
```

### Cliente envía al Servidor

```javascript
// Suscribirse a nodo específico
socket.emit('subscribe_node', 'NODE_1');
// Recibe solo métricas de NODE_1

// Desuscribirse
socket.emit('unsubscribe_node', 'NODE_1');
```

---

## 💡 Modelo de Negocio

**Escenario Real:** Una empresa de energía solar con 10 ubicaciones distribuidas.

**Problemas que resuelve:**
1. **Visibilidad**: Gerentes ven estado real de cada inversor en tiempo real
2. **Alertas**: Se notifica si algún inversor falla o genera poco
3. **Analytics**: Analizar generación histórica, identificar patrones
4. **Optimización**: Detectar cuál ubicación genera más, cuál menos
5. **Mantenimiento**: Registrar cuándo cada nodo se desconecta

**Ejemplo de Uso:**
```
9:00 AM - Gerente abre dashboard
         - Ve 10 inversores online
         - NODE_5 generando 2500W
         - NODE_8 generando 1800W (menos eficiente)

10:00 AM - NODE_3 cambia a "offline"
          - WebSocket emite "alerta_critica"
          - Dashboard muestra en rojo
          - Gerente es notificado

3:00 PM - Revisar gráfica de barras
        - Hoy: 22000W total (hasta ahora)
        - Ayer: 21500W (más que ayer!)
        
7:00 PM - Revisar tabla de logs
        - 847 métricas registradas en 10 horas
        - Analizar picos, dips, anomalías
        - Exportar reporte
```

---

## 🏗️ Cómo Funciona Técnicamente

### Flujo de Datos

```
1. SIMULADOR genera métrica
   simulator.js -> POST /api/metrics
   
2. BACKEND recibe métrica
   Controllers -> Services -> Repositories
   → Valida, guarda en BD
   
3. WEBSOCKET notifica
   socketManager emite 'nueva_metrica'
   
4. FRONTEND recibe evento
   socketService escucha
   
5. GRÁFICAS se actualizan
   React re-renderiza automáticamente
```

### Arquitectura por Capas

```
┌─────────────────────────────────────┐
│   PRESENTATION (REST + WebSocket)   │  Controllers, Routes
│   /api/nodes, /api/metrics          │
├─────────────────────────────────────┤
│   APPLICATION (Business Logic)      │  Services, Validaciones
│   NodeService, MetricService        │
├─────────────────────────────────────┤
│   INFRASTRUCTURE (Data Access)      │  Repositories, DB Config
│   PostgresNodeRepository            │
├─────────────────────────────────────┤
│   DOMAIN (Models & Interfaces)      │  Node.js, Metric.js
│   Pure business objects             │
└─────────────────────────────────────┘
```

**Ventaja:** Cambiar BD de PostgreSQL a MongoDB solo modifica Repository. Todo lo demás sigue igual.

### Pattern Repository

```javascript
// Interfaz (Contrato)
interface INodeRepository {
  getAllNodes(): Promise<Node[]>
  getNodeById(id): Promise<Node>
  createNode(node): Promise<Node>
  updateNode(id, node): Promise<Node>
  deleteNode(id): Promise<void>
}

// Implementación PostgreSQL
class PostgresNodeRepository implements INodeRepository {
  async getAllNodes() {
    const result = await pool.query('SELECT * FROM nodos');
    return result.rows.map(row => new Node(row.id, row.nombre, ...));
  }
}

// Si cambiamos a MongoDB
class MongoNodeRepository implements INodeRepository {
  async getAllNodes() {
    return await NodesCollection.find({}).toArray();
  }
}

// El servicio NO cambia
class NodeService {
  constructor(private repository: INodeRepository) {}
  
  async getAllNodes() {
    // Mismo código. Repository puede ser Postgres O Mongo
    return this.repository.getAllNodes();
  }
}
```

---

## 📊 Dashboard Features Detalladas

### 1. Selector de Nodos
- Grid de tarjetas, una por nodo
- Color verde = Online, naranja = Offline, rojo = Alerta
- Click en tarjeta = selecciona para ver detalles
- Último nodo seleccionado se guarda en estado React

### 2. Gráfica de Líneas (Tiempo Real)
- X: Timestamps (últimos 30 minutos)
- Y Izquierda: Vatios (0-3500W)
- Y Derecha: Voltaje (0-250V)
- Línea azul = Vatios
- Línea verde = Voltaje
- Se actualiza cada 5 segundos via WebSocket

### 3. Gráfica de Barras (Histórico)
- X: Últimos 7 días
- Y: Watios totales del día
- Barras amarillas = Total Vatios
- Barras verdes = Promedio Vatios
- Datos calculados agrupando métricas por día

### 4. Gráfica de Dona (Estado)
- Porcentaje de nodos Online
- Porcentaje de nodos Offline
- Porcentaje de nodos en Alerta
- Se actualiza cuando cambia estado de algún nodo

### 5. Tabla de Logs
- Columnas: Timestamp, Nodo, Vatios, Voltaje, Criticidad, Mensaje
- Filtros por rango de fechas
- Filtros por criticidad (info/warning/error)
- Búsqueda por ID de nodo
- Paginación con scroll infinito

---

## 🔐 Seguridad

- ✅ CORS habilitado: Solo requests de http://localhost:3001 aceptados
- ✅ Validación de entrada: Controllers validan campos requeridos
- ✅ SQL Injection prevenido: Usamos prepared statements (Parameterized Queries)
- ✅ PostgreSQL password: Configurado en .env (no hardcodeado)
- ✅ JWT preparado: Estructura lista para agregar Auth0

---

## 🐛 Troubleshooting

**"Error: connect ECONNREFUSED 127.0.0.1:5432"**
- PostgreSQL no está corriendo
- Solución: `docker-compose up -d postgres` O iniciar PostgreSQL local

**"Cannot GET /api/nodes"**
- Backend no está corriendo
- Solución: `npm run dev` en carpeta backend

**"WebSocket connection failed"**
- CORS mal configurado
- Solución: Verificar `CORS_ORIGIN` en backend/.env

**Frontend muestra "Error cargando la aplicación"**
- API no responde
- Solución: Verificar que backend esté en http://localhost:3000

---

## 📚 Para Entender Mejor

**Pregunta:** ¿Cómo llega la métrica del Simulador al Dashboard?

**Respuesta:**
```
1. simulator.js genera:
   { nodo_id: "NODE_1", vatios_generados: 2400, voltaje: 220 }

2. POST /api/metrics
   → MetricController.recordMetric()
   → MetricService.recordMetric()
   → PostgresMetricRepository.createMetric()
   → INSERT INTO metricas_log ...
   → socketManager.broadcastMetric()

3. socketManager emite:
   socket.emit('nueva_metrica', metric)

4. Frontend escucha:
   socket.on('nueva_metrica', (metric) => {
     setMetrics([...metrics, metric])
   })

5. React re-renderiza:
   <LineChart data={metrics} />

6. Recharts dibuja nueva línea
```

**Beneficio de WebSockets vs REST:**
- REST: Cliente debe hacer polling cada segundo (ineficiente)
- WebSocket: Servidor empuja datos cuando hay cambios (en tiempo real, eficiente)


