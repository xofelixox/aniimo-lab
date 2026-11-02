'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Save, ArrowLeft, Upload, Image as ImageIcon, Trash2 } from 'lucide-react';

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
  const [imageUrl, setImageUrl] = useState('');
  const [status, setStatus] = useState('draft');
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploading, setUploading] = useState(false);
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
          setImageUrl(data.image_url || '');
          setStatus(data.status);
        }
      };
      loadAniimo();
    }
  }, [id, isNew]);

  // Handle direct file upload to Supabase Storage
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage(null);

    const supabase = createClient();
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('aniimo-images')
      .upload(filePath, file);

    if (uploadError) {
      setMessage(`Image upload failed: ${uploadError.message}`);
      setUploading(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from('aniimo-images')
      .getPublicUrl(filePath);

    setImageUrl(publicUrlData.publicUrl);
    setUploading(false);
  };

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
      image_url: imageUrl,
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

  // Delete Record Function
  const handleDelete = async () => {
    if (isNew) return;
    const confirmed = window.confirm(`Are you sure you want to permanently delete "${name || 'this character'}"?`);
    if (!confirmed) return;

    setDeleting(true);
    setMessage(null);

    const supabase = createClient();
    const { error } = await supabase.from('aniimo').delete().eq('id', id);

    setDeleting(false);
    if (error) {
      setMessage(`Error deleting record: ${error.message}`);
    } else {
      router.push('/admin/aniimo');
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
          <ArrowLeft className="w-3.5 h-3.5" /> Back to List
        </button>

        {!isNew && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-semibold text-xs transition flex items-center gap-1.5 disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {deleting ? 'Deleting...' : 'Delete Record'}
          </button>
        )}
      </div>

      <div>
        <h1 className="text-2xl font-bold text-slate-100">{isNew ? 'Create New Aniimo' : 'Edit Aniimo'}</h1>
        <p className="text-slate-400 text-xs">Configure character attributes, element, roles, image asset, and status.</p>
      </div>

      {message && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-lg">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-5">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300">Character Image Asset</label>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden flex-shrink-0">
              {imageUrl ? (
                <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="w-8 h-8 text-slate-600" />
              )}
            </div>
            
            <div className="flex-1 space-y-2">
              <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs cursor-pointer transition">
                <Upload className="w-4 h-4 text-teal-400" />
                {uploading ? 'Uploading to Supabase...' : 'Upload Image File'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>

              <p className="text-[11px] text-slate-500">Or enter an image URL directly below:</p>
              
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/character.png"
                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-teal-400"
              />
            </div>
          </div>
        </div>

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
          disabled={loading || uploading || deleting}
          className="px-5 py-2.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm transition flex items-center gap-2 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {loading ? 'Saving...' : 'Save Aniimo Record'}
        </button>
      </form>
    </div>
  );
}