/**
 * MetricController - Manejador de rutas para Métricas
 */
class MetricController {
  constructor(metricService) {
    this.metricService = metricService;
  }

  async recordMetric(req, res) {
    try {
      const { nodo_id, vatios_generados, voltaje, status_code, mensaje } = req.body;

      if (!nodo_id || vatios_generados === undefined || voltaje === undefined || status_code === undefined) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const metric = await this.metricService.recordMetric(
        nodo_id,
        vatios_generados,
        voltaje,
        status_code,
        mensaje || 'No message'
      );

      // Emitir via socketManager desde el ciclo de vida de la petición (solución escalable sin variables globales)
      const socketManager = req.app.locals.socketManager;
      if (socketManager) {
        socketManager.emitNewMetric(metric.nodo_id, metric);
        if (metric.criticidad === 'error') {
          socketManager.emitCriticalAlert(metric.nodo_id, metric);
        }
      }

      res.status(201).json(metric);
    } catch (error) {
      res.status(400).json({ error: 'Error recording metric' });
    }
  }

  async getMetricsByNodeId(req, res) {
    try {
      const { nodo_id } = req.params;
      const metrics = await this.metricService.getMetricsByNodeId(nodo_id);
      res.status(200).json(metrics);
    } catch (error) {
      res.status(404).json({ error: 'Node not found or no metrics' });
    }
  }

  async getMetricsWithFilters(req, res) {
    try {
      const { nodo_id, criticidad, startDate, endDate } = req.query;

      const metrics = await this.metricService.getMetricsWithFilters(
        nodo_id,
        criticidad,
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined
      );

      res.status(200).json(metrics);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching metrics' });
    }
  }

  async getRecentMetrics(req, res) {
    try {
      const { minutes } = req.query;
      const mins = minutes ? parseInt(minutes) : 5;

      const metrics = await this.metricService.getRecentMetrics(mins);
      res.status(200).json(metrics);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching recent metrics' });
    }
  }

  async getMetricsReport(req, res) {
    try {
      const { nodo_id } = req.query;
      const report = await this.metricService.getMetricsReport(nodo_id);
      res.status(200).json(report);
    } catch (error) {
      res.status(500).json({ error: 'Error generating report' });
    }
  }
}

module.exports = MetricController;
