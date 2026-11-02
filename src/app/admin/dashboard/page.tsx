import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Database, Users, Plus, FileEdit } from 'lucide-react';

async function DashboardStats() {
  const supabase = await createClient();

  const { count: aniimoCount } = await supabase.from('aniimo').select('*', { count: 'exact', head: true });
  const { count: teamsCount } = await supabase.from('teams').select('*', { count: 'exact', head: true });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-xs text-slate-400 uppercase font-semibold">Total Aniimo</span>
          <div className="text-3xl font-extrabold text-slate-100">{aniimoCount ?? 0}</div>
        </div>
        <Database className="w-10 h-10 text-teal-400 opacity-80" />
      </div>

      <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-xs text-slate-400 uppercase font-semibold">Total Team Builds</span>
          <div className="text-3xl font-extrabold text-slate-100">{teamsCount ?? 0}</div>
        </div>
        <Users className="w-10 h-10 text-teal-400 opacity-80" />
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-100">Management Overview</h1>
        <p className="text-slate-400 text-sm">Monitor content records, draft status, and create new game entries.</p>
      </div>

      <Suspense fallback={<div className="text-slate-400 py-8">Loading dashboard statistics...</div>}>
        <DashboardStats />
      </Suspense>

      {/* Quick Action Buttons */}
      <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-800">
        <Link
          href="/admin/aniimo/new"
          className="px-4 py-2.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold transition flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" /> Add New Aniimo
        </Link>
        <Link
          href="/admin/teams/new"
          className="px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold transition flex items-center gap-2 text-sm"
        >
          <FileEdit className="w-4 h-4" /> Create Team Build
        </Link>
      </div>
    </div>
  );
}