'use client';
import { useState, useEffect } from 'react';
import DataTable from './DataTable'; // Adjust path if needed

export default function ForecastForm() {
  const [keys, setKeys] = useState([]);
  const [formData, setFormData] = useState({
    df_key: 'ALL',
    start_date: '', // Initialize as empty, let useEffect set it
    end_date: '',   // Initialize as empty, let useEffect set it
    forecast_days: 7
  });
  const [forecastResult, setForecastResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // Dedicated error state

  // Fetch available keys and default dates
  useEffect(() => {
    const fetchKeys = async () => {
      try {
        const response = await fetch('/api/forecast');
        if (!response.ok) throw new Error('Failed to fetch initial data');
        const data = await response.json();
        setKeys(data.keys || []); // Ensure keys is an array
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

  // Helper to format date for <input type="date">
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString; // Fallback
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    } catch(e) {
        return dateString; // Fallback on parsing error
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
    setForecastResult(null); // Clear previous results
    setError(null);         // Clear previous errors

    try {
      const response = await fetch('/api/forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData) // Send formData directly (ensure API handles yyyy-mm-dd)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`);
      }

      setForecastResult(result);

    } catch (error) {
      console.error('Error fetching forecast:', error);
      setError(error.message || 'Failed to fetch forecast data');
      setForecastResult(null); // Ensure no results show on error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 rounded-lg shadow-md">
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
                {/* You could add a spinner here */}
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
              {/* Display the three tables */}
              <DataTable title="Combined Table" data={forecastResult.combined_table} />
              <DataTable title="Grouped Summary Table" data={forecastResult.grouped_summary_table} />
              <DataTable title="Results" data={forecastResult.results} />

               {/* You can still show the raw JSON if needed */}
               {/*
               <div className="mt-6">
                 <h3 className="text-lg font-medium mb-2">Raw JSON</h3>
                 <pre className="p-4 rounded-md overflow-x-auto text-sm bg-gray-800 text-white">
                   {JSON.stringify(forecastResult, null, 2)}
                 </pre>
               </div>
               */}
            </div>
          )}

          {!loading && !error && !forecastResult && (
             <div className="p-6 bg-white rounded-lg shadow-sm border text-center">
                <p className="text-gray-500">Submit the form to see the forecast results here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}