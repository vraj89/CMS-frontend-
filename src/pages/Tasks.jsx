import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CalendarDays, Clapperboard, FileText, ListChecks, Play, Send } from 'lucide-react';
import api, { errorMessage } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';
import { SkeletonCards } from '../components/Skeleton';
import { formatDate } from '../utils/format';

const columns = [
  { key: 'pending', label: 'Pending', hint: 'Not started' },
  { key: 'in_progress', label: 'In Progress', hint: 'Being produced' },
  { key: 'submitted', label: 'Submitted', hint: 'With the client' },
];

export default function Tasks() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api
      .get('/tasks')
      .then(({ data }) => setTasks(data))
      .catch((err) => toast.error(errorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const move = async (task, status) => {
    try {
      await api.patch(`/tasks/${task.id}/status`, { status });
      toast.success(`"${task.title}" → ${status.replace('_', ' ')}`);
      load();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const startProduction = (task) => {
    const path = user.role === 'video_editor' ? '/media' : '/content';
    navigate(`${path}?task=${task.id}&project=${task.project_id}`);
  };

  const grouped = (key) =>
    tasks.filter((t) => (key === 'submitted' ? ['submitted', 'approved'].includes(t.status) : t.status === key));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-gray-900">Production board</h2>
        <p className="mt-1 text-sm text-gray-500">
          {user.role === 'task_manager' ? 'Track every assigned task across projects.' : 'Your assigned tasks and their status.'}
        </p>
      </div>

      {loading ? (
        <SkeletonCards count={3} />
      ) : tasks.length === 0 ? (
        <EmptyState icon={ListChecks} title="No tasks assigned" message="New tasks from the task manager will appear here." />
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {columns.map((col) => {
            const items = grouped(col.key);
            return (
              <section key={col.key} className="flex flex-col">
                <div className="mb-3 flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-gray-900">{col.label}</h3>
                    <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-gray-500 ring-1 ring-gray-200">{items.length}</span>
                  </div>
                  <span className="text-[11px] text-gray-400">{col.hint}</span>
                </div>

                <div className="flex-1 space-y-3 rounded-xl bg-gray-100/50 p-2.5">
                  {items.length === 0 && (
                    <div className="rounded-lg border border-dashed border-gray-200 bg-white/60 px-3 py-8 text-center text-xs text-gray-400">
                      Nothing here
                    </div>
                  )}
                  {items.map((task) => (
                    <div key={task.id} className="card p-4 hover:-translate-y-0.5">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold leading-snug text-gray-900">{task.title}</p>
                        <Badge status={task.priority} />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">{task.project_name}</p>
                      <p className="mt-2 line-clamp-2 text-xs text-gray-500">{task.description || 'No description'}</p>

                      <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-gray-400">
                        <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" /> {formatDate(task.due_date)}</span>
                        <span>{task.assignee_name}</span>
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-2 border-t border-gray-50 pt-3">
                        <Badge status={task.status} />
                        <div className="flex items-center gap-1.5">
                          {task.status === 'pending' && (
                            <button onClick={() => move(task, 'in_progress')} className="btn-secondary px-2.5 py-1 text-[11px]">
                              <Play className="h-3 w-3" /> Start
                            </button>
                          )}
                          {task.status === 'in_progress' && (user.role === 'content_writer' || user.role === 'video_editor') && (
                            <button onClick={() => startProduction(task)} className="btn-primary px-2.5 py-1 text-[11px]">
                              {user.role === 'video_editor' ? <Clapperboard className="h-3 w-3" /> : <FileText className="h-3 w-3" />}
                              Create
                            </button>
                          )}
                          {task.status === 'in_progress' && (
                            <button onClick={() => move(task, 'submitted')} className="btn-secondary px-2.5 py-1 text-[11px]">
                              <Send className="h-3 w-3" /> Submit
                            </button>
                          )}
                          {task.status === 'submitted' && (user.role === 'task_manager') && (
                            <button onClick={() => move(task, 'approved')} className="btn-success px-2.5 py-1 text-[11px]">
                              Approve
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
