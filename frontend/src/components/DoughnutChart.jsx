import React from 'react';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';

function DoughnutChart({ data }) {
  const COLORS = { online: '#00C49F', offline: '#FF8042', alerta: '#FFD700' };

  const chartData = [
    { name: 'Online', value: data.online, fill: COLORS.online },
    { name: 'Offline', value: data.offline, fill: COLORS.offline },
    { name: 'Alerta', value: data.alerta, fill: COLORS.alerta },
  ].filter((item) => item.value > 0);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
          label={(entry) => `${entry.name}: ${entry.value}`}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => `${value} nodo(s)`} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

export default DoughnutChart;
