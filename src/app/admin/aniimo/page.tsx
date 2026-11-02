import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Plus, Edit } from 'lucide-react';

async function AniimoTable() {
  const supabase = await createClient();
  const { data: aniimoList } = await supabase.from('aniimo').select('*').order('created_at', { ascending: false });

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
      <table className="w-full text-left text-sm text-slate-300">
        <thead className="bg-slate-950 text-xs uppercase font-semibold text-slate-400 border-b border-slate-800">
          <tr>
            <th className="px-6 py-3.5">Name</th>
            <th className="px-6 py-3.5">Element</th>
            <th className="px-6 py-3.5">Roles</th>
            <th className="px-6 py-3.5">Status</th>
            <th className="px-6 py-3.5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60">
          {aniimoList && aniimoList.length > 0 ? (
            aniimoList.map((item) => (
              <tr key={item.id} className="hover:bg-slate-800/40 transition">
                <td className="px-6 py-4 font-bold text-slate-100">{item.name}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-0.5 rounded bg-teal-500/10 text-teal-400 text-xs font-medium">
                    {item.element}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs text-slate-400">{item.roles.join(', ')}</td>
                <td className="px-6 py-4">
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded font-semibold uppercase ${
                      item.status === 'published'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <Link
                    href={`/admin/aniimo/${item.id}`}
                    className="inline-flex items-center gap-1 text-xs text-teal-400 hover:underline font-medium"
                  >
                    <Edit className="w-3.5 h-3.5" /> Edit
                  </Link>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                No Aniimo records created yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminAniimoPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Aniimo Records</h1>
          <p className="text-slate-400 text-xs">Create, edit, draft, and publish character profiles.</p>
        </div>
        <Link
          href="/admin/aniimo/new"
          className="px-3.5 py-2 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> New Aniimo
        </Link>
      </div>

      <Suspense fallback={<div className="text-slate-400 p-8 text-center">Loading Aniimo table...</div>}>
        <AniimoTable />
      </Suspense>
    </div>
  );
}