'use client';

export default function ChartWrapper({ title, children }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-lg font-semibold mb-4 text-gray-700">{title}</h2>
      <div className="h-64">
        {children || (
          <div className="h-full flex items-center justify-center text-gray-500">
            No data available
          </div>
        )}
      </div>
    </div>
  );
}