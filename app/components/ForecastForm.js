// 'use client';
// import { useState, useEffect, useMemo } from 'react';
// import DataTable from './DataTable'; // Adjust path if needed

// // This function transforms the 'results' array into a date-keyed object array
// const transformResultsData = (resultsData) => {
//   if (!resultsData || !Array.isArray(resultsData)) {
//     return [];
//   }
//   const dataByDate = {};
//   resultsData.forEach(item => {
//     const key = item.key;
//     if (!item.table || !Array.isArray(item.table)) return;
//     item.table.forEach(row => {
//       const date = row["Date"];
//       const passengers = row["No Of Passengers"]; // Key from your JSON example
//       if (!dataByDate[date]) {
//         dataByDate[date] = { "Date": date };
//       }
//       dataByDate[date][key] = passengers;
//     });
//   });
//   const transformedArray = Object.values(dataByDate);
//   transformedArray.sort((a, b) => new Date(a.Date) - new Date(b.Date));
//   return transformedArray;
// };

// // Helper function to generate table configurations dynamically
// const generateTableConfigs = (forecastResult) => {
//   if (!forecastResult) return [];
//   const configs = [];

//   Object.entries(forecastResult).forEach(([key, value]) => {
//     if (key === "results") {
//       // Special handling for the 'results' key
//       const transformedData = transformResultsData(value);
//       if (transformedData && transformedData.length > 0) {
//         configs.push({ id: key, title: key, data: transformedData });
//       }
//     } else if (Array.isArray(value) && value.every(item => typeof item === 'object' && item !== null)) {
//       // Value is a direct array of objects (a table)
//       if (value.length > 0) { // Only add if there's data
//         configs.push({ id: key, title: key, data: value });
//       } else {
//         // Optionally, you could add configuration for an empty table:
//         // configs.push({ id: key, title: `${key} (empty)`, data: [] });
//       }
//     } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
//       // Value is an object, potentially containing sub-tables (like 'december_data' or 'forecasts')
//       Object.entries(value).forEach(([subKey, subValue]) => {
//         if (Array.isArray(subValue) && subValue.every(item => typeof item === 'object' && item !== null)) {
//           if (subValue.length > 0) { // Only add if there's data in the sub-table
//             configs.push({ id: `${key}-${subKey}`, title: `${key} - ${subKey}`, data: subValue });
//           } else {
//             // Optionally, add config for an empty sub-table:
//             // configs.push({ id: `${key}-${subKey}`, title: `${key} - ${subKey} (empty)`, data: [] });
//           }
//         }
//       });
//     }
//   });
//   return configs;
// };


// export default function ForecastForm() {
//   const [keys, setKeys] = useState([]); // Keys for the dropdown
//   const [formData, setFormData] = useState({
//     df_key: 'ALL',
//     forecast_days: 7
//   });
//   const [forecastResult, setForecastResult] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     // Fetch keys for the dropdown (e.g., different forecast models or data series)
//     const fetchKeys = async () => {
//       try {
//         const response = await fetch('/api/forecast'); // Adjust if your key-fetching API is different
//         if (!response.ok) throw new Error('Failed to fetch initial data for keys');
//         const data = await response.json();
//         setKeys(data.keys || []); // Assuming API returns { keys: [...] }
//       } catch (error) {
//         console.error('Error fetching keys:', error);
//       }
//     };
//     fetchKeys();
//   }, []);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setForecastResult(null);
//     setError(null);

//     try {
//       const response = await fetch('/api/forecast', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           ...formData,
//           start_date: "2023-12-01", // Example hardcoded dates
//           end_date: "2024-12-31"
//         })
//       });
//       const result = await response.json();
//       if (!response.ok) {
//         throw new Error(result.error || `HTTP error! status: ${response.status}`);
//       }
//       setForecastResult(result);
//     } catch (error) {
//       console.error('Error fetching forecast:', error);
//       setError(error.message || 'Failed to fetch forecast data');
//       setForecastResult(null);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Generate table configurations based on the forecastResult
//   const tableConfigs = useMemo(() => {
//     if (forecastResult) {
//       return generateTableConfigs(forecastResult);
//     }
//     return [];
//   }, [forecastResult]);

//   return (
//     <div className="mx-auto p-6 bg-gray-50 rounded-lg shadow-md">
//       {/* Horizontal Nav Bar Style Form */}
//       <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
//         <h1 className="text-xl font-bold mb-4 text-gray-800">Forecast Parameters</h1>
//         <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-4">
//           <div className="min-w-[200px]">
//             <label className="block text-sm font-medium text-gray-700 mb-1">Key</label>
//             <select
//               name="df_key"
//               value={formData.df_key}
//               onChange={handleChange}
//               className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border"
//             >
//               <option value="ALL">ALL</option>
//               {keys.map(key => (
//                 <option key={key} value={key}>{key}</option>
//               ))}
//             </select>
//           </div>

//           <div className="min-w-[200px]">
//             <label className="block text-sm font-medium text-gray-700 mb-1">Forecast Days</label>
//             <input
//               type="number"
//               name="forecast_days"
//               value={formData.forecast_days}
//               onChange={handleChange}
//               min="1"
//               className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border p-2"
//               required
//             />
//           </div>

//           <div className="flex items-end">
//             <button
//               type="submit"
//               disabled={loading}
//               className="h-[42px] flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 transition duration-150"
//             >
//               {loading ? 'Processing...' : 'Run Forecast'}
//             </button>
//           </div>
//         </form>
//       </div>

//       {/* Results Section */}
//       <div>
//         <h2 className="text-xl font-bold mb-6 text-gray-800">Forecast Results</h2>

//         {loading && (
//           <div className="p-6 bg-white rounded-lg shadow-sm border text-center">
//             <p className="text-indigo-600">Loading forecast data, please wait...</p>
//           </div>
//         )}

//         {error && (
//           <div className="p-4 rounded-md bg-red-100 text-red-800 border border-red-300">
//             <h3 className="font-bold">Error</h3>
//             <p>{error}</p>
//           </div>
//         )}

//         {!loading && !error && forecastResult && (
//           <div className="space-y-8"> {/* Increased spacing between tables */}
//             {tableConfigs.length > 0 ? (
//               tableConfigs.map(config => (
//                 <DataTable key={config.id} title={config.title} data={config.data} />
//               ))
//             ) : (
//               <p className="text-gray-500">No tabular data found in the forecast result.</p>
//             )}
//           </div>
//         )}
//       </div>
//       {/* <div className="mt-6">
//         <h3 className="text-lg font-medium mb-2">Raw JSON</h3>
//         <pre className="p-4 rounded-md overflow-x-auto text-sm bg-gray-800 text-white">
//           {JSON.stringify(forecastResult, null, 2)}
//         </pre>
//       </div> */}
//     </div>
//   );
// }