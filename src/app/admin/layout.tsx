import Link from 'next/link';
import { LayoutDashboard, Database, Users } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col md:flex-row bg-slate-950">
      {/* Admin Navigation Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900/60 border-r border-slate-800 p-6 space-y-6">
        <div className="text-xs font-bold uppercase tracking-wider text-teal-400">
          Admin Dashboard
        </div>
        <nav className="space-y-1 text-sm font-medium">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-slate-100 transition"
          >
            <LayoutDashboard className="w-4 h-4 text-teal-400" /> Overview
          </Link>
          <Link
            href="/admin/aniimo"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-slate-100 transition"
          >
            <Database className="w-4 h-4 text-teal-400" /> Manage Aniimo
          </Link>
          <Link
            href="/admin/teams"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-slate-100 transition"
          >
            <Users className="w-4 h-4 text-teal-400" /> Manage Teams
          </Link>
        </nav>
      </aside>

      {/* Main Admin Content Area */}
      <main className="flex-1 p-6 md:p-10">{children}</main>
    </div>
  );
}