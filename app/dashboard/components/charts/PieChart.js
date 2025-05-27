// app/dashboard/components/charts/PieChart.js
'use client';

import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

export default function PieChart({ data }) {
  if (!data || !data.labels || data.labels.length === 0) {
    return <div className="h-full flex items-center justify-center text-gray-500">No data available</div>;
  }

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
    },
  };

  return <Pie options={options} data={data} />;
}