'use client';
import { useState, useEffect, useMemo } from 'react';
import DataTable from '../components/DataTable';
import Sidebar from '../components/Sidebar';

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

const generateTableConfigs = (forecastResult) => {
  if (!forecastResult) return [];
  const configs = [];

  Object.entries(forecastResult).forEach(([key, value]) => {
    if (key === "results") {
      const transformedData = transformResultsData(value);
      if (transformedData && transformedData.length > 0) {
        configs.push({ id: key, title: key, data: transformedData });
      }
    } else if (Array.isArray(value) && value.every(item => typeof item === 'object' && item !== null)) {
      if (value.length > 0) {
        configs.push({ id: key, title: key, data: value });
      }
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.entries(value).forEach(([subKey, subValue]) => {
        if (Array.isArray(subValue) && subValue.every(item => typeof item === 'object' && item !== null)) {
          if (subValue.length > 0) {
            configs.push({ id: `${key}-${subKey}`, title: `${key} - ${subKey}`, data: subValue });
          }
        }
      });
    }
  });
  return configs;
};

export default function PageKeys3() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(prev => !prev);

  const [keys, setKeys] = useState([]);
  const [defaultDates, setDefaultDates] = useState({
    start_date: '',
    end_date: ''
  });
  const [selectedKey, setSelectedKey] = useState('');
  const [forecastResult, setForecastResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch keys and set default dates on mount
  useEffect(() => {
    const fetchKeys = async () => {
      try {
        const response = await fetch('/api/keys3');
        if (!response.ok) throw new Error('Failed to fetch keys');
        const data = await response.json();
        setKeys(data.keys || []);
        
        // Set first key as default if available
        if (data.keys && data.keys.length > 0) {
          setSelectedKey(data.keys[0]);
        }
        
        // Store default dates
        setDefaultDates({
          start_date: data.default_start || '2023-12-01',
          end_date: data.default_end || '2024-12-31'
        });
      } catch (error) {
        console.error('Error fetching keys:', error);
        setError(error.message);
      }
    };
    fetchKeys();
  }, []);

  const handleKeyChange = (e) => {
    setSelectedKey(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedKey) return;
    
    setLoading(true);
    setForecastResult(null);
    setError(null);
    try {
      const response = await fetch('/api/forecast3', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: selectedKey,
          start: defaultDates.start_date,
          end: defaultDates.end_date
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
    } finally {
      setLoading(false);
    }
  };

  const tableConfigs = useMemo(() => {
    if (forecastResult) {
      return generateTableConfigs(forecastResult);
    }
    return [];
  }, [forecastResult]);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sticky Sidebar */}
      {/* <div className="sticky top-0 h-screen overflow-y-auto"> */}
        <Sidebar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      {/* </div> */}

      {/* Main Content */}
      <main className="flex-grow p-6 bg-gray-50 overflow-y-auto">
        {/* Forecast Form */}
        <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
          <h1 className="text-xl font-bold mb-4 text-gray-800">OPRS route</h1>
          <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-4">
            <div className="min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Key</label>
              <select
                name="key"
                value={selectedKey}
                onChange={handleKeyChange}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border"
                required
                disabled={keys.length === 0}
              >
                {keys.length === 0 ? (
                  <option value="">Loading keys...</option>
                ) : (
                  keys.map(key => (
                    <option key={key} value={key}>{key}</option>
                  ))
                )}
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading || keys.length === 0}
                className="h-[42px] flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 transition duration-150"
              >
                {loading ? 'Processing...' : 'Run Forecast'}
              </button>
            </div>
          </form>
        </div>

        {/* Forecast Results */}
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
            <div className="space-y-8">
              {tableConfigs.length > 0 ? (
                tableConfigs.map(config => (
                  <DataTable key={config.id} title={config.title} data={config.data} />
                ))
              ) : (
                <p className="text-gray-500">No tabular data found in the forecast result.</p>
              )}
            </div>
          )}
        </div>
      {/* <div className="mt-6">Add commentMore actions
          <h3 className="text-lg font-medium mb-2">Raw JSON</h3>
          <pre className="p-4 rounded-md overflow-x-auto text-sm bg-gray-800 text-white">
            {JSON.stringify(forecastResult, null, 2)}
          </pre>
        </div> */}
      </main>
    </div>
  );
}