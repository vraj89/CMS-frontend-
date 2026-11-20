import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, CalendarDays, Clapperboard, FileText, ListChecks, Plus, Wallet } from 'lucide-react';
import api, { errorMessage } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import { SkeletonTable } from '../components/Skeleton';
import { currency, formatDate } from '../utils/format';

const tabs = [
  { key: 'tasks', label: 'Tasks', icon: ListChecks },
  { key: 'content', label: 'Content', icon: FileText },
  { key: 'media', label: 'Media', icon: Clapperboard },
  { key: 'payments', label: 'Payments', icon: Wallet },
];

const taskFlow = { pending: 'in_progress', in_progress: 'submitted', submitted: 'approved' };

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('tasks');
  const [assignees, setAssignees] = useState([]);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', assigned_to: '', priority: 'medium', due_date: '' });

  const canManage = user.role === 'task_manager';

  const load = () => {
    setLoading(true);
    api
      .get(`/projects/${id}`)
      .then(({ data }) => setProject(data))
      .catch((err) => toast.error(errorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    if (canManage) api.get('/tasks/assignees').then(({ data }) => setAssignees(data)).catch(() => {});
  }, [id, canManage]);

  const changeStatus = async (status) => {
    try {
      await api.patch(`/projects/${id}`, { status });
      toast.success('Project status updated');
      load();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const advanceTask = async (task) => {
    const next = taskFlow[task.status];
    if (!next) return;
    try {
      await api.patch(`/tasks/${task.id}/status`, { status: next });
      toast.success(`Task moved to ${next.replace('_', ' ')}`);
      load();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const addTask = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/tasks', { ...form, project_id: id });
      toast.success('Task assigned and notification sent');
      setOpen(false);
      setForm({ title: '', description: '', assigned_to: '', priority: 'medium', due_date: '' });
      load();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const resolveRevision = async (revisionId) => {
    try {
      await api.patch(`/revisions/${revisionId}/resolve`);
      toast.success('Revision resolved — new version published');
      load();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  if (loading || !project) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-6 w-52" />
        <SkeletonTable rows={4} />
      </div>
    );
  }

  const rows = project[tab] || [];

  return (
    <div className="space-y-6">
      <Link to="/projects" className="inline-flex items-center gap-1.5 text-sm text-gray-500 transition hover:text-gray-900">
        <ArrowLeft className="h-4 w-4" /> Back to projects
      </Link>

      <div className="card p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-semibold tracking-tight text-gray-900">{project.project_name}</h2>
              <Badge status={project.status} />
            </div>
            <p className="mt-1 text-sm text-gray-500">{project.client_name} · {project.contact_person}</p>
            <p className="mt-3 max-w-2xl text-sm text-gray-600">{project.description}</p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" /> {formatDate(project.start_date)} → {formatDate(project.deadline)}</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">{currency(project.budget)}</span>
            <select value={project.status} onChange={(e) => changeStatus(e.target.value)} className="input w-44 py-1.5 text-xs">
              {['onboarding', 'in_progress', 'in_review', 'completed'].map((s) => (
                <option key={s} value={s}>{s.replaceAll('_', ' ')}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Delivery progress</span>
            <span className="font-medium text-gray-700">{project.progress}%</span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-100">
            <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" style={{ width: `${project.progress}%` }} />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition ${
                tab === key ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              <Icon className="h-4 w-4" /> {label}
              <span className="rounded-full bg-gray-100 px-1.5 text-[11px] text-gray-500">{(project[key] || []).length}</span>
            </button>
          ))}
        </div>
        {tab === 'tasks' && canManage && (
          <button onClick={() => setOpen(true)} className="btn-primary mb-2">
            <Plus className="h-4 w-4" /> Add task
          </button>
        )}
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title={`No ${tab} yet`}
          message={tab === 'tasks' ? 'Task managers can allocate work to writers and editors.' : `Items will appear here once production starts.`}
          action={tab === 'tasks' && canManage ? <button onClick={() => setOpen(true)} className="btn-primary"><Plus className="h-4 w-4" /> Add task</button> : null}
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-100 bg-gray-50/60">
              {tab === 'tasks' && (
                <tr>
                  <th className="table-head px-5 py-3">Task</th>
                  <th className="table-head px-5 py-3">Assignee</th>
                  <th className="table-head px-5 py-3">Priority</th>
                  <th className="table-head px-5 py-3">Due</th>
                  <th className="table-head px-5 py-3">Status</th>
                  <th className="table-head px-5 py-3 text-right">Action</th>
                </tr>
              )}
              {(tab === 'content' || tab === 'media') && (
                <tr>
                  <th className="table-head px-5 py-3">Title</th>
                  <th className="table-head px-5 py-3">Version</th>
                  <th className="table-head px-5 py-3">Status</th>
                  <th className="table-head px-5 py-3">Created</th>
                </tr>
              )}
              {tab === 'payments' && (
                <tr>
                  <th className="table-head px-5 py-3">Milestone</th>
                  <th className="table-head px-5 py-3">Amount</th>
                  <th className="table-head px-5 py-3">Due</th>
                  <th className="table-head px-5 py-3">Status</th>
                </tr>
              )}
            </thead>
            <tbody className="divide-y divide-gray-50">
              {tab === 'tasks' &&
                rows.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50/70">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-gray-900">{task.title}</p>
                      <p className="line-clamp-1 text-xs text-gray-500">{task.description}</p>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">{task.assignee_name || '—'}</td>
                    <td className="px-5 py-3.5"><Badge status={task.priority} /></td>
                    <td className="px-5 py-3.5 text-gray-500">{formatDate(task.due_date)}</td>
                    <td className="px-5 py-3.5"><Badge status={task.status} /></td>
                    <td className="px-5 py-3.5 text-right">
                      {taskFlow[task.status] ? (
                        <button onClick={() => advanceTask(task)} className="text-xs font-medium text-brand-600 hover:text-brand-700">
                          Move to {taskFlow[task.status].replace('_', ' ')}
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">Done</span>
                      )}
                    </td>
                  </tr>
                ))}

              {(tab === 'content' || tab === 'media') &&
                rows.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/70">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-gray-900">{item.title}</p>
                      {tab === 'media' && (
                        <a href={item.file_url} target="_blank" rel="noreferrer" className="text-xs text-brand-600 hover:underline">
                          {item.file_type} link
                        </a>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">v{item.version}</td>
                    <td className="px-5 py-3.5"><Badge status={item.status} /></td>
                    <td className="px-5 py-3.5 text-gray-500">{formatDate(item.created_at)}</td>
                  </tr>
                ))}

              {tab === 'payments' &&
                rows.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50/70">
                    <td className="px-5 py-3.5 font-medium text-gray-900">{payment.milestone}</td>
                    <td className="px-5 py-3.5 text-gray-600">{currency(payment.amount)}</td>
                    <td className="px-5 py-3.5 text-gray-500">{formatDate(payment.due_date)}</td>
                    <td className="px-5 py-3.5"><Badge status={payment.status} /></td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {user.role === 'task_manager' && (
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title="Allocate a task"
          description="The assignee receives an in-app notification instantly."
          footer={
            <>
              <button className="btn-secondary" onClick={() => setOpen(false)}>Cancel</button>
              <button form="task-form" type="submit" disabled={saving} className="btn-primary">{saving ? 'Assigning…' : 'Assign task'}</button>
            </>
          }
        >
          <form id="task-form" onSubmit={addTask} className="space-y-4">
            <div>
              <label className="label">Task title</label>
              <input required className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Write homepage hero copy" />
            </div>
            <div>
              <label className="label">Description</label>
              <textarea rows={3} className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Assign to</label>
                <select required className="input" value={form.assigned_to} onChange={(e) => setForm({ ...form, assigned_to: e.target.value })}>
                  <option value="">Select a producer…</option>
                  {assignees.map((a) => (
                    <option key={a.id} value={a.id}>{a.name} — {a.role.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Priority</label>
                <select className="input" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            <div>
              <label className="label">Due date</label>
              <input type="date" className="input" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
