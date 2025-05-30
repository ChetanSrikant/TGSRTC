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
// --- 1. Existing Transformation Function (for the third table, "Results") ---
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
// --- End of Existing Transformation Function ---

// +++ START OF NEW CODE FOR FIRST TABLE TRANSFORMATION +++
// --- Transformation Function for the "Combined Table" (First Table) ---
const transformCombinedTableData = (data) => {
  if (!data || !Array.isArray(data)) {
    return []; // Return empty array if data is not as expected
  }

  const desiredKeys = [
    "Date",
    "Buses_0_",
    "Buses_CO",
    "Buses_ME",
    "Buses_Grand_Total",    
    "Total_0_",
    "Total_CO",
    "Total_ME",
    "Grand Total"
  ];

  return data.map(originalObject => {
    const newObject = {};
    desiredKeys.forEach(key => {
      // Only add the key if it exists in the original object
      // If a key from desiredKeys is missing, it won't be in newObject.
      // The DataTable component will likely render an empty cell for it.
      if (originalObject.hasOwnProperty(key)) {
        newObject[key] = originalObject[key];
      }
    });
    return newObject;
  });
};
// --- End of New Transformation Function ---
// +++ END OF NEW CODE FOR FIRST TABLE TRANSFORMATION +++


export default function ForecastForm() {
  const [keys, setKeys] = useState([]);
  const [formData, setFormData] = useState({
    df_key: 'ALL',
    start_date: '',
    end_date: '',
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
        setFormData(prev => ({
          ...prev,
          start_date: formatDateForInput(data.default_start),
          end_date: formatDateForInput(data.default_end)
        }));
      } catch (error) {
        console.error('Error fetching keys:', error);
        setError(error.message);
      }
    };
    fetchKeys();
  }, []);

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    } catch(e) {
        return dateString;
    }
  };

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
        body: JSON.stringify(formData)
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

  // --- Memoize transformation for the "Combined Table" (First Table) ---
  const processedCombinedTableData = useMemo(() => {
    if (forecastResult && Array.isArray(forecastResult.combined_table)) {
      return transformCombinedTableData(forecastResult.combined_table);
    }
    return []; // Return an empty array if data is not available or not an array
  }, [forecastResult]);
  // --- End of memoization for the first table ---

  // --- Memoize transformation for the "Results" table (Third Table) ---
  const combinedResultsTable = useMemo(() => { // This was your existing one
    if (forecastResult && forecastResult.results) {
      return transformResultsData(forecastResult.results);
    }
    return null; // Or [] if DataTable prefers an array
  }, [forecastResult]);
  // --- End of useMemo ---

  return (
    <div className=" mx-auto p-6 bg-gray-50 rounded-lg shadow-md">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Form Section */}
        <div className="md:col-span-1 bg-white p-6 rounded-lg shadow-sm border">
          <h1 className="text-xl font-bold mb-6 text-gray-800">Forecast Parameters</h1>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700">Key</label>
              <select
                name="df_key"
                value={formData.df_key}
                onChange={handleChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border"
              >
                <option value="ALL">ALL</option>
                {keys.map(key => (
                  <option key={key} value={key}>{key}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Date</label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border p-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End Date</label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border p-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Forecast Days</label>
              <input
                type="number"
                name="forecast_days"
                value={formData.forecast_days}
                onChange={handleChange}
                min="1"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border p-2"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 transition duration-150"
            >
              {loading ? 'Processing...' : 'Run Forecast'}
            </button>
          </form>
        </div>

        {/* Results Section */}
        <div className="md:col-span-3">
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
                  title="Number of passangers based on ticket type"
                  data={combinedResultsTable}
                />
              ) : (
                forecastResult.results && forecastResult.results.length === 0 ? 
                <p className="text-gray-500">No detailed results data available for combining.</p> : null
              )}

              <DataTable title="Number of passangers based on service type" data={forecastResult.grouped_summary_table} />

              <DataTable title="Combined Table" data={processedCombinedTableData} />

              {/* === MODIFIED CHART SECTION: Mixed Line and Bar Chart === */}
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
                          // --- Line Datasets (Bus Counts) ---
                          {
                            type: 'line',
                            label: 'Buses_0_',
                            data: processedCombinedTableData.map(item => item.Buses_0_ || 0),
                            borderColor: 'rgba(255, 99, 132, 1)',
                            backgroundColor: 'rgba(255, 99, 132, 0.2)',
                            fill: true,
                            tension: 0.1,
                            borderWidth: 2,
                            yAxisID: 'yBuses',
                            pointRadius: 2,
                            pointHoverRadius: 4
                          },
                          {
                            type: 'line',
                            label: 'Buses_CO',
                            data: processedCombinedTableData.map(item => item.Buses_CO || 0),
                            borderColor: 'rgba(54, 162, 235, 1)',
                            backgroundColor: 'rgba(54, 162, 235, 0.2)',
                            fill: true,
                            tension: 0.1,
                            borderWidth: 2,
                            yAxisID: 'yBuses',
                            pointRadius: 2,
                            pointHoverRadius: 4
                          },
                          {
                            type: 'line',
                            label: 'Buses_ME',
                            data: processedCombinedTableData.map(item => item.Buses_ME || 0),
                            borderColor: 'rgba(75, 192, 192, 1)',
                            backgroundColor: 'rgba(75, 192, 192, 0.2)',
                            fill: true,
                            tension: 0.1,
                            borderWidth: 2,
                            yAxisID: 'yBuses',
                            pointRadius: 2,
                            pointHoverRadius: 4
                          },
                          // --- Bar Datasets (Passenger Totals) ---
                          {
                            type: 'bar',
                            label: 'Total_0_ Passengers',
                            data: processedCombinedTableData.map(item => item.Total_0_ || 0),
                            backgroundColor: 'rgba(255, 159, 64, 0.7)',
                            borderColor: 'rgba(255, 159, 64, 1)',
                            borderWidth: 1,
                            yAxisID: 'yPassengers',
                            barPercentage: 0.7,
                            categoryPercentage: 0.6
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
                            categoryPercentage: 0.6
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
                            categoryPercentage: 0.6
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
                          x: {
                            // Labels are already formatted above
                          },
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
              {/* === END OF MODIFIED CHART SECTION === */}
              
              {/* Raw JSON section ... (remains the same) */}

              {/* <div className="mt-6">
                <h3 className="text-lg font-medium mb-2">Raw JSON</h3>
                <pre className="p-4 rounded-md overflow-x-auto text-sm bg-gray-800 text-white">
                  {JSON.stringify(forecastResult, null, 2)}
                </pre>
              </div> */}

            </div>
          )}

          {/* Fallback UI ... (remains the same) */}
        </div>
      </div>
    </div>
  );
}