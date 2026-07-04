import React from 'react';
import '../styles/LogsTable.css';

function LogsTable({ logs }) {
  const getCriticalityClass = (criticidad) => {
    switch (criticidad) {
      case 'error': return 'criticality-error';
      case 'warning': return 'criticality-warning';
      case 'info': return 'criticality-info';
      default: return '';
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString('es-ES');
    } catch {
      return dateString;
    }
  };

  return (
    <div className="logs-table-container">
      {logs.length === 0 ? (
        <p className="no-logs">No hay métricas que mostrar</p>
      ) : (
        <table className="logs-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Nodo ID</th>
              <th>Vatios (W)</th>
              <th>Voltaje (V)</th>
              <th>Status</th>
              <th>Criticidad</th>
              <th>Mensaje</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, index) => (
              <tr key={`${log.nodo_id}-${log.timestamp}-${index}`} className={getCriticalityClass(log.criticidad)}>
                <td className="timestamp">{formatDate(log.timestamp)}</td>
                <td className="nodo-id">{log.nodo_id}</td>
                <td className="vatios">{log.vatios_generados?.toFixed(2) || 'N/A'}</td>
                <td className="voltaje">{log.voltaje?.toFixed(2) || 'N/A'}</td>
                <td className={`status status-${log.status_code}`}>{log.status_code}</td>
                <td className={`criticidad criticidad-${log.criticidad}`}>
                  <span className="badge">{log.criticidad?.toUpperCase()}</span>
                </td>
                <td className="mensaje">{log.mensaje}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default LogsTable;
