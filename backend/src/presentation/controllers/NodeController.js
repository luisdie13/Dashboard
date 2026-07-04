/**
 * NodeController - Manejador de rutas para Nodos
 */
class NodeController {
  constructor(nodeService) {
    this.nodeService = nodeService;
  }

  async getAllNodes(req, res) {
    try {
      const nodes = await this.nodeService.getAllNodes();
      res.status(200).json(nodes);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching nodes' });
    }
  }

  async getNodeById(req, res) {
    try {
      const { id } = req.params;
      const node = await this.nodeService.getNodeById(id);
      res.status(200).json(node);
    } catch (error) {
      res.status(404).json({ error: 'Node not found' });
    }
  }

  async createNode(req, res) {
    try {
      const { nombre, ubicacion, version_fw } = req.body;

      if (!nombre || !ubicacion || !version_fw) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const newNode = await this.nodeService.createNode(nombre, ubicacion, version_fw);
      res.status(201).json(newNode);
    } catch (error) {
      res.status(400).json({ error: 'Error creating node' });
    }
  }

  async updateNodeEstado(req, res) {
    try {
      const { id } = req.params;
      const { estado } = req.body;

      if (!['online', 'offline', 'alerta'].includes(estado)) {
        res.status(400).json({ error: 'Invalid estado value' });
        return;
      }

      const updatedNode = await this.nodeService.updateNodeEstado(id, estado);

      const socketManager = req.app.locals.socketManager;
      if (socketManager) {
        socketManager.emitNodeStatusUpdate(id, { estado, nombre: updatedNode.nombre });
      }

      res.status(200).json(updatedNode);
    } catch (error) {
      res.status(404).json({ error: 'Node not found' });
    }
  }

  async deleteNode(req, res) {
    try {
      const { id } = req.params;
      await this.nodeService.deleteNode(id);
      res.status(204).send();
    } catch (error) {
      res.status(404).json({ error: 'Node not found' });
    }
  }

  async getNodeStatistics(req, res) {
    try {
      const stats = await this.nodeService.getNodeStatistics();
      res.status(200).json(stats);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching statistics' });
    }
  }
}

module.exports = NodeController;
