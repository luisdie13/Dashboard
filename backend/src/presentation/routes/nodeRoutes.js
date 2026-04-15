const express = require('express');
const NodeController = require('../controllers/NodeController');
const NodeService = require('../../application/services/NodeService');
const PostgresNodeRepository = require('../../infrastructure/repositories/PostgresNodeRepository');

const router = express.Router();

// Instanciar repositorio y servicio
const nodeRepository = new PostgresNodeRepository();
const nodeService = new NodeService(nodeRepository);
const nodeController = new NodeController(nodeService);

// Rutas
router.get('/', (req, res) => nodeController.getAllNodes(req, res));
router.get('/stats', (req, res) => nodeController.getNodeStatistics(req, res));
router.get('/:id', (req, res) => nodeController.getNodeById(req, res));
router.post('/', (req, res) => nodeController.createNode(req, res));
router.patch('/:id/estado', (req, res) => nodeController.updateNodeEstado(req, res));
router.delete('/:id', (req, res) => nodeController.deleteNode(req, res));

module.exports = router;
