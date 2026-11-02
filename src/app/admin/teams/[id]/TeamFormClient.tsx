'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Save, ArrowLeft, Trash2 } from 'lucide-react';

interface Props {
  id: string;
}

export default function TeamFormClient({ id }: Props) {
  const isNew = id === 'new';
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [gameMode, setGameMode] = useState('PvE Meta');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [guideContent, setGuideContent] = useState('');
  const [status, setStatus] = useState('draft');
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isNew) {
      const loadTeam = async () => {
        const supabase = createClient();
        const { data } = await supabase.from('teams').select('*').eq('id', id).single();
        if (data) {
          setTitle(data.title);
          setSlug(data.slug);
          setDescription(data.description || '');
          setGameMode(data.game_mode || 'PvE Meta');
          setDifficulty(data.difficulty || 'intermediate');
          setGuideContent(data.guide_content || '');
          setStatus(data.status);
        }
      };
      loadTeam();
    }
  }, [id, isNew]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const supabase = createClient();
    const payload = {
      title,
      slug: slug || title.toLowerCase().replace(/\s+/g, '-'),
      description,
      game_mode: gameMode,
      difficulty,
      guide_content: guideContent,
      status,
    };

    let error;
    if (isNew) {
      const res = await supabase.from('teams').insert([payload]);
      error = res.error;
    } else {
      const res = await supabase.from('teams').update(payload).eq('id', id);
      error = res.error;
    }

    setLoading(false);
    if (error) {
      setMessage(`Error saving team: ${error.message}`);
    } else {
      router.push('/admin/teams');
      router.refresh();
    }
  };

  const handleDelete = async () => {
    if (isNew) return;
    const confirmed = window.confirm(`Permanently delete "${title}"?`);
    if (!confirmed) return;

    setDeleting(true);
    const supabase = createClient();
    const { error } = await supabase.from('teams').delete().eq('id', id);

    setDeleting(false);
    if (error) {
      setMessage(`Error deleting team: ${error.message}`);
    } else {
      router.push('/admin/teams');
      router.refresh();
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex justify-between items-center">
        <button
          onClick={() => router.back()}
          className="text-xs text-slate-400 hover:text-slate-100 flex items-center gap-1.5 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Teams
        </button>

        {!isNew && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-semibold text-xs transition flex items-center gap-1.5 disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {deleting ? 'Deleting...' : 'Delete Build'}
          </button>
        )}
      </div>

      <div>
        <h1 className="text-2xl font-bold text-slate-100">{isNew ? 'Create Team Build' : 'Edit Team Build'}</h1>
        <p className="text-slate-400 text-xs">Configure composition title, game mode, rotation guide, and status.</p>
      </div>

      {message && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-lg">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Team Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Game Mode</label>
            <input
              type="text"
              value={gameMode}
              onChange={(e) => setGameMode(e.target.value)}
              placeholder="e.g. Boss Raid, PvP Arena"
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-teal-400"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-teal-400"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-teal-400"
            >
              <option value="draft">Draft (Private)</option>
              <option value="published">Published (Public)</option>
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-300">Short Summary</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief overview of how this team functions"
            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-teal-400"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-300">Strategy Guide & Skill Rotations</label>
          <textarea
            rows={6}
            value={guideContent}
            onChange={(e) => setGuideContent(e.target.value)}
            placeholder="Detailed guide explaining skill order, combos, and gear recommendations..."
            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-teal-400"
          />
        </div>

        <button
          type="submit"
          disabled={loading || deleting}
          className="px-5 py-2.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm transition flex items-center gap-2 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {loading ? 'Saving...' : 'Save Team Build'}
        </button>
      </form>
    </div>
  );
}