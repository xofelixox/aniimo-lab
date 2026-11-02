import { Suspense } from 'react';
import TeamFormClient from './TeamFormClient';

interface Props {
  params: Promise<{ id: string }>;
}

async function TeamFormShell({ params }: Props) {
  const { id } = await params;
  return <TeamFormClient id={id} />;
}

export default function AdminTeamEditPage({ params }: Props) {
  return (
    <Suspense fallback={<div className="text-slate-400 py-16 text-center">Loading team editor...</div>}>
      <TeamFormShell params={params} />
    </Suspense>
  );
}