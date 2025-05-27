'use client';

import { useEffect, useState } from 'react';
import NavBar from './components/NavBar'; // Ensure this path is correct
import StatCards from './components/StatCards'; // Ensure this path is correct
import BarChart from './components/charts/BarChart'; // Ensure this path is correct
import LineChart from './components/charts/LineChart'; // Ensure this path is correct
import PieChart from './components/charts/PieChart'; // Ensure this path is correct
import LoadingSpinner from './components/LoadingSpinner'; // Ensure this path is correct
import ChartWrapper from './components/charts/ChartWrapper'; // Ensure this path is correct

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const apiUrl = '/api/dashboard'; // Fetches from our updated API
        console.log('Fetching from:', apiUrl);

        const res = await fetch(apiUrl, {
          next: { revalidate: 3600 } // Or adjust caching as needed
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(`Failed to fetch: ${res.status} ${res.statusText} - ${errData.error || 'Unknown error'}`);
        }

        const data = await res.json();
        console.log('Received data:', data);
        setDashboardData(data);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []); // Runs once on mount

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="p-6 max-w-7xl mx-auto">
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
            <p className="font-bold">Error Loading Data</p>
            <p>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="p-6 max-w-7xl mx-auto">
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
            <p className="font-bold">No Data Available</p>
            <p>Could not retrieve dashboard data. Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }

  // Destructure with defaults to prevent errors if API response is partial
  const {
    stats = [],
    dailyTrips = { labels: [], datasets: [] },
    serviceTypes = { labels: [], datasets: [] },
    topRoutes = { labels: [], datasets: [] },
    ticketTypes = { labels: [], datasets: [] },
    tripDirections = { labels: [], datasets: [] },
    timeDistribution = { labels: [], datasets: [] },
    depotPerformance = { labels: [], datasets: [] },
    distanceCoverage = { labels: [], datasets: [] }
  } = dashboardData;

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />

      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">TGSRTC Travel Dashboard</h1>
          <p className="text-sm text-gray-500">Showing all available data</p>
        </div>

        <StatCards stats={stats} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mt-6">
          <ChartWrapper title="Daily Trips">
            {dailyTrips?.labels?.length > 0 ? <LineChart data={dailyTrips} /> : <p>No data</p>}
          </ChartWrapper>

          <ChartWrapper title="Service Types">
            {serviceTypes?.labels?.length > 0 ? <PieChart data={serviceTypes} /> : <p>No data</p>}
          </ChartWrapper>

          <ChartWrapper title="Top Routes">
            {topRoutes?.labels?.length > 0 ? <BarChart data={topRoutes} /> : <p>No data</p>}
          </ChartWrapper>

          <ChartWrapper title="Ticket Types">
            {ticketTypes?.labels?.length > 0 ? <PieChart data={ticketTypes} /> : <p>No data</p>}
          </ChartWrapper>

          <ChartWrapper title="Trip Directions">
            {tripDirections?.labels?.length > 0 ? <PieChart data={tripDirections} /> : <p>No data</p>}
          </ChartWrapper>

          <ChartWrapper title="Passenger Flow by Hour">
            {timeDistribution?.labels?.length > 0 ? <LineChart data={timeDistribution} /> : <p>No data</p>}
          </ChartWrapper>

          <ChartWrapper title="Depot Performance">
            {depotPerformance?.labels?.length > 0 ? <BarChart data={depotPerformance} /> : <p>No data</p>}
          </ChartWrapper>

          <ChartWrapper title="Distance Coverage">
            {distanceCoverage?.labels?.length > 0 ? <PieChart data={distanceCoverage} /> : <p>No data</p>}
          </ChartWrapper>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Data last updated: {new Date().toLocaleString()}</p>
          <p className="mt-1">TGSRTC © {new Date().getFullYear()}</p>
        </div>
      </div>
    </div>
  );
}