// components/GroupedCombinedTable.js
'use client';

export default function GroupedCombinedTable({ title, rawData }) {
  // Don't render if data is missing or not an array
  if (!rawData || !Array.isArray(rawData) || rawData.length === 0) {
    return null;
  }

  // Group the data by 'DATAFRAME'
  const groupedData = rawData.reduce((acc, item) => {
    const key = item.DATAFRAME;
    if (!acc[key]) {
      acc[key] = [];
    }
    // Push only the relevant parts for the sub-table
    acc[key].push({
      DATE: item.DATE,
      'NO OF PASSENGERS': item['NO OF PASSENGERS'],
    });
    return acc;
  }, {});

  // Get the headers for the inner tables (DATE, NO OF PASSENGERS)
  const innerHeaders = ['DATE', 'NO OF PASSENGERS'];

  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">{title}</h2>
      <div className="space-y-6"> {/* Add space between each group */}
        {Object.keys(groupedData).map((dataframeKey) => (
          <div key={dataframeKey} className="p-3 border rounded-md bg-gray-50">
            <h3 className="text-md font-medium mb-2 text-indigo-700">{dataframeKey}</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-300 border bg-white">
                <thead className="bg-gray-100">
                  <tr>
                    {innerHeaders.map((header) => (
                      <th
                        key={header}
                        scope="col"
                        className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider border-l"
                      >
                        {header.replace(/_/g, ' ')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {groupedData[dataframeKey].map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-gray-50">
                      {innerHeaders.map((header) => (
                        <td key={`${rowIndex}-${header}`} className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 border-l">
                           {row[header]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}