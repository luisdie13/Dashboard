import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const nodeService = {
  getAllNodes: () => api.get('/nodes'),
  getNodeById: (id) => api.get(`/nodes/${id}`),
  getNodeStats: () => api.get('/nodes/stats'),
  createNode: (data) => api.post('/nodes', data),
  updateNodeStatus: (id, estado) => api.patch(`/nodes/${id}/estado`, { estado }),
  deleteNode: (id) => api.delete(`/nodes/${id}`),
};

export const metricService = {
  recordMetric: (data) => api.post('/metrics', data),
  getMetricsByNode: (nodo_id) => api.get(`/metrics/node/${nodo_id}`),
  getMetricsWithFilters: (params) => api.get('/metrics/filters', { params }),
  getRecentMetrics: (minutes = 5) => api.get('/metrics/recent', { params: { minutes } }),
  getMetricsReport: (nodo_id) => api.get('/metrics/report', { params: { nodo_id } }),
};

export default api;
