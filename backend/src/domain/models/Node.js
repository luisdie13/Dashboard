/**
 * Clase Node - Modelo de dominio para nodos IoT
 */
class Node {
  constructor(id, nombre, ubicacion, version_fw, estado = 'online') {
    this.id = id;
    this.nombre = nombre;
    this.ubicacion = ubicacion;
    this.version_fw = version_fw;
    this.estado = estado;
    this.created_at = new Date();
    this.updated_at = new Date();
  }
}

module.exports = Node;
