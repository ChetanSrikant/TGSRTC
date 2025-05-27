// app/dashboard/components/NavBar.js
import Link from 'next/link';

export default function NavBar() {
  return (
    <nav className="bg-blue-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="font-bold text-xl">TGSRTC</div>
        <div className="flex space-x-6">
          <Link href="/dashboard" className="hover:underline">Dashboard</Link>
          <Link href="/reports" className="hover:underline">Reports</Link>
          <Link href="/analytics" className="hover:underline">Analytics</Link>
          <Link href="/settings" className="hover:underline">Settings</Link>
        </div>
      </div>
    </nav>
  );
}