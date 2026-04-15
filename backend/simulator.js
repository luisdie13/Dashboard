const axios = require('axios');
require('dotenv').config();

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';

// Nodos simulados
const NODES = [
  { id: 'NODE_1', nombre: 'Inversor Central Mixco', ubicacion: 'Techo A1', version_fw: '2.1.0' },
  { id: 'NODE_2', nombre: 'Inversor Lateral Sur', ubicacion: 'Techo A2', version_fw: '2.1.0' },
  { id: 'NODE_3', nombre: 'Inversor Zona Este', ubicacion: 'Techo B1', version_fw: '2.0.5' },
  { id: 'NODE_4', nombre: 'Inversor Zona Oeste', ubicacion: 'Techo B2', version_fw: '2.1.0' },
  { id: 'NODE_5', nombre: 'Inversor Respaldo', ubicacion: 'Bodega', version_fw: '1.9.8' },
];

/**
 * Inicializar nodos en la base de datos
 */
async function initializeNodes() {
  try {
    console.log('🔄 Inicializando nodos...');
    for (const node of NODES) {
      try {
        await axios.post(`${API_BASE_URL}/nodes`, {
          nombre: node.nombre,
          ubicacion: node.ubicacion,
          version_fw: node.version_fw,
        });
        console.log(`✅ Nodo creado: ${node.id}`);
      } catch (error) {
        // Si el nodo ya existe, continuamos
        if (error.response?.status !== 400) {
          console.error(`❌ Error creando nodo ${node.id}:`, error.message);
        }
      }
    }
  } catch (error) {
    console.error('❌ Error inicializando nodos:', error.message);
  }
}

/**
 * Generar métrica aleatoria realista
 */
function generateMetric(nodo_id) {
  // Valores aleatorios realistas
  const baseWatios = 2000 + Math.random() * 1000; // 2000-3000W
  const vatios = baseWatios + (Math.random() - 0.5) * 500; // Variación ±250W
  
  const baseVoltaje = 220 + (Math.random() - 0.5) * 10; // 215-225V
  const voltaje = baseVoltaje + (Math.random() - 0.5) * 5; // Variación ±2.5V

  // 95% OK, 3% warning, 2% error
  let status_code = 200;
  const random = Math.random();
  if (random < 0.02) {
    status_code = 500;
  } else if (random < 0.05) {
    status_code = 400;
  }

  // Determinar criticidad basada en voltaje y status
  let criticidad = 'info';
  if (status_code === 500) criticidad = 'error';
  else if (status_code === 400) criticidad = 'warning';
  else if (voltaje < 210 || voltaje > 230) criticidad = 'warning';

  const mensajes = [
    'Funcionamiento normal',
    'Pequeña variación en carga',
    'Nivel de voltaje bajo',
    'Funcionamiento óptimo',
    'Temperatura moderada',
    'Generación estable',
  ];

  return {
    nodo_id,
    vatios_generados: parseFloat(vatios.toFixed(2)),
    voltaje: parseFloat(voltaje.toFixed(2)),
    status_code,
    mensaje: mensajes[Math.floor(Math.random() * mensajes.length)],
  };
}

/**
 * Enviar métrica al API
 */
async function sendMetric(metric) {
  try {
    await axios.post(`${API_BASE_URL}/metrics`, metric, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log(`📤 Métrica enviada para ${metric.nodo_id}: ${metric.vatios_generados}W @ ${metric.voltaje}V`);
  } catch (error) {
    console.error(`❌ Error enviando métrica:`, error.message);
  }
}

/**
 * Ejecutar ciclo de simulación
 */
async function simulateMetrics() {
  try {
    for (const node of NODES) {
      const metric = generateMetric(node.id);
      await sendMetric(metric);
    }
  } catch (error) {
    console.error('❌ Error en ciclo de simulación:', error.message);
  }
}

/**
 * Main - Iniciar simulador
 */
async function main() {
  console.log('🚀 Iniciando simulador IoT...');
  console.log(`📍 API URL: ${API_BASE_URL}`);
  console.log(`⏱️  Interval: 5 segundos\n`);

  // Inicializar nodos
  await initializeNodes();
  
  // Esperar 2 segundos antes de iniciar las métricas
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Enviar métricas cada 5 segundos
  console.log('📊 Comenzando a enviar métricas...\n');
  
  setInterval(async () => {
    const timestamp = new Date().toLocaleTimeString('es-ES');
    console.log(`\n[${timestamp}] 📡 Enviando batch de métricas...`);
    await simulateMetrics();
  }, 5000);

  // Enviar primera métrica inmediatamente
  await simulateMetrics();
}

// Iniciar si se ejecuta directamente
if (require.main === module) {
  main();
}

module.exports = { generateMetric, sendMetric };
