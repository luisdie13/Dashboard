const Node = require('../../domain/models/Node');
const pool = require('../../config/database');

/**
 * PostgresNodeRepository - Implementación del repositorio para Nodos
 */
class PostgresNodeRepository {
  async getAllNodes() {
    const query = 'SELECT * FROM nodos ORDER BY created_at DESC';
    const result = await pool.query(query);
    return result.rows.map(row => new Node(row.id, row.nombre, row.ubicacion, row.version_fw, row.estado));
  }

  async getNodeById(id) {
    const query = 'SELECT * FROM nodos WHERE id = $1';
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    return new Node(row.id, row.nombre, row.ubicacion, row.version_fw, row.estado);
  }

  async createNode(node) {
    const query = 'INSERT INTO nodos (id, nombre, ubicacion, version_fw, estado) VALUES ($1, $2, $3, $4, $5) RETURNING *';
    const result = await pool.query(query, [node.id, node.nombre, node.ubicacion, node.version_fw, node.estado]);
    const row = result.rows[0];
    return new Node(row.id, row.nombre, row.ubicacion, row.version_fw, row.estado);
  }

  async updateNode(id, node) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.entries(node).forEach(([key, value]) => {
      if (value !== undefined && key !== 'id') {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    values.push(id);
    const query = `UPDATE nodos SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const result = await pool.query(query, values);
    if (result.rows.length === 0) throw new Error('Node not found');
    const row = result.rows[0];
    return new Node(row.id, row.nombre, row.ubicacion, row.version_fw, row.estado);
  }

  async deleteNode(id) {
    const query = 'DELETE FROM nodos WHERE id = $1';
    await pool.query(query, [id]);
  }

  async getNodesByEstado(estado) {
    const query = 'SELECT * FROM nodos WHERE estado = $1 ORDER BY created_at DESC';
    const result = await pool.query(query, [estado]);
    return result.rows.map(row => new Node(row.id, row.nombre, row.ubicacion, row.version_fw, row.estado));
  }

  async getNodesByLocation(ubicacion) {
    const query = 'SELECT * FROM nodos WHERE ubicacion = $1 ORDER BY created_at DESC';
    const result = await pool.query(query, [ubicacion]);
    return result.rows.map(row => new Node(row.id, row.nombre, row.ubicacion, row.version_fw, row.estado));
  }
}

module.exports = PostgresNodeRepository;
