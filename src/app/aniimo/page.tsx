import { Suspense } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Database } from 'lucide-react';

async function AniimoList() {
  const supabase = await createClient();
  const { data: aniimoList } = await supabase
    .from('aniimo')
    .select('*')
    .eq('status', 'published')
    .order('name');

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {aniimoList && aniimoList.length > 0 ? (
        aniimoList.map((aniimo) => (
          <Link
            key={aniimo.id}
            href={`/aniimo/${aniimo.slug}`}
            className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-teal-500/40 transition flex gap-4 group"
          >
            <div className="w-16 h-16 rounded-xl bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-700 flex-shrink-0">
              {aniimo.image_url ? (
                <img src={aniimo.image_url} alt={aniimo.name} className="w-full h-full object-cover group-hover:scale-105 transition" />
              ) : (
                <Database className="w-7 h-7 text-slate-600" />
              )}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded bg-teal-500/10 text-teal-400 font-medium">
                  {aniimo.element}
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-100 group-hover:text-teal-400 transition">{aniimo.name}</h2>
              <p className="text-xs text-slate-400">Roles: {aniimo.roles.join(', ')}</p>
            </div>
          </Link>
        ))
      ) : (
        <div className="col-span-3 text-center py-16 text-slate-500 bg-slate-900/30 rounded-xl border border-slate-800">
          No published Aniimo found in the database.
        </div>
      )}
    </div>
  );
}

export default function AniimoIndexPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-100 flex items-center gap-3">
          <Database className="w-8 h-8 text-teal-400" /> Aniimo Database
        </h1>
        <p className="text-slate-400 mt-1">Browse all verified characters, elemental affinities, and skill loadouts.</p>
      </div>

      <Suspense fallback={<div className="text-slate-400 py-16 text-center">Loading Aniimo database...</div>}>
        <AniimoList />
      </Suspense>
    </div>
  );
}