import React, { useEffect, useState } from 'react';
import '../styles/Dashboard.css';
import LineChart from './LineChart';
import BarChart from './BarChart';
import DoughnutChart from './DoughnutChart';
import LogsTable from './LogsTable';
import { metricService, nodeService } from '../services/api';
import { socketService } from '../services/socketService';

const MOCK_RECENT_METRICS = [
  { nodo_id: 'NODE_1', timestamp: new Date().toISOString(), vatios_generados: 2450, voltaje: 220.5, status_code: 200, criticidad: 'info', mensaje: 'Funcionamiento normal' },
  { nodo_id: 'NODE_2', timestamp: new Date(Date.now() - 5000).toISOString(), vatios_generados: 2380, voltaje: 221.3, status_code: 200, criticidad: 'info', mensaje: 'Generación estable' },
  { nodo_id: 'NODE_3', timestamp: new Date(Date.now() - 10000).toISOString(), vatios_generados: 2100, voltaje: 208.5, status_code: 400, criticidad: 'warning', mensaje: 'Nivel de voltaje bajo' },
  { nodo_id: 'NODE_1', timestamp: new Date(Date.now() - 15000).toISOString(), vatios_generados: 2600, voltaje: 222.1, status_code: 200, criticidad: 'info', mensaje: 'Funcionamiento óptimo' },
  { nodo_id: 'NODE_4', timestamp: new Date(Date.now() - 20000).toISOString(), vatios_generados: 2750, voltaje: 219.8, status_code: 200, criticidad: 'info', mensaje: 'Temperatura moderada' },
  { nodo_id: 'NODE_5', timestamp: new Date(Date.now() - 25000).toISOString(), vatios_generados: 1900, voltaje: 217.0, status_code: 500, criticidad: 'error', mensaje: 'Falla en inversor' },
];

const MOCK_HISTORICAL = [
  { fecha: '2026-06-27', total_vatios: 32000, promedio_vatios: 2400 },
  { fecha: '2026-06-28', total_vatios: 35000, promedio_vatios: 2520 },
  { fecha: '2026-06-29', total_vatios: 38000, promedio_vatios: 2650 },
  { fecha: '2026-06-30', total_vatios: 41000, promedio_vatios: 2800 },
  { fecha: '2026-07-01', total_vatios: 39000, promedio_vatios: 2700 },
  { fecha: '2026-07-02', total_vatios: 42000, promedio_vatios: 2850 },
  { fecha: '2026-07-03', total_vatios: 45000, promedio_vatios: 2980 },
];

function Dashboard({ nodes }) {
  const [selectedNode, setSelectedNode] = useState(nodes.length > 0 ? nodes[0].id : null);
  const [recentMetrics, setRecentMetrics] = useState(MOCK_RECENT_METRICS);
  const [allMetrics, setAllMetrics] = useState(MOCK_RECENT_METRICS);
  const [nodeStats, setNodeStats] = useState(() => ({
    total: nodes.length,
    online: nodes.filter((n) => n.estado === 'online').length,
    offline: nodes.filter((n) => n.estado === 'offline').length,
    alerta: nodes.filter((n) => n.estado === 'alerta').length,
  }));
  const [historicalData, setHistoricalData] = useState(MOCK_HISTORICAL);
  const [filters, setFilters] = useState({
    criticidad: '',
    startDate: '',
    endDate: '',
    search: '',
  });

  // Setup de socket — una sola vez al montar el componente
  useEffect(() => {
    const handleNewMetric = (metric) => {
      setRecentMetrics((prev) => [metric, ...prev].slice(0, 100));
      setAllMetrics((prev) => [metric, ...prev].slice(0, 1000));
    };

    const handleNodeStatusUpdate = () => {
      nodeService.getNodeStats()
        .then((res) => setNodeStats(res.data))
        .catch(() => {});
    };

    socketService.on('nueva_metrica', handleNewMetric);
    socketService.on('actualizacion_estado_nodo', handleNodeStatusUpdate);

    return () => {
      socketService.off('nueva_metrica', handleNewMetric);
      socketService.off('actualizacion_estado_nodo', handleNodeStatusUpdate);
    };
  }, []);

  // Carga de datos al cambiar el nodo seleccionado
  useEffect(() => {
    const fetchData = async () => {
      try {
        const metricsRes = await metricService.getRecentMetrics(5);
        if (metricsRes.data?.length > 0) {
          setRecentMetrics(metricsRes.data);
        }
      } catch {}

      try {
        const allRes = await metricService.getMetricsWithFilters({});
        if (allRes.data?.length > 0) {
          setAllMetrics(allRes.data);
        }
      } catch {}

      try {
        if (selectedNode) {
          const reportRes = await metricService.getMetricsReport(selectedNode);
          if (reportRes.data?.dayMetrics?.length > 0) {
            setHistoricalData(reportRes.data.dayMetrics);
          }
        }
      } catch {}

      try {
        const statsRes = await nodeService.getNodeStats();
        setNodeStats(statsRes.data);
      } catch {}
    };

    fetchData();
  }, [selectedNode]);

  const handleNodeSelect = async (nodeId) => {
    setSelectedNode(nodeId);
    socketService.subscribe(nodeId);

    try {
      const reportRes = await metricService.getMetricsReport(nodeId);
      if (reportRes.data?.dayMetrics?.length > 0) {
        setHistoricalData(reportRes.data.dayMetrics);
      }
    } catch {}
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const setDateRange = (range) => {
    const now = new Date();
    let startDate = '';
    let endDate = now.toISOString().slice(0, 16);

    if (range === 'today') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString().slice(0, 16);
    } else if (range === 'yesterday') {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      startDate = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate()).toISOString().slice(0, 16);
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString().slice(0, 16);
    } else if (range === 'lastMonth') {
      const lastMonth = new Date(now);
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      startDate = lastMonth.toISOString().slice(0, 16);
    }

    setFilters((prev) => ({ ...prev, startDate, endDate }));
  };

  const applyFilters = async () => {
    try {
      const params = {};
      if (filters.criticidad) params.criticidad = filters.criticidad;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const res = await metricService.getMetricsWithFilters(params);
      let results = res.data;

      // Filtro client-side por ID de nodo o ubicación
      if (filters.search.trim()) {
        const term = filters.search.trim().toLowerCase();
        const matchedNodeIds = new Set(
          nodes
            .filter((n) => n.id.toLowerCase().includes(term) || n.ubicacion.toLowerCase().includes(term))
            .map((n) => n.id)
        );
        results = results.filter(
          (m) => m.nodo_id.toLowerCase().includes(term) || matchedNodeIds.has(m.nodo_id)
        );
      }

      setAllMetrics(results);
    } catch (error) {
      console.error('Error aplicando filtros:', error);
    }
  };

  const lineChartData = selectedNode
    ? recentMetrics.filter((m) => m.nodo_id === selectedNode)
    : recentMetrics;

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
                <span
                  className="status-badge"
                  style={{
                    backgroundColor:
                      node.estado === 'online' ? '#00c49f' : node.estado === 'offline' ? '#ff8042' : '#ffd700',
                  }}
                ></span>
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
          {lineChartData.length > 0 ? (
            <LineChart data={lineChartData} />
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
          <DoughnutChart data={nodeStats} />
        </div>
      </div>

      {/* Tabla de Logs */}
      <div className="logs-section">
        <h2>Historial de Métricas</h2>

        <div className="filters">
          <div className="filter-group">
            <label>Rango de Fechas</label>
            <div className="date-range-buttons">
              <button type="button" onClick={() => setDateRange('today')}>Hoy</button>
              <button type="button" onClick={() => setDateRange('yesterday')}>Ayer</button>
              <button type="button" onClick={() => setDateRange('lastMonth')}>Último Mes</button>
            </div>
          </div>

          <div className="filter-group">
            <label>Criticidad</label>
            <select name="criticidad" value={filters.criticidad} onChange={handleFilterChange}>
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
            <label>Buscar (ID Nodo / Ubicación)</label>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Ej: NODE_1 o Techo A1"
            />
          </div>

          <div className="filter-group filter-actions">
            <label>&nbsp;</label>
            <button type="button" className="btn-apply" onClick={applyFilters}>
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
