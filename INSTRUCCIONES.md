# 📋 Instrucciones de Instalación y Configuración

## ✅ Requisitos Previos

- **Node.js** 18+ 
- **npm** o **yarn**
- **PostgreSQL** 12+ (o Docker)
- **Docker** y **Docker Compose** (opcional pero recomendado)
- **Git**

## 🔧 Paso 1: Configuración de PostgreSQL

### Opción A: PostgreSQL Local

```bash
# Crear base de datos
createdb iot_dashboard

# Crear usuario (si no existe)
psql -c "CREATE USER postgres WITH PASSWORD 'postgres123';"

# Ejecutar script de inicialización
psql -U postgres -d iot_dashboard -f backend/database/init.sql
```

### Opción B: Docker (Recomendado)

```bash
# Solo iniciar PostgreSQL
docker run --name iot_db \
  -e POSTGRES_DB=iot_dashboard \
  -e POSTGRES_PASSWORD=postgres123 \
  -p 5432:5432 \
  -v postgres_data:/var/lib/postgresql/data \
  -d postgres:15-alpine

# Esperar 5 segundos y ejecutar el script SQL
sleep 5
psql -h localhost -U postgres -d iot_dashboard -f backend/database/init.sql
```

## 🚀 Paso 2: Configuración del Backend

```bash
# Navegar a la carpeta del backend
cd backend

# Instalar dependencias
npm install

# Crear archivo .env (copiar desde .env.example)
cp .env.example .env

# Editar .env con tus valores
nano .env  # o usa tu editor favorito
```

### Contenido de `.backend/.env`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=iot_dashboard
DB_USER=postgres
DB_PASSWORD=postgres123
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

## 📦 Paso 3: Configuración del Frontend

```bash
# Navegar a la carpeta del frontend
cd frontend

# Instalar dependencias
npm install

# Crear archivo .env.local (opcional)
cat > .env.local << EOF
REACT_APP_API_URL=http://localhost:3000/api
REACT_APP_SOCKET_URL=http://localhost:3000
EOF
```

## ▶️ Paso 4: Ejecución del Proyecto

### Opción A: Ejecución Manual (3 terminales)

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Esperarás: "🚀 Server running on port 3000"
```

**Terminal 2 - Simulador:**
```bash
cd backend
npm run simulator
# El simulador enviará métricas cada 5 segundos
```

**Terminal 3 - Frontend:**
```bash
cd frontend
npm start
# Se abrirá automáticamente en http://localhost:3000
```

### Opción B: Docker Compose (Recomendado)

```bash
# Desde la raíz del proyecto
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down

# Detener y limpiar volúmenes
docker-compose down -v
```

## 🌐 Acceso a la Aplicación

Una vez iniciados todos los servicios:

- **Dashboard:** http://localhost:3000
- **API REST:** http://localhost:3000/api
- **Health Check:** http://localhost:3000/health
- **WebSocket:** ws://localhost:3000

## ✔️ Verificación de Que Todo Funciona

### 1. Health Check
```bash
curl http://localhost:3000/health
# Respuesta esperada: {"status":"OK","timestamp":"...","service":"IoT Energy Dashboard API"}
```

### 2. Obtener Nodos
```bash
curl http://localhost:3000/api/nodes
# Respuesta esperada: Array de nodos
```

### 3. Obtener Estadísticas
```bash
curl http://localhost:3000/api/nodes/stats
# Respuesta esperada: {"total":5,"online":5,"offline":0,"alerta":0}
```

### 4. Ver el Dashboard
Abre en tu navegador: **http://localhost:3000**

Deberías ver:
- ✅ 5 nodos disponibles
- ✅ Gráficas actualizándose en tiempo real
- ✅ Tabla de métricas llenándose con datos
- ✅ Valores de vatios y voltaje cambiando

## 🐛 Solución de Problemas

### Error: "connect ECONNREFUSED 127.0.0.1:5432"
**Problema:** PostgreSQL no está corriendo
```bash
# Solución: Inicia PostgreSQL
sudo service postgresql start  # Linux
brew services start postgresql  # macOS
# O usa Docker
```

### Error: "Module not found"
**Problema:** Dependencias no instaladas
```bash
# Solución: Reinstala dependencias
npm install
# O limpia caché
npm cache clean --force
npm install
```

### El simulador no envía datos
**Problema:** Backend no está corriendo
```bash
# Solución: Asegúrate de que el backend esté en puerto 3000
cd backend && npm run dev
```

### WebSocket no conecta
**Problema:** CORS o conexión
```bash
# Verifica que CORS_ORIGIN sea correcto en .env
CORS_ORIGIN=http://localhost:3000
```

## 📊 Pruebas Manuales de API

### Registrar una Métrica
```bash
curl -X POST http://localhost:3000/api/metrics \
  -H "Content-Type: application/json" \
  -d '{
    "nodo_id": "NODE_1",
    "vatios_generados": 2500.5,
    "voltaje": 220.5,
    "status_code": 200,
    "mensaje": "Prueba manual"
  }'
```

### Obtener Métricas Recientes
```bash
curl "http://localhost:3000/api/metrics/recent?minutes=5"
```

### Obtener Métricas con Filtros
```bash
curl "http://localhost:3000/api/metrics/filters?criticidad=warning&nodo_id=NODE_1"
```

## 🔐 Configuración de Seguridad (Producción)

Para producción, actualiza estos valores en `.env`:

```env
NODE_ENV=production
DB_HOST=tu-rds-endpoint.aws.com
DB_USER=usuario_seguro
DB_PASSWORD=contraseña_fuerte
CORS_ORIGIN=https://tudominio.com
# Agregar Auth0
AUTH0_DOMAIN=tudominio.auth0.com
AUTH0_CLIENT_ID=tu_client_id
AUTH0_CLIENT_SECRET=tu_client_secret
```

## 📚 Documentación Adicional

- [README.md](./README.md) - Guía general del proyecto
- [API Endpoints](./README.md#-api-endpoints) - Documentación de API
- [Arquitectura Limpia](./README.md#-arquitectura-limpia) - Explicación de arquitectura

## 🆘 Soporte

Si encuentras problemas:
1. Revisa los logs: `docker-compose logs -f`
2. Verifica las variables de entorno
3. Asegúrate de que PostgreSQL esté corriendo
4. Limpia caché: `npm cache clean --force`
5. Reinstala dependencias: `rm -rf node_modules && npm install`

## ✅ Checklist de Configuración

- [ ] Node.js 18+ instalado
- [ ] PostgreSQL corriendo
- [ ] Archivo .env creado en backend/
- [ ] `npm install` ejecutado en backend/
- [ ] `npm install` ejecutado en frontend/
- [ ] Script SQL ejecutado en la BD
- [ ] Backend iniciado sin errores
- [ ] Simulador enviando datos
- [ ] Frontend cargando en localhost:3000
- [ ] Dashboard mostrando datos en tiempo real

---

¡Listo! Tu Dashboard IoT está completamente configurado y funcionando. 🎉
