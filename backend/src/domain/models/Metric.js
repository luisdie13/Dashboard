/**
 * Clase Metric - Modelo de dominio para métricas
 */
class Metric {
  constructor(nodo_id, vatios_generados, voltaje, status_code, criticidad, mensaje, timestamp = new Date()) {
    this.timestamp = timestamp;
    this.nodo_id = nodo_id;
    this.vatios_generados = vatios_generados;
    this.voltaje = voltaje;
    this.status_code = status_code;
    this.criticidad = criticidad;
    this.mensaje = mensaje;
  }
}

module.exports = Metric;
