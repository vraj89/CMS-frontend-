import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Bell, CheckCheck, Circle } from 'lucide-react';
import api, { errorMessage } from '../api/axios';
import EmptyState from '../components/EmptyState';
import { SkeletonRows } from '../components/Skeleton';
import { timeAgo } from '../utils/format';

const typeTone = {
  approval: 'bg-blue-50 text-blue-600',
  revision: 'bg-amber-50 text-amber-600',
  payment: 'bg-emerald-50 text-emerald-600',
  task: 'bg-indigo-50 text-indigo-600',
  info: 'bg-gray-100 text-gray-600',
};

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api
      .get('/notifications')
      .then(({ data }) => setItems(data))
      .catch((err) => toast.error(errorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const markRead = async (item) => {
    if (item.is_read) return;
    try {
      await api.patch(`/notifications/${item.id}/read`);
      setItems((prev) => prev.map((n) => (n.id === item.id ? { ...n, is_read: true } : n)));
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const markAll = async () => {
    try {
      await api.patch('/notifications/read-all');
      setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const unread = items.filter((n) => !n.is_read).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-gray-900">Notifications</h2>
          <p className="mt-1 text-sm text-gray-500">{unread} unread of {items.length} total</p>
        </div>
        <button onClick={markAll} disabled={!unread} className="btn-secondary">
          <CheckCheck className="h-4 w-4" /> Mark all as read
        </button>
      </div>

      {loading ? (
        <SkeletonRows />
      ) : items.length === 0 ? (
        <EmptyState icon={Bell} title="Inbox is empty" message="Task assignments, approvals and payment updates will appear here." />
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          {items.map((n) => (
            <button
              key={n.id}
              onClick={() => markRead(n)}
              className={`flex w-full items-start gap-3 border-b border-gray-50 px-5 py-4 text-left transition last:border-0 hover:bg-gray-50/70 ${
                n.is_read ? '' : 'bg-indigo-50/30'
              }`}
            >
              <span className={`mt-0.5 flex h-8 w-8 flex-none items-center justify-center rounded-full text-[11px] font-semibold uppercase ${typeTone[n.type] || typeTone.info}`}>
                {n.type?.slice(0, 2)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-900">{n.title}</p>
                  {!n.is_read && <Circle className="h-2 w-2 fill-red-500 text-red-500" />}
                </div>
                <p className="mt-0.5 text-sm text-gray-600">{n.message}</p>
                <p className="mt-1 text-[11px] text-gray-400">{timeAgo(n.created_at)}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
