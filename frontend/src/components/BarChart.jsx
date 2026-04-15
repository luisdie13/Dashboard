import React from 'react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function BarChart({ data }) {
  const chartData = data.map((item) => ({
    name: item.fecha || item.mes,
    total: item.total_vatios,
    promedio: item.promedio_vatios ? item.promedio_vatios.toFixed(0) : 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsBarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="total" fill="#ffc658" name="Total Vatios" />
        <Bar dataKey="promedio" fill="#82ca9d" name="Promedio Vatios" />
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}

export default BarChart;
