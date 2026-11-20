import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Activity, ArrowUpRight, BellRing, RefreshCcw, Wallet } from 'lucide-react';
import api, { errorMessage } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import EmptyState from '../components/EmptyState';
import { SkeletonCards } from '../components/Skeleton';
import { roleLabels, timeAgo } from '../utils/format';

const tones = ['indigo', 'amber', 'emerald', 'blue'];
const barColors = ['#F59E0B', '#4F46E5', '#3B82F6', '#10B981'];

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api
      .get('/dashboard/stats')
      .then(({ data }) => setData(data))
      .catch((err) => toast.error(errorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-gray-900">
            {roleLabels[user.role]} dashboard
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Here is what is happening across your workspace today.
          </p>
        </div>
        <button onClick={load} className="btn-secondary">
          <RefreshCcw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {loading && !data ? (
        <SkeletonCards />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {(data?.cards || []).map((card, i) => (
            <StatCard
              key={card.key}
              label={card.label}
              value={card.value}
              trend={card.trend}
              tone={tones[i % tones.length]}
              icon={[Activity, RefreshCcw, Wallet, BellRing][i % 4]}
            />
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <section className="card lg:col-span-3">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Task status</h3>
              <p className="mt-0.5 text-xs text-gray-500">Distribution across the pipeline</p>
            </div>
            <span className="rounded-full bg-gray-50 px-2.5 py-1 text-[11px] font-medium text-gray-500">
              {data?.openRevisions ?? 0} open revisions
            </span>
          </div>
          <div className="h-64 px-3 py-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.taskStatus || []} barSize={38}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} width={28} />
                <Tooltip
                  cursor={{ fill: '#F9FAFB' }}
                  contentStyle={{ borderRadius: 10, border: '1px solid #E5E7EB', fontSize: 12 }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} name="Tasks">
                  {(data?.taskStatus || []).map((_, i) => (
                    <Cell key={i} fill={barColors[i % barColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="card lg:col-span-2">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <h3 className="text-sm font-semibold text-gray-900">Recent activity</h3>
            <Link to="/notifications" className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700">
              View all <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="px-5 py-3">
            {data?.recentActivity?.length ? (
              <ul className="divide-y divide-gray-50">
                {data.recentActivity.map((item) => (
                  <li key={item.id} className="flex gap-3 py-3">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-brand-500" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium capitalize text-gray-900">{item.title}</p>
                      <p className="mt-0.5 line-clamp-2 text-xs text-gray-500">{item.message}</p>
                      <p className="mt-1 text-[11px] text-gray-400">
                        {item.user_name} · {timeAgo(item.created_at)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState title="No activity yet" message="Actions across the workspace will appear here." />
            )}
          </div>
        </section>
      </div>

      <section className="card">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h3 className="text-sm font-semibold text-gray-900">Recent notifications</h3>
          <Link to="/notifications" className="text-xs font-medium text-brand-600 hover:text-brand-700">
            Open inbox
          </Link>
        </div>
        <div className="divide-y divide-gray-50">
          {data?.notifications?.length ? (
            data.notifications.map((n) => (
              <div key={n.id} className="flex items-start gap-3 px-5 py-3.5">
                <span className={`mt-1.5 h-1.5 w-1.5 flex-none rounded-full ${n.is_read ? 'bg-gray-300' : 'bg-red-500'}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900">{n.title}</p>
                  <p className="mt-0.5 text-xs text-gray-500">{n.message}</p>
                </div>
                <span className="whitespace-nowrap text-[11px] text-gray-400">{timeAgo(n.created_at)}</span>
              </div>
            ))
          ) : (
            <div className="px-5 py-10 text-center text-sm text-gray-500">You are all caught up.</div>
          )}
        </div>
      </section>
    </div>
  );
}
