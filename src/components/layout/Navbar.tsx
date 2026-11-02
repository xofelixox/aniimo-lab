import Link from 'next/link';
import { Shield, Sparkles, Users, Database } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 group-hover:bg-teal-500/20 transition">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg tracking-wider text-slate-100 font-sans">
            ANIIMO<span className="text-teal-400">LAB</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <Link href="/aniimo" className="hover:text-teal-400 transition flex items-center gap-1.5">
            <Database className="w-4 h-4" /> Aniimo Database
          </Link>
          <Link href="/teams" className="hover:text-teal-400 transition flex items-center gap-1.5">
            <Users className="w-4 h-4" /> Team Builds
          </Link>
          <Link href="/builder" className="hover:text-teal-400 transition flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" /> Synergy Engine
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/login"
            className="text-xs font-semibold px-3 py-2 rounded-md bg-slate-900 border border-slate-800 text-slate-300 hover:text-teal-400 hover:border-teal-500/30 transition flex items-center gap-1.5"
          >
            <Shield className="w-3.5 h-3.5" /> Admin
          </Link>
        </div>
      </div>
    </header>
  );
}