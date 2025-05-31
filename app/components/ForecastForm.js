'use client';
import { useState, useEffect, useMemo } from 'react';
import DataTable from './DataTable'; // Adjust path if needed
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const transformResultsData = (resultsData) => {
  if (!resultsData || !Array.isArray(resultsData)) {
    return [];
  }
  const dataByDate = {};
  resultsData.forEach(item => {
    const key = item.key;
    if (!item.table || !Array.isArray(item.table)) return;
    item.table.forEach(row => {
      const date = row["Date"];
      const passengers = row["No of Passengers"];
      if (!dataByDate[date]) {
        dataByDate[date] = { "Date": date };
      }
      dataByDate[date][key] = passengers;
    });
  });
  const transformedArray = Object.values(dataByDate);
  transformedArray.sort((a, b) => new Date(a.Date) - new Date(b.Date));
  return transformedArray;
};

const transformCombinedTableData = (data) => {
  if (!data || !Array.isArray(data)) {
    return [];
  }

  const desiredKeys = [
    "Date",
    "Buses_0_",
    "Total_0_",
    "Buses_CO",
    "Total_CO",
    "Buses_ME",
    "Total_ME",
    "Buses_Grand_Total",   
    "Grand Total"
  ];

  return data.map(originalObject => {
    const newObject = {};
    desiredKeys.forEach(key => {
      if (originalObject.hasOwnProperty(key)) {
        newObject[key] = originalObject[key];
      }
    });
    return newObject;
  });
};

export default function ForecastForm() {
  const [keys, setKeys] = useState([]);
  const [formData, setFormData] = useState({
    df_key: 'ALL',
    forecast_days: 7
  });
  const [forecastResult, setForecastResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchKeys = async () => {
      try {
        const response = await fetch('/api/forecast');
        if (!response.ok) throw new Error('Failed to fetch initial data');
        const data = await response.json();
        setKeys(data.keys || []);
      } catch (error) {
        console.error('Error fetching keys:', error);
        setError(error.message);
      }
    };
    fetchKeys();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setForecastResult(null);
    setError(null);

    try {
      const response = await fetch('/api/forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          start_date: "2023-12-01", // Hardcoded start date
          end_date: "2024-12-31"    // Hardcoded end date
        })
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`);
      }
      setForecastResult(result);
    } catch (error) {
      console.error('Error fetching forecast:', error);
      setError(error.message || 'Failed to fetch forecast data');
      setForecastResult(null);
    } finally {
      setLoading(false);
    }
  };

  const processedCombinedTableData = useMemo(() => {
    if (forecastResult && Array.isArray(forecastResult.combined_table)) {
      return transformCombinedTableData(forecastResult.combined_table);
    }
    return [];
  }, [forecastResult]);

  const combinedResultsTable = useMemo(() => {
    if (forecastResult && forecastResult.results) {
      return transformResultsData(forecastResult.results);
    }
    return null;
  }, [forecastResult]);

  return (
    <div className="mx-auto p-6 bg-gray-50 rounded-lg shadow-md">
      {/* Horizontal Nav Bar Style Form */}
      <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
        <h1 className="text-xl font-bold mb-4 text-gray-800">Forecast Parameters</h1>
        <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-4">
          <div className="min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Key</label>
            <select
              name="df_key"
              value={formData.df_key}
              onChange={handleChange}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border"
            >
              <option value="ALL">ALL</option>
              {keys.map(key => (
                <option key={key} value={key}>{key}</option>
              ))}
            </select>
          </div>
          
          <div className="min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Forecast Days</label>
            <input
              type="number"
              name="forecast_days"
              value={formData.forecast_days}
              onChange={handleChange}
              min="1"
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border p-2"
              required
            />
          </div>
          
          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="h-[42px] flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 transition duration-150"
            >
              {loading ? 'Processing...' : 'Run Forecast'}
            </button>
          </div>
        </form>
      </div>

      {/* Results Section */}
      <div>
        <h2 className="text-xl font-bold mb-6 text-gray-800">Forecast Results</h2>

        {loading && (
          <div className="p-6 bg-white rounded-lg shadow-sm border text-center">
            <p className="text-indigo-600">Loading forecast data, please wait...</p>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-md bg-red-100 text-red-800 border border-red-300">
            <h3 className="font-bold">Error</h3>
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && forecastResult && (
          <div className="space-y-6">
            {combinedResultsTable && combinedResultsTable.length > 0 ? (
              <DataTable
                title="Number of passangers based on ticket type and service type"
                data={combinedResultsTable}
              />
            ) : (
              forecastResult.results && forecastResult.results.length === 0 ? 
              <p className="text-gray-500">No detailed results data available for combining.</p> : null
            )}

            <DataTable title="Number of passangers based on ticket type" data={forecastResult.grouped_summary_table} />

            <DataTable title="Number of passengers based on buses and service type" data={processedCombinedTableData} />

            {processedCombinedTableData.length > 0 && (
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <h3 className="text-lg font-medium mb-4">Daily Bus Counts & Passenger Totals</h3>
                <div className="h-96">
                  <Line
                    data={{
                      labels: processedCombinedTableData.map(item => {
                        const date = new Date(item.Date);
                        return isNaN(date.getTime()) ? item.Date : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                      }),
                      datasets: [
                        {
                          type: 'line',
                          label: 'Buses_0_',
                          data: processedCombinedTableData.map(item => item.Buses_0_ || 0),
                          borderColor: 'rgba(255, 159, 64, 1)',
                          backgroundColor: 'rgba(255, 159, 64, 0.2)',
                          fill: true,
                          tension: 0.1,
                          borderWidth: 2,
                          yAxisID: 'yBuses',
                          pointRadius: 2,
                          pointHoverRadius: 4,
                          order: 0
                        },
                        {
                          type: 'bar',
                          label: 'Total_0_ Passengers',
                          data: processedCombinedTableData.map(item => item.Total_0_ || 0),
                          backgroundColor: 'rgba(255, 159, 64, 0.7)',
                          borderColor: 'rgba(255, 159, 64, 1)',
                          borderWidth: 1,
                          yAxisID: 'yPassengers',
                          barPercentage: 0.7,
                          categoryPercentage: 0.6,
                          order: 1
                        },
                        {
                          type: 'line',
                          label: 'Buses_CO',
                          data: processedCombinedTableData.map(item => item.Buses_CO || 0),
                          borderColor: 'rgba(100, 100, 255, 1)',
                          backgroundColor: 'rgba(100, 100, 255, 0.2)',
                          fill: true,
                          tension: 0.1,
                          borderWidth: 2,
                          yAxisID: 'yBuses',
                          pointRadius: 2,
                          pointHoverRadius: 4,
                          order: 0
                        },
                        {
                          type: 'bar',
                          label: 'Total_CO Passengers',
                          data: processedCombinedTableData.map(item => item.Total_CO || 0),
                          backgroundColor: 'rgba(100, 100, 255, 0.7)',
                          borderColor: 'rgba(100, 100, 255, 1)',
                          borderWidth: 1,
                          yAxisID: 'yPassengers',
                          barPercentage: 0.7,
                          categoryPercentage: 0.6,
                          order: 1
                        },
                        {
                          type: 'line',
                          label: 'Buses_ME',
                          data: processedCombinedTableData.map(item => item.Buses_ME || 0),
                          borderColor: 'rgba(153, 102, 255, 1)',
                          backgroundColor: 'rgba(153, 102, 255, 0.2)',
                          fill: true,
                          tension: 0.1,
                          borderWidth: 2,
                          yAxisID: 'yBuses',
                          pointRadius: 2,
                          pointHoverRadius: 4,
                          order: 0
                        },
                        {
                          type: 'bar',
                          label: 'Total_ME Passengers',
                          data: processedCombinedTableData.map(item => item.Total_ME || 0),
                          backgroundColor: 'rgba(153, 102, 255, 0.7)',
                          borderColor: 'rgba(153, 102, 255, 1)',
                          borderWidth: 1,
                          yAxisID: 'yPassengers',
                          barPercentage: 0.7,
                          categoryPercentage: 0.6,
                          order: 1
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      interaction: {
                        mode: 'index',
                        intersect: false,
                      },
                      plugins: {
                        legend: {
                          position: 'top',
                        },
                        title: {
                          display: true,
                          text: 'Daily Bus Counts and Passenger Totals',
                        },
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              let label = context.dataset.label || '';
                              if (label) {
                                label += ': ';
                              }
                              if (context.parsed.y !== null) {
                                label += context.parsed.y;
                              }
                              return label;
                            }
                          }
                        }
                      },
                      scales: {
                        x: {},
                        yBuses: {
                          type: 'linear',
                          display: true,
                          position: 'left',
                          beginAtZero: true,
                          title: {
                            display: true,
                            text: 'Number of Buses',
                            font: {
                              size: 14
                            }
                          },
                          grid: {
                            drawOnChartArea: true,
                          }
                        },
                        yPassengers: {
                          type: 'linear',
                          display: true,
                          position: 'right',
                          beginAtZero: true,
                          title: {
                            display: true,
                            text: 'Number of Passengers',
                            font: {
                              size: 14
                            }
                          },
                          grid: {
                            drawOnChartArea: false,
                          },
                        }
                      },
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}