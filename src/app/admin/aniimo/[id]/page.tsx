import { Suspense } from 'react';
import AniimoFormClient from './AniimoFormClient';

export const instant = false; // Exempt this admin route from instant navigation prerendering validation

interface Props {
  params: Promise<{ id: string }>;
}

async function WrappedForm({ params }: Props) {
  const resolvedParams = await params;
  return <AniimoFormClient id={resolvedParams.id} />;
}

export default function AdminAniimoFormPage({ params }: Props) {
  return (
    <Suspense fallback={<div className="text-slate-400 p-8">Loading form...</div>}>
      <WrappedForm params={params} />
    </Suspense>
  );
}