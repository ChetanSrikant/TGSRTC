// components/Sidebar.js
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const routes = [
    { id: '49m_route', name: '49m Route' },
    { id: 'oprs', name: 'OPRS' },
    { id: 'wrl_uppal', name: 'WRL Uppal' }
  ];

  return (
    <div className={`bg-indigo-800 text-white transition-all duration-300 ease-in-out 
      ${sidebarOpen ? 'w-64' : 'w-20'} flex-shrink-0`}
    >
      <div className="p-4 flex items-center justify-between">
        {sidebarOpen && <h2 className="text-xl font-bold">Routes</h2>}
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg hover:bg-indigo-700"
        >
          {sidebarOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
        </button>
      </div>
      
      <nav className="mt-6">
        <ul>
          {routes.map((route) => (
            <li key={route.id} className="mb-2">
              <Link
                href={`/${route.id}`}
                className={`w-full text-left py-3 px-4 flex items-center 
                  ${pathname.includes(route.id) ? 'bg-indigo-900' : 'hover:bg-indigo-700'}
                  transition-colors duration-200`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
                {sidebarOpen && <span className="ml-3">{route.name}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}