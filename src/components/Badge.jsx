const tones = {
  approved: 'bg-emerald-100 text-emerald-700 ring-emerald-600/10',
  active: 'bg-emerald-100 text-emerald-700 ring-emerald-600/10',
  paid: 'bg-emerald-100 text-emerald-700 ring-emerald-600/10',
  resolved: 'bg-emerald-100 text-emerald-700 ring-emerald-600/10',
  submitted: 'bg-blue-100 text-blue-700 ring-blue-600/10',
  submitted_for_review: 'bg-blue-100 text-blue-700 ring-blue-600/10',
  in_review: 'bg-blue-100 text-blue-700 ring-blue-600/10',
  in_progress: 'bg-indigo-100 text-indigo-700 ring-indigo-600/10',
  onboarding: 'bg-sky-100 text-sky-700 ring-sky-600/10',
  pending: 'bg-amber-100 text-amber-700 ring-amber-600/10',
  pending_verification: 'bg-amber-100 text-amber-700 ring-amber-600/10',
  revision_requested: 'bg-amber-100 text-amber-700 ring-amber-600/10',
  open: 'bg-amber-100 text-amber-700 ring-amber-600/10',
  overdue: 'bg-red-100 text-red-700 ring-red-600/10',
  rejected: 'bg-red-100 text-red-700 ring-red-600/10',
  draft: 'bg-gray-100 text-gray-600 ring-gray-500/10',
  completed: 'bg-gray-100 text-gray-700 ring-gray-500/10',
  low: 'bg-gray-100 text-gray-600 ring-gray-500/10',
  medium: 'bg-sky-100 text-sky-700 ring-sky-600/10',
  high: 'bg-red-100 text-red-700 ring-red-600/10',
};

export default function Badge({ status, children, className = '' }) {
  const tone = tones[status] || 'bg-gray-100 text-gray-600 ring-gray-500/10';
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ring-1 ring-inset ${tone} ${className}`}
    >
      {children || String(status || '').replaceAll('_', ' ')}
    </span>
  );
}
