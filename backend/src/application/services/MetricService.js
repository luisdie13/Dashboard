const Metric = require('../../domain/models/Metric');

/**
 * MetricService - Casos de uso y lógica de negocio para Métricas
 */
class MetricService {
  constructor(metricRepository, nodeRepository) {
    this.metricRepository = metricRepository;
    this.nodeRepository = nodeRepository;
  }

  async recordMetric(nodo_id, vatios_generados, voltaje, status_code, mensaje) {
    const node = await this.nodeRepository.getNodeById(nodo_id);
    if (!node) {
      throw new Error(`Node with ID ${nodo_id} not found`);
    }

    // Lógica de negocio: determinar criticidad
    let criticidad = 'info';

    if (status_code !== 200) {
      criticidad = status_code >= 500 ? 'error' : 'warning';
    }

    // Detectar anomalías eléctricas
    if (voltaje < 180 || voltaje > 240) {
      criticidad = criticidad === 'error' ? 'error' : 'warning';
    }

    const metric = new Metric(
      nodo_id,
      vatios_generados,
      voltaje,
      status_code,
      criticidad,
      mensaje
    );

    return this.metricRepository.createMetric(metric);
  }

  async getMetricsByNodeId(nodo_id) {
    const node = await this.nodeRepository.getNodeById(nodo_id);
    if (!node) {
      throw new Error(`Node with ID ${nodo_id} not found`);
    }

    return this.metricRepository.getMetricsByNodeId(nodo_id);
  }

  async getMetricsWithFilters(nodo_id, criticidad, startDate, endDate) {
    return this.metricRepository.getMetricsWithFilters(nodo_id, criticidad, startDate, endDate);
  }

  async getRecentMetrics(minutes = 5) {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - minutes * 60 * 1000);
    return this.metricRepository.getMetricsWithFilters(undefined, undefined, startDate, endDate);
  }

  async getMetricsReport(nodo_id) {
    const dayMetrics = await this.metricRepository.getAggregatedMetricsByDay(nodo_id);
    const monthMetrics = await this.metricRepository.getAggregatedMetricsByMonth(nodo_id);

    const allMetrics = nodo_id
      ? await this.metricRepository.getMetricsByNodeId(nodo_id)
      : await this.metricRepository.getAllMetrics();

    const errorCount = allMetrics.filter(m => m.criticidad === 'error').length;
    const warningCount = allMetrics.filter(m => m.criticidad === 'warning').length;
    const infoCount = allMetrics.filter(m => m.criticidad === 'info').length;

    return {
      dayMetrics,
      monthMetrics,
      stats: {
        total: allMetrics.length,
        errors: errorCount,
        warnings: warningCount,
        info: infoCount,
      },
    };
  }
}

module.exports = MetricService;
