'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Save, ArrowLeft } from 'lucide-react';

interface Props {
  id: string;
}

export default function AniimoFormClient({ id }: Props) {
  const isNew = id === 'new';
  const router = useRouter();

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [element, setElement] = useState('');
  const [roles, setRoles] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('draft');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isNew) {
      const loadAniimo = async () => {
        const supabase = createClient();
        const { data } = await supabase.from('aniimo').select('*').eq('id', id).single();
        if (data) {
          setName(data.name);
          setSlug(data.slug);
          setElement(data.element);
          setRoles(data.roles.join(', '));
          setDescription(data.description || '');
          setStatus(data.status);
        }
      };
      loadAniimo();
    }
  }, [id, isNew]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const supabase = createClient();
    const payload = {
      name,
      slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
      element,
      roles: roles.split(',').map((r) => r.trim()).filter(Boolean),
      description,
      status,
    };

    let error;
    if (isNew) {
      const res = await supabase.from('aniimo').insert([payload]);
      error = res.error;
    } else {
      const res = await supabase.from('aniimo').update(payload).eq('id', id);
      error = res.error;
    }

    setLoading(false);
    if (error) {
      setMessage(`Error saving record: ${error.message}`);
    } else {
      router.push('/admin/aniimo');
      router.refresh();
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <button
        onClick={() => router.back()}
        className="text-xs text-slate-400 hover:text-slate-100 flex items-center gap-1.5 transition"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to List
      </button>

      <div>
        <h1 className="text-2xl font-bold text-slate-100">{isNew ? 'Create New Aniimo' : 'Edit Aniimo'}</h1>
        <p className="text-slate-400 text-xs">Configure character attributes, element, roles, and status.</p>
      </div>

      {message && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-lg">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (isNew) setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'));
              }}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-teal-400"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">URL Slug</label>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-teal-400"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Element</label>
            <input
              type="text"
              required
              value={element}
              onChange={(e) => setElement(e.target.value)}
              placeholder="e.g. Pyro, Hydro, Anemo"
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-teal-400"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Roles (Comma Separated)</label>
            <input
              type="text"
              required
              value={roles}
              onChange={(e) => setRoles(e.target.value)}
              placeholder="e.g. Main DPS, Shield, Buffer"
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-teal-400"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-300">Description</label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-teal-400"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-300">Publication Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-teal-400"
          >
            <option value="draft">Draft (Private)</option>
            <option value="published">Published (Public)</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm transition flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {loading ? 'Saving...' : 'Save Aniimo Record'}
        </button>
      </form>
    </div>
  );
}