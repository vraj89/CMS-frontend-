import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FileText, History, PenLine, Plus, Send } from 'lucide-react';
import api, { errorMessage } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import { SkeletonTable } from '../components/Skeleton';
import { formatDate, timeAgo } from '../utils/format';

const blank = { title: '', body: '', project_id: '', task_id: '' };

export default function Content() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const isWriter = user.role === 'content_writer';
  const [items, setItems] = useState([]);
  const [projects, setProjects] = useState([]);
  const [revisions, setRevisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([api.get('/content'), api.get('/projects'), api.get('/revisions')])
      .then(([content, projectList, revisionList]) => {
        setItems(content.data);
        setProjects(projectList.data);
        setRevisions(revisionList.data);
      })
      .catch((err) => toast.error(errorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  // Arriving from the task board with ?task=…&project=…
  useEffect(() => {
    const taskId = params.get('task');
    if (taskId && isWriter) {
      setEditing(null);
      setForm({ ...blank, project_id: params.get('project') || '', task_id: taskId });
      setOpen(true);
    }
  }, [params, isWriter]);

  const closeModal = () => {
    setOpen(false);
    setEditing(null);
    setForm(blank);
    if (params.get('task')) setParams({}, { replace: true });
  };

  const openCreate = () => {
    setEditing(null);
    setForm(blank);
    setOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({ title: item.title, body: item.body, project_id: item.project_id, task_id: item.task_id });
    setOpen(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        const { data } = await api.patch(`/content/${editing.id}`, { title: form.title, body: form.body });
        toast.success(data.version > editing.version ? `Saved as v${data.version}` : 'Content updated');
      } else {
        await api.post('/content', form);
        toast.success('Draft created');
      }
      closeModal();
      load();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const submit = async (item) => {
    try {
      await api.post(`/content/${item.id}/submit`);
      toast.success('Submitted — the client has been notified');
      load();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const resolve = async (revision) => {
    try {
      await api.patch(`/revisions/${revision.id}/resolve`);
      toast.success(`Revision resolved — ${revision.entity_title} bumped to v${revision.entity_version + 1}`);
      load();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const openRevisions = useMemo(
    () => revisions.filter((r) => r.status === 'open' && r.entity_type === 'content'),
    [revisions],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-gray-900">Content studio</h2>
          <p className="mt-1 text-sm text-gray-500">
            {isWriter ? 'Draft, version and submit copy for client approval.' : 'Every piece of copy produced by the team.'}
          </p>
        </div>
        {isWriter && (
          <button onClick={openCreate} className="btn-primary">
            <Plus className="h-4 w-4" /> New content
          </button>
        )}
      </div>

      {openRevisions.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-amber-800">
            <History className="h-4 w-4" /> Open revision requests ({openRevisions.length})
          </div>
          <div className="mt-3 space-y-2">
            {openRevisions.map((r) => (
              <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-white/80 px-3 py-2">
                <div>
                  <p className="text-sm font-medium text-gray-900">{r.entity_title} <span className="text-gray-400">v{r.entity_version}</span></p>
                  <p className="text-xs text-amber-800">{r.reason}</p>
                </div>
                {isWriter && (
                  <button onClick={() => resolve(r)} className="btn-warning px-3 py-1.5 text-xs">Resolve & bump version</button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <SkeletonTable />
      ) : items.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No content yet"
          message={isWriter ? 'Create your first draft from a task or from scratch.' : 'Content written by the team will appear here.'}
          action={isWriter ? <button onClick={openCreate} className="btn-primary"><Plus className="h-4 w-4" /> New content</button> : null}
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="hidden w-full text-left text-sm md:table">
            <thead className="border-b border-gray-100 bg-gray-50/60">
              <tr>
                <th className="table-head px-5 py-3">Title</th>
                <th className="table-head px-5 py-3">Project</th>
                <th className="table-head px-5 py-3">Version</th>
                <th className="table-head px-5 py-3">Status</th>
                <th className="table-head px-5 py-3">Updated</th>
                <th className="table-head px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {items.map((item) => (
                <tr key={item.id} className="transition hover:bg-gray-50/70">
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-gray-900">{item.title}</p>
                    <p className="line-clamp-1 max-w-md text-xs text-gray-500">{item.body}</p>
                  </td>
                  <td className="px-5 py-3.5 text-gray-600">{item.project_name}</td>
                  <td className="px-5 py-3.5">
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">v{item.version}</span>
                  </td>
                  <td className="px-5 py-3.5"><Badge status={item.status} /></td>
                  <td className="px-5 py-3.5 text-xs text-gray-500">{formatDate(item.created_at)}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEdit(item)} className="btn-secondary px-2.5 py-1 text-xs">
                        <PenLine className="h-3 w-3" /> {isWriter ? 'Edit' : 'View'}
                      </button>
                      {isWriter && ['draft', 'revision_requested'].includes(item.status) && (
                        <button onClick={() => submit(item)} className="btn-primary px-2.5 py-1 text-xs">
                          <Send className="h-3 w-3" /> Submit
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="divide-y divide-gray-50 md:hidden">
            {items.map((item) => (
              <div key={item.id} className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-gray-900">{item.title}</p>
                  <Badge status={item.status} />
                </div>
                <p className="mt-1 text-xs text-gray-500">{item.project_name} · v{item.version} · {timeAgo(item.created_at)}</p>
                <div className="mt-3 flex gap-2">
                  <button onClick={() => openEdit(item)} className="btn-secondary flex-1 py-1.5 text-xs">Open</button>
                  {isWriter && ['draft', 'revision_requested'].includes(item.status) && (
                    <button onClick={() => submit(item)} className="btn-primary flex-1 py-1.5 text-xs">Submit</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Modal
        open={open}
        onClose={closeModal}
        title={editing ? `${editing.title} · v${editing.version}` : 'New content'}
        description={editing ? 'Changing the body creates a new version.' : 'Save as a draft, then submit for client review.'}
        footer={
          <>
            <button className="btn-secondary" onClick={closeModal}>Cancel</button>
            <button form="content-form" type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving…' : editing ? 'Save changes' : 'Create draft'}
            </button>
          </>
        }
      >
        <form id="content-form" onSubmit={save} className="space-y-4">
          <div>
            <label className="label">Title</label>
            <input required className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          {!editing && (
            <div>
              <label className="label">Project</label>
              <select required className="input" value={form.project_id} onChange={(e) => setForm({ ...form, project_id: e.target.value })}>
                <option value="">Select a project…</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.project_name}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="label">Body</label>
            <textarea
              rows={9}
              className="input font-normal leading-relaxed"
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              placeholder="Write the copy here…"
            />
          </div>
          {editing && (
            <p className="rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-500">
              Currently v{editing.version} · editing the body publishes v{editing.version + 1} as a draft.
            </p>
          )}
        </form>
      </Modal>
    </div>
  );
}
