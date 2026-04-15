const express = require('express');
const MetricController = require('../controllers/MetricController');
const MetricService = require('../../application/services/MetricService');
const PostgresMetricRepository = require('../../infrastructure/repositories/PostgresMetricRepository');
const PostgresNodeRepository = require('../../infrastructure/repositories/PostgresNodeRepository');

const router = express.Router();

// Instanciar repositorios y servicios
const metricRepository = new PostgresMetricRepository();
const nodeRepository = new PostgresNodeRepository();
const metricService = new MetricService(metricRepository, nodeRepository);
const metricController = new MetricController(metricService);

// Rutas
router.post('/', (req, res) => metricController.recordMetric(req, res));
router.get('/node/:nodo_id', (req, res) => metricController.getMetricsByNodeId(req, res));
router.get('/filters', (req, res) => metricController.getMetricsWithFilters(req, res));
router.get('/recent', (req, res) => metricController.getRecentMetrics(req, res));
router.get('/report', (req, res) => metricController.getMetricsReport(req, res));

module.exports = router;
