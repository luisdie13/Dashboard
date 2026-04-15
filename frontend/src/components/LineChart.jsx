import React from 'react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function LineChart({ data }) {
  const chartData = data.map((metric, index) => ({
    name: index.toString(),
    vatios: metric.vatios_generados,
    voltaje: metric.voltaje,
    time: new Date(metric.timestamp).toLocaleTimeString('es-ES'),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsLineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" angle={-45} textAnchor="end" height={80} />
        <YAxis yAxisId="left" />
        <YAxis yAxisId="right" orientation="right" />
        <Tooltip />
        <Legend />
        <Line yAxisId="left" type="monotone" dataKey="vatios" stroke="#8884d8" dot={false} name="Vatios" />
        <Line yAxisId="right" type="monotone" dataKey="voltaje" stroke="#82ca9d" dot={false} name="Voltaje" />
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}

export default LineChart;
