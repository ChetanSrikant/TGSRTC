export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-gray-600">Loading dashboard data...</p>
    </div>
  );
}