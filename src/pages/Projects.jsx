import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowUpRight, CalendarDays, FolderKanban, Plus, Wallet } from 'lucide-react';
import api, { errorMessage } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import { SkeletonTable } from '../components/Skeleton';
import { currency, formatDate } from '../utils/format';

const blank = { client_id: '', project_name: '', description: '', start_date: '', deadline: '', budget: '' };

export default function Projects() {
  const { user } = useAuth();
  const isAdmin = user.role === 'admin';
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api
      .get('/projects')
      .then(({ data }) => setProjects(data))
      .catch((err) => toast.error(errorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    if (isAdmin) api.get('/clients').then(({ data }) => setClients(data.filter((c) => c.status === 'active'))).catch(() => {});
  }, [isAdmin]);

  const create = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/projects', form);
      toast.success('Project created');
      setOpen(false);
      setForm(blank);
      load();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const active = projects.filter((p) => p.status === 'in_progress' || p.status === 'in_review').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-gray-900">Projects</h2>
          <p className="mt-1 text-sm text-gray-500">
            {projects.length} projects · {active} in delivery
          </p>
        </div>
        {isAdmin && (
          <button onClick={() => setOpen(true)} className="btn-primary">
            <Plus className="h-4 w-4" /> New project
          </button>
        )}
      </div>

      {loading ? (
        <SkeletonTable rows={3} />
      ) : projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects yet"
          message={isAdmin ? 'Create a project for a verified client to begin delivery.' : 'Projects will appear here once an admin creates them.'}
          action={isAdmin ? <button onClick={() => setOpen(true)} className="btn-primary"><Plus className="h-4 w-4" /> New project</button> : null}
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {projects.map((project) => (
            <Link key={project.id} to={`/projects/${project.id}`} className="card group p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold text-gray-900">{project.project_name}</p>
                  <p className="mt-0.5 text-sm text-gray-500">{project.client_name}</p>
                </div>
                <Badge status={project.status} />
              </div>

              <p className="mt-3 line-clamp-2 text-sm text-gray-600">{project.description || 'No description added.'}</p>

              <div className="mt-5">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Progress</span>
                  <span className="font-medium text-gray-700">{project.progress}%</span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" /> {formatDate(project.deadline)}</span>
                <span className="flex items-center gap-1.5"><Wallet className="h-3.5 w-3.5" /> {currency(project.budget)}</span>
                <span className="ml-auto flex items-center gap-1 font-medium text-brand-600 transition group-hover:gap-2">
                  Open <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Create a project"
        description="Only verified (active) clients can receive new projects."
        footer={
          <>
            <button className="btn-secondary" onClick={() => setOpen(false)}>Cancel</button>
            <button form="project-form" type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Creating…' : 'Create project'}
            </button>
          </>
        }
      >
        <form id="project-form" onSubmit={create} className="space-y-4">
          <div>
            <label className="label">Client</label>
            <select required className="input" value={form.client_id} onChange={(e) => setForm({ ...form, client_id: e.target.value })}>
              <option value="">Select a verified client…</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.company_name}</option>
              ))}
            </select>
            {clients.length === 0 && <p className="mt-1.5 text-xs text-amber-600">No active clients yet — verify a client first.</p>}
          </div>
          <div>
            <label className="label">Project name</label>
            <input required className="input" value={form.project_name} onChange={(e) => setForm({ ...form, project_name: e.target.value })} placeholder="Beta Website Launch" />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea rows={3} className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Scope, deliverables and expectations…" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="label">Start date</label>
              <input type="date" className="input" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
            </div>
            <div>
              <label className="label">Deadline</label>
              <input type="date" className="input" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
            </div>
            <div>
              <label className="label">Budget (₹)</label>
              <input type="number" min="0" className="input" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} placeholder="85000" />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
