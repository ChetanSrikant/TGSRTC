import { Suspense } from 'react';
import LineChart from '../components/LineChart';
import BarChart from '../components/BarChart';
import PieChart from '../components/PieChart';

async function getDashboardData() {
  // For development (client-side)
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? process.env.NEXT_PUBLIC_BASE_URL 
    : 'http://localhost:3000';

  const res = await fetch(`${baseUrl}/api/dashboard`, {
    // Ensure SSR fetch works in Next.js App Router
    cache: 'no-store',
    // If you want cookies/session, add credentials: 'include'
  });

  if (!res.ok) {
    throw new Error('Failed to fetch data');
  }
  return res.json();
}

export default async function DashboardPage() {
  const { salesData, userData, productData } = await getDashboardData();

  // Prepare data for charts
  const salesChartData = {
    labels: salesData.map(item => item.date),
    datasets: [
      {
        label: 'Sales',
        data: salesData.map(item => item.amount),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
    ],
  };

  const userChartData = {
    labels: userData.map(item => item.date),
    datasets: [
      {
        label: 'Active Users',
        data: userData.map(item => item.active_users),
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  };

  const productChartData = {
    labels: productData.map(item => item.product_category),
    datasets: [
      {
        label: 'Products Sold',
        data: productData.map(item => item.total_quantity),
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <Suspense fallback={<div>Loading sales chart...</div>}>
            <LineChart 
              data={salesChartData} 
              title="Sales Over Time" 
            />
          </Suspense>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <Suspense fallback={<div>Loading users chart...</div>}>
            <BarChart 
              data={userChartData} 
              title="User Activity" 
            />
          </Suspense>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow max-w-md mx-auto">
        <Suspense fallback={<div>Loading product chart...</div>}>
          <PieChart 
            data={productChartData} 
            title="Product Categories" 
          />
        </Suspense>
      </div>
    </div>
  );
}