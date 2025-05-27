'use client';
import { useState, useEffect } from 'react';
import ServiceTypeChart from '@/components/ServiceTypeChart';
import DailyTripsChart from '@/components/DailyTripsChart';

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const res = await fetch('/api/dashboard');
        const data = await res.json();
        setDashboardData(data);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  if (loading) return <div className="p-4">Loading...</div>;
  if (!dashboardData) return <div className="p-4">No data available</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Trip Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ServiceTypeChart data={dashboardData.serviceTypeDistribution} />
        <DailyTripsChart data={dashboardData.dailyTrips} />
      </div>
    </div>
  );
}