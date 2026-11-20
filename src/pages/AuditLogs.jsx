import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { ScrollText, Search } from 'lucide-react';
import api, { errorMessage } from '../api/axios';
import EmptyState from '../components/EmptyState';
import { SkeletonTable } from '../components/Skeleton';
import { formatDateTime, initials } from '../utils/format';

const actionTone = {
  LOGIN: 'bg-gray-100 text-gray-600',
  CLIENT_VERIFIED: 'bg-emerald-100 text-emerald-700',
  CLIENT_REJECTED: 'bg-red-100 text-red-700',
  CLIENT_CREATED: 'bg-sky-100 text-sky-700',
  PROJECT_CREATED: 'bg-indigo-100 text-indigo-700',
  TASK_CREATED: 'bg-indigo-100 text-indigo-700',
  CONTENT_APPROVED: 'bg-emerald-100 text-emerald-700',
  REVISION_REQUESTED: 'bg-amber-100 text-amber-700',
  REVISION_RESOLVED: 'bg-emerald-100 text-emerald-700',
  PAYMENT_MARKED_PAID: 'bg-emerald-100 text-emerald-700',
};

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    api
      .get('/audit-logs')
      .then(({ data }) => setLogs(data))
      .catch((err) => toast.error(errorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const filtered = logs.filter((l) =>
    `${l.user_name} ${l.action} ${l.details} ${l.entity_type}`.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-gray-900">Audit trail</h2>
          <p className="mt-1 text-sm text-gray-500">Immutable record of every action across the platform.</p>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} className="input w-full pl-9 sm:w-72" placeholder="Search by user or action…" />
        </div>
      </div>

      {loading ? (
        <SkeletonTable rows={6} />
      ) : filtered.length === 0 ? (
        <EmptyState icon={ScrollText} title="No audit entries" message="Actions performed in the workspace will be recorded here." />
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-xl border border-gray-200 bg-white md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-100 bg-gray-50/60">
                <tr>
                  <th className="table-head px-5 py-3">User</th>
                  <th className="table-head px-5 py-3">Action</th>
                  <th className="table-head px-5 py-3">Entity</th>
                  <th className="table-head px-5 py-3">Details</th>
                  <th className="table-head px-5 py-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/70">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-[10px] font-semibold text-gray-600">
                          {initials(log.user_name)}
                        </span>
                        <span className="font-medium text-gray-900">{log.user_name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${actionTone[log.action] || 'bg-gray-100 text-gray-600'}`}>
                        {log.action.replaceAll('_', ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 capitalize text-gray-500">{log.entity_type}</td>
                    <td className="px-5 py-3.5 text-gray-600">{log.details || '—'}</td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-xs text-gray-500">{formatDateTime(log.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 md:hidden">
            {filtered.map((log) => (
              <div key={log.id} className="card p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-gray-900">{log.user_name}</p>
                  <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${actionTone[log.action] || 'bg-gray-100 text-gray-600'}`}>
                    {log.action.replaceAll('_', ' ')}
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-600">{log.details}</p>
                <p className="mt-2 text-[11px] text-gray-400">{formatDateTime(log.created_at)}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
