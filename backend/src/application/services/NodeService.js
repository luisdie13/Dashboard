const Node = require('../../domain/models/Node');

/**
 * NodeService - Casos de uso y lógica de negocio para Nodos
 */
class NodeService {
  constructor(nodeRepository) {
    this.nodeRepository = nodeRepository;
  }

  async getAllNodes() {
    return this.nodeRepository.getAllNodes();
  }

  async getNodeById(id) {
    const node = await this.nodeRepository.getNodeById(id);
    if (!node) {
      throw new Error(`Node with ID ${id} not found`);
    }
    return node;
  }

  async createNode(nombre, ubicacion, version_fw) {
    if (!nombre || nombre.trim().length === 0) {
      throw new Error('Node name is required');
    }

    if (!ubicacion || ubicacion.trim().length === 0) {
      throw new Error('Node location is required');
    }

    if (!version_fw || version_fw.trim().length === 0) {
      throw new Error('Firmware version is required');
    }

    const id = `NODE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newNode = new Node(id, nombre, ubicacion, version_fw, 'online');

    return this.nodeRepository.createNode(newNode);
  }

  async updateNodeEstado(id, estado) {
    const node = await this.nodeRepository.getNodeById(id);
    if (!node) {
      throw new Error(`Node with ID ${id} not found`);
    }

    return this.nodeRepository.updateNode(id, { estado });
  }

  async deleteNode(id) {
    const node = await this.nodeRepository.getNodeById(id);
    if (!node) {
      throw new Error(`Node with ID ${id} not found`);
    }

    return this.nodeRepository.deleteNode(id);
  }

  async getNodesByEstado(estado) {
    return this.nodeRepository.getNodesByEstado(estado);
  }

  async getNodeStatistics() {
    const allNodes = await this.nodeRepository.getAllNodes();
    const online = allNodes.filter(n => n.estado === 'online').length;
    const offline = allNodes.filter(n => n.estado === 'offline').length;
    const alerta = allNodes.filter(n => n.estado === 'alerta').length;

    return {
      total: allNodes.length,
      online,
      offline,
      alerta,
    };
  }
}

module.exports = NodeService;
