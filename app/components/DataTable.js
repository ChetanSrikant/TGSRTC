// components/DataTable.js (or place it in the same file if preferred)
'use client';

export default function DataTable({ title, data }) {
  // Don't render anything if data is missing, not an array, or empty
  if (!data || !Array.isArray(data) || data.length === 0) {
    return null;
  }

  // Get table headers from the keys of the first object
  const headers = Object.keys(data[0]);

  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white">
      <h2 className="text-lg font-semibold mb-3 text-gray-800">{title}</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border">
          <thead className="bg-gray-50">
            <tr>
              {headers.map((header) => (
                <th
                  key={header}
                  scope="col"
                  className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-l"
                >
                  {header.replace(/_/g, ' ')} {/* Make headers more readable */}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50">
                {headers.map((header) => (
                  <td key={`${rowIndex}-${header}`} className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 border-l">
                    {/* Check for objects/arrays and stringify them, otherwise display directly */}
                    {typeof row[header] === 'object' && row[header] !== null
                      ? JSON.stringify(row[header])
                      : row[header]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
       {/* Optional: Show row count */}
       <p className="text-xs text-gray-500 mt-2">{data.length} rows</p>
    </div>
  );
}