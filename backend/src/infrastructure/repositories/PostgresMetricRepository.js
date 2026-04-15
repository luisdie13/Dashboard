const Metric = require('../../domain/models/Metric');
const pool = require('../../config/database');

/**
 * PostgresMetricRepository - Implementación del repositorio para Métricas
 */
class PostgresMetricRepository {
  async getAllMetrics() {
    const query = 'SELECT * FROM metricas_log ORDER BY timestamp DESC LIMIT 1000';
    const result = await pool.query(query);
    return result.rows.map(row => this.rowToMetric(row));
  }

  async getMetricById(id) {
    const query = 'SELECT * FROM metricas_log WHERE id = $1';
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) return null;
    return this.rowToMetric(result.rows[0]);
  }

  async createMetric(metric) {
    const query = 'INSERT INTO metricas_log (timestamp, nodo_id, vatios_generados, voltaje, status_code, criticidad, mensaje) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *';
    const result = await pool.query(query, [
      metric.timestamp,
      metric.nodo_id,
      metric.vatios_generados,
      metric.voltaje,
      metric.status_code,
      metric.criticidad,
      metric.mensaje,
    ]);
    return this.rowToMetric(result.rows[0]);
  }

  async getMetricsByNodeId(nodo_id) {
    const query = 'SELECT * FROM metricas_log WHERE nodo_id = $1 ORDER BY timestamp DESC LIMIT 100';
    const result = await pool.query(query, [nodo_id]);
    return result.rows.map(row => this.rowToMetric(row));
  }

  async getMetricsWithFilters(nodo_id, criticidad, startDate, endDate) {
    let query = 'SELECT * FROM metricas_log WHERE 1=1';
    const params = [];

    if (nodo_id) {
      query += ` AND nodo_id = $${params.length + 1}`;
      params.push(nodo_id);
    }

    if (criticidad) {
      query += ` AND criticidad = $${params.length + 1}`;
      params.push(criticidad);
    }

    if (startDate) {
      query += ` AND timestamp >= $${params.length + 1}`;
      params.push(startDate);
    }

    if (endDate) {
      query += ` AND timestamp <= $${params.length + 1}`;
      params.push(endDate);
    }

    query += ' ORDER BY timestamp DESC LIMIT 1000';
    const result = await pool.query(query, params);
    return result.rows.map(row => this.rowToMetric(row));
  }

  async getAggregatedMetricsByDay(nodo_id) {
    let query = `
      SELECT 
        DATE(timestamp) as fecha,
        SUM(vatios_generados) as total_vatios,
        AVG(vatios_generados) as promedio_vatios,
        COUNT(*) as cantidad_registros
      FROM metricas_log
    `;
    const params = [];

    if (nodo_id) {
      query += ` WHERE nodo_id = $1`;
      params.push(nodo_id);
    }

    query += ' GROUP BY DATE(timestamp) ORDER BY fecha DESC LIMIT 30';
    const result = await pool.query(query, params);
    return result.rows;
  }

  async getAggregatedMetricsByMonth(nodo_id) {
    let query = `
      SELECT 
        DATE_TRUNC('month', timestamp)::DATE as mes,
        SUM(vatios_generados) as total_vatios,
        AVG(vatios_generados) as promedio_vatios,
        COUNT(*) as cantidad_registros
      FROM metricas_log
    `;
    const params = [];

    if (nodo_id) {
      query += ` WHERE nodo_id = $1`;
      params.push(nodo_id);
    }

    query += ' GROUP BY DATE_TRUNC(\'month\', timestamp) ORDER BY mes DESC LIMIT 12';
    const result = await pool.query(query, params);
    return result.rows;
  }

  rowToMetric(row) {
    return new Metric(
      row.nodo_id,
      row.vatios_generados,
      row.voltaje,
      row.status_code,
      row.criticidad,
      row.mensaje,
      new Date(row.timestamp)
    );
  }
}

module.exports = PostgresMetricRepository;
