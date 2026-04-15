import React, { useEffect, useState } from 'react';
import '../styles/Dashboard.css';
import LineChart from './LineChart';
import BarChart from './BarChart';
import DoughnutChart from './DoughnutChart';
import LogsTable from './LogsTable';
import { metricService, nodeService } from '../services/api';
import { socketService } from '../services/socketService';

function Dashboard({ nodes }) {
  const [selectedNode, setSelectedNode] = useState(nodes.length > 0 ? nodes[0].id : null);
  const [recentMetrics, setRecentMetrics] = useState([]);
  const [allMetrics, setAllMetrics] = useState([]);
  const [nodeStats, setNodeStats] = useState({ total: 0, online: 0, offline: 0, alerta: 0 });
  const [historicalData, setHistoricalData] = useState([]);
  const [filters, setFilters] = useState({
    criticidad: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    loadInitialData();

    socketService.on('nueva_metrica', (metric) => {
      setRecentMetrics((prev) => [metric, ...prev].slice(0, 100));
      setAllMetrics((prev) => [metric, ...prev].slice(0, 1000));
    });

    socketService.on('actualizacion_estado_nodo', (update) => {
      loadNodeStats();
    });

    return () => {
      socketService.disconnect();
    };
  }, [selectedNode]);

  const loadInitialData = async () => {
    // Datos de ejemplo para tiempo real
    const mockRecentMetrics = [
      { nodo_id: 'node-1', timestamp: new Date().toISOString(), vatios_generados: 450, voltaje: 220, status_code: 200, criticidad: 'info', mensaje: 'Normal' },
      { nodo_id: 'node-1', timestamp: new Date(Date.now() - 5000).toISOString(), vatios_generados: 445, voltaje: 219, status_code: 200, criticidad: 'info', mensaje: 'Normal' },
      { nodo_id: 'node-1', timestamp: new Date(Date.now() - 10000).toISOString(), vatios_generados: 440, voltaje: 221, status_code: 200, criticidad: 'info', mensaje: 'Normal' },
      { nodo_id: 'node-1', timestamp: new Date(Date.now() - 15000).toISOString(), vatios_generados: 455, voltaje: 220, status_code: 200, criticidad: 'info', mensaje: 'Normal' },
      { nodo_id: 'node-1', timestamp: new Date(Date.now() - 20000).toISOString(), vatios_generados: 460, voltaje: 222, status_code: 200, criticidad: 'info', mensaje: 'Normal' },
    ];

    // Datos de ejemplo para histórico
    const mockHistoricalData = [
      { fecha: '2026-04-07', total_vatios: 3200, promedio_vatios: 320 },
      { fecha: '2026-04-08', total_vatios: 3500, promedio_vatios: 350 },
      { fecha: '2026-04-09', total_vatios: 3800, promedio_vatios: 380 },
      { fecha: '2026-04-10', total_vatios: 4100, promedio_vatios: 410 },
      { fecha: '2026-04-11', total_vatios: 3900, promedio_vatios: 390 },
      { fecha: '2026-04-12', total_vatios: 4200, promedio_vatios: 420 },
      { fecha: '2026-04-13', total_vatios: 4500, promedio_vatios: 450 },
    ];

    // Establecer datos de ejemplo por defecto
    setRecentMetrics(mockRecentMetrics);
    setAllMetrics(mockRecentMetrics);
    setHistoricalData(mockHistoricalData);

    // Intentar cargar datos del servidor
    try {
      const metricsRes = await metricService.getRecentMetrics(5);
      if (metricsRes.data && metricsRes.data.length > 0) {
        setRecentMetrics(metricsRes.data);
        setAllMetrics(metricsRes.data);
      }
    } catch (error) {
      console.log('API no disponible, usando datos de ejemplo');
    }

    try {
      if (selectedNode) {
        const reportRes = await metricService.getMetricsReport(selectedNode);
        if (reportRes.data && reportRes.data.dayMetrics && reportRes.data.dayMetrics.length > 0) {
          setHistoricalData(reportRes.data.dayMetrics);
        }
      }
    } catch (error) {
      console.log('Usando datos históricos de ejemplo');
    }
  };

  const loadNodeStats = async () => {
    try {
      const statsRes = await nodeService.getNodeStats();
      setNodeStats(statsRes.data);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  const handleNodeSelect = async (nodeId) => {
    setSelectedNode(nodeId);
    socketService.subscribe(nodeId);

    try {
      const reportRes = await metricService.getMetricsReport(nodeId);
      setHistoricalData(reportRes.data.dayMetrics || []);
    } catch (error) {
      console.error('Error cargando reporte:', error);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = async () => {
    try {
      const params = {};
      if (filters.criticidad) params.criticidad = filters.criticidad;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const res = await metricService.getMetricsWithFilters(params);
      setAllMetrics(res.data);
    } catch (error) {
      console.error('Error aplicando filtros:', error);
    }
  };

  const nodeSelectMetrics = recentMetrics;

  const doughnutData = {
    online: nodes.filter((n) => n.estado === 'online').length,
    offline: nodes.filter((n) => n.estado === 'offline').length,
    alerta: nodes.filter((n) => n.estado === 'alerta').length,
  };

  return (
    <div className="dashboard">
      {/* Selector de Nodos */}
      <div className="nodes-selector">
        <h2>Nodos Disponibles</h2>
        <div className="nodes-grid">
          {nodes.map((node) => (
            <div
              key={node.id}
              className={`node-card ${selectedNode === node.id ? 'active' : ''} ${node.estado}`}
              onClick={() => handleNodeSelect(node.id)}
            >
              <div className="node-info">
                <span className="status-badge" style={{
                  backgroundColor: node.estado === 'online' ? '#00c49f' : node.estado === 'offline' ? '#ff8042' : '#ffd700'
                }}></span>
                <strong>{node.nombre}</strong>
                <small>{node.ubicacion}</small>
              </div>
              <div className="estado-label">{node.estado.toUpperCase()}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Gráficas */}
      <div className="charts-section">
        <div className="chart-container">
          <h3>Generación en Tiempo Real</h3>
          {nodeSelectMetrics.length > 0 ? (
            <LineChart data={nodeSelectMetrics} />
          ) : (
            <p className="no-data">Sin datos disponibles</p>
          )}
        </div>

        <div className="chart-container">
          <h3>Histórico por Día</h3>
          {historicalData.length > 0 ? (
            <BarChart data={historicalData} />
          ) : (
            <p className="no-data">Sin datos históricos</p>
          )}
        </div>

        <div className="chart-container">
          <h3>Estado de Nodos</h3>
          <DoughnutChart data={doughnutData} />
        </div>
      </div>

      {/* Tabla de Logs */}
      <div className="logs-section">
        <h2>Historial de Métricas</h2>

        <div className="filters">
          <div className="filter-group">
            <label>Criticidad</label>
            <select
              name="criticidad"
              value={filters.criticidad}
              onChange={handleFilterChange}
            >
              <option value="">Todas</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Fecha Inicio</label>
            <input
              type="datetime-local"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
            />
          </div>

          <div className="filter-group">
            <label>Fecha Fin</label>
            <input
              type="datetime-local"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
            />
          </div>

          <div className="filter-group">
            <label>&nbsp;</label>
            <button onClick={applyFilters} style={{
              backgroundColor: '#667eea',
              color: 'white',
              border: 'none',
              padding: '0.7rem',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}>
              Aplicar Filtros
            </button>
          </div>
        </div>

        <LogsTable logs={allMetrics} />
      </div>
    </div>
  );
}

export default Dashboard;
