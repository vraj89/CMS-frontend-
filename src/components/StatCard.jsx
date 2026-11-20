export default function StatCard({ icon: Icon, label, value, trend, tone = 'indigo' }) {
  const tones = {
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    blue: 'bg-blue-50 text-blue-600',
    red: 'bg-red-50 text-red-600',
    gray: 'bg-gray-100 text-gray-600',
  };

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${tones[tone] || tones.indigo}`}>
          {Icon ? <Icon className="h-5 w-5" /> : null}
        </div>
        {trend && (
          <span className="rounded-full bg-gray-50 px-2 py-0.5 text-[11px] font-medium text-gray-500">{trend}</span>
        )}
      </div>
      <p className="mt-4 text-2xl font-semibold tracking-tight text-gray-900">{value}</p>
      <p className="mt-1 text-sm text-gray-500">{label}</p>
    </div>
  );
}
