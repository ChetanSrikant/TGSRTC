'use client';
  import { useState, useEffect, useMemo } from 'react';
  import DataTable from '../components/DataTable';
  import Sidebar from '../components/Sidebar';
  import { Bar } from 'react-chartjs-2';
  import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
  } from 'chart.js';

  // Register ChartJS components
  ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
  );

  // Beautiful color palette
  const COLOR_PALETTE = [
    '#4E79A7', // Soft blue
    '#F28E2B', // Warm orange
    '#E15759', // Coral red
    '#76B7B2', // Teal
    '#59A14F', // Green
    '#EDC948', // Gold
    '#B07AA1', // Lavender
    '#FF9DA7', // Pink
    '#9C755F', // Brown
    '#BAB0AC', // Gray
  ];

  const transformResultsData = (resultsData) => {
    if (!resultsData || !Array.isArray(resultsData)) return [];

    const dataByDate = {};
    resultsData.forEach(item => {
      const key = item.key;
      if (!item.table || !Array.isArray(item.table)) return;
      item.table.forEach(row => {
        const date = row["Date"];
        const passengers = row["No Of Passengers"];
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

  const prepareChartData = (resultsData) => {
    if (!resultsData || resultsData.length === 0) return null;

    // Get all unique keys (excluding Date)
    const keys = Array.from(new Set(
      resultsData.flatMap(item => 
        Object.keys(item).filter(key => key !== 'Date')
      )
    ));

    const labels = resultsData.map(item => item.Date);
    const datasets = keys.map((key, index) => ({
      label: key,
      data: resultsData.map(item => item[key] || 0),
      backgroundColor: COLOR_PALETTE[index % COLOR_PALETTE.length],
      borderColor: COLOR_PALETTE[index % COLOR_PALETTE.length],
      borderWidth: 1,
      borderRadius: 4, // Rounded corners for bars
      hoverBackgroundColor: `${COLOR_PALETTE[index % COLOR_PALETTE.length]}CC`, // Slightly transparent on hover
      hoverBorderColor: COLOR_PALETTE[index % COLOR_PALETTE.length],
    }));

    return {
      labels,
      datasets,
    };
  };

  const generateTableConfigs = (forecastResult, df_key) => {
    if (!forecastResult) return [];

    const desiredTablesForAll = [
      "combined_table",
      "grouped_results_by_prefix_table",
      "grouped_summary_table",
      "results"
    ];

    const configs = [];
    
    if (forecastResult.results && (df_key === "ALL" || desiredTablesForAll.includes("results"))) {
      const transformedData = transformResultsData(forecastResult.results);
      if (transformedData.length > 0) {
        configs.push({ 
          id: "results", 
          title: "results", 
          data: transformedData,
          chartData: prepareChartData(transformedData) 
        });
      }
    }

    Object.entries(forecastResult).forEach(([key, value]) => {
      if (key === "results") return;
      
      if (df_key === "ALL" && !desiredTablesForAll.includes(key)) return;
      
      if (Array.isArray(value) && value.every(item => typeof item === 'object' && item !== null)) {
        if (value.length > 0) {
          configs.push({ id: key, title: key, data: value });
        }
      } else if (typeof value === 'object' && value !== null) {
        Object.entries(value).forEach(([subKey, subValue]) => {
          if (Array.isArray(subValue) && subValue.every(item => typeof item === 'object')) {
            if (subValue.length > 0) {
              configs.push({ id: `${key}-${subKey}`, title: `${key} - ${subKey}`, data: subValue });
            }
          }
        });
      }
    });

    return configs;
  };

  export default function Page49m() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const toggleSidebar = () => setSidebarOpen(prev => !prev);

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
          if (!response.ok) throw new Error('Failed to fetch initial data for keys');
          const data = await response.json();
          setKeys(data.keys || []);
        } catch (error) {
          console.error('Error fetching keys:', error);
        }
      };
      fetchKeys();
    }, []);

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
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
            start_date: "2023-12-01",
            end_date: "2024-12-31"
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

    const tableConfigs = useMemo(() => {
      return generateTableConfigs(forecastResult, formData.df_key);
    }, [forecastResult, formData.df_key]);

    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

        <main className="flex-grow p-6 flex flex-col bg-gray-50 overflow-y-auto">
          <button
            className="mb-4 self-start px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
            onClick={toggleSidebar}
          >
            {sidebarOpen ? 'Hide Menu' : 'Show Menu'}
          </button>

          <div className="bg-white p-4 rounded-lg shadow-sm border mb-6 flex-shrink-0">
            <h1 className="text-xl font-bold mb-4 text-gray-800">Forecast Parameters for 49m Route</h1>
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

          <div className="flex-grow">
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
              <div className="space-y-8">
                {tableConfigs.length > 0 ? (
                  tableConfigs.map(config => (
                    <div key={config.id} className="space-y-4">
                      <h3 className="text-lg font-semibold">{config.title}</h3>
                      <DataTable data={config.data} />
                      {config.chartData && (
                        <div className="bg-white p-4 rounded-lg shadow-sm border">
                          <Bar
                            data={config.chartData}
                            options={{
                              responsive: true,
                              plugins: {
                                legend: { position: 'top' },
                                title: {
                                  display: true,
                                  text: `${config.title} Visualization`,
                                },
                              },
                              scales: {
                                y: {
                                  beginAtZero: true,
                                  title: {
                                    display: true,
                                    text: 'Number of Passengers',
                                  },
                                },
                                x: {
                                  title: {
                                    display: true,
                                    text: 'Date',
                                  },
                                },
                              },
                            }}
                          />
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No tabular data found in the forecast result.</p>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }