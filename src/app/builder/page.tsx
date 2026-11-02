import { Suspense } from 'react';
import SynergyBuilderClient from './SynergyBuilderClient';

export default function SynergyBuilderPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-400">Loading Synergy Engine...</div>}>
      <SynergyBuilderClient />
    </Suspense>
  );
}