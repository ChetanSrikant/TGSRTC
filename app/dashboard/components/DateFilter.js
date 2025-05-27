'use client';

import { useRouter } from 'next/navigation';

export default function DateFilter({ startDate, endDate }) {
  const router = useRouter();

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    const params = new URLSearchParams();
    params.set('start', name === 'start' ? value : startDate);
    params.set('end', name === 'end' ? value : endDate);
    router.push(`/dashboard?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-col">
        <label htmlFor="start" className="text-xs text-gray-500 mb-1">From</label>
        <input
          type="date"
          id="start"
          name="start"
          value={startDate}
          onChange={handleDateChange}
          className="border p-2 rounded text-sm"
          max={endDate}
        />
      </div>
      <span className="mt-5">-</span>
      <div className="flex flex-col">
        <label htmlFor="end" className="text-xs text-gray-500 mb-1">To</label>
        <input
          type="date"
          id="end"
          name="end"
          value={endDate}
          onChange={handleDateChange}
          className="border p-2 rounded text-sm"
          min={startDate}
          max={new Date().toISOString().split('T')[0]}
        />
      </div>
    </div>
  );
}