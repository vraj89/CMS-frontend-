import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Clapperboard, ExternalLink, Film, ImageIcon, Plus, Send } from 'lucide-react';
import api, { errorMessage } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import { SkeletonCards } from '../components/Skeleton';
import { formatDate } from '../utils/format';

const blank = { title: '', file_url: '', file_type: 'video', project_id: '', task_id: '' };

function Preview({ item }) {
  if (item.file_type === 'image') {
    return <img src={item.file_url} alt={item.title} className="h-40 w-full rounded-lg object-cover" />;
  }
  if (item.file_type === 'video') {
    return (
      <div className="flex h-40 w-full items-center justify-center rounded-lg bg-gray-900">
        <video src={item.file_url} className="h-full w-full rounded-lg object-contain" controls preload="metadata" />
      </div>
    );
  }
  return (
    <div className="flex h-40 w-full flex-col items-center justify-center gap-2 rounded-lg bg-gray-50 text-gray-400">
      <ExternalLink className="h-6 w-6" />
      <span className="text-xs">Document link</span>
    </div>
  );
}

export default function Media() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const isEditor = user.role === 'video_editor';
  const [items, setItems] = useState([]);
  const [projects, setProjects] = useState([]);
  const [revisions, setRevisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([api.get('/media'), api.get('/projects'), api.get('/revisions')])
      .then(([media, projectList, revisionList]) => {
        setItems(media.data);
        setProjects(projectList.data);
        setRevisions(revisionList.data);
      })
      .catch((err) => toast.error(errorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  useEffect(() => {
    const taskId = params.get('task');
    if (taskId && isEditor) {
      setForm({ ...blank, project_id: params.get('project') || '', task_id: taskId });
      setOpen(true);
    }
  }, [params, isEditor]);

  const closeModal = () => {
    setOpen(false);
    setForm(blank);
    if (params.get('task')) setParams({}, { replace: true });
  };

  const create = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/media', form);
      toast.success('Media added — submit it when it is ready');
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
      await api.post(`/media/${item.id}/submit`);
      toast.success('Submitted — the client has been notified');
      load();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const openRevisions = useMemo(() => revisions.filter((r) => r.status === 'open' && r.entity_type === 'media'), [revisions]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-gray-900">Media library</h2>
          <p className="mt-1 text-sm text-gray-500">Add media by URL, version it, then submit for client review.</p>
        </div>
        {isEditor && (
          <button onClick={() => setOpen(true)} className="btn-primary">
            <Plus className="h-4 w-4" /> Add via URL
          </button>
        )}
      </div>

      {openRevisions.length > 0 && isEditor && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <p className="font-semibold">Revision requested on {openRevisions.length} media item(s)</p>
          <ul className="mt-2 space-y-1 text-xs">
            {openRevisions.map((r) => (
              <li key={r.id}>• {r.entity_title} — {r.reason}</li>
            ))}
          </ul>
        </div>
      )}

      {loading ? (
        <SkeletonCards count={3} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={Clapperboard}
          title="No media yet"
          message={isEditor ? 'Add your first asset using a hosted URL — no uploads needed.' : 'Media added by the video team will appear here.'}
          action={isEditor ? <button onClick={() => setOpen(true)} className="btn-primary"><Plus className="h-4 w-4" /> Add via URL</button> : null}
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <div key={item.id} className="card flex flex-col p-4">
              <Preview item={item} />
              <div className="mt-3 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-900">{item.title}</p>
                  <p className="text-xs text-gray-500">{item.project_name}</p>
                </div>
                <Badge status={item.status} />
              </div>
              <div className="mt-3 flex items-center gap-2 text-[11px] text-gray-400">
                {item.file_type === 'image' ? <ImageIcon className="h-3.5 w-3.5" /> : <Film className="h-3.5 w-3.5" />}
                <span className="capitalize">{item.file_type}</span>
                <span>·</span>
                <span>v{item.version}</span>
                <span>·</span>
                <span>{formatDate(item.created_at)}</span>
              </div>
              <div className="mt-3 flex items-center gap-2 border-t border-gray-50 pt-3">
                <a href={item.file_url} target="_blank" rel="noreferrer" className="btn-secondary flex-1 py-1.5 text-xs">
                  <ExternalLink className="h-3 w-3" /> Open
                </a>
                {isEditor && ['draft', 'revision_requested'].includes(item.status) && (
                  <button onClick={() => submit(item)} className="btn-primary flex-1 py-1.5 text-xs">
                    <Send className="h-3 w-3" /> Submit
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={open}
        onClose={closeModal}
        title="Add media via URL"
        description="Paste a hosted image, video or document link."
        footer={
          <>
            <button className="btn-secondary" onClick={closeModal}>Cancel</button>
            <button form="media-form" type="submit" disabled={saving} className="btn-primary">{saving ? 'Adding…' : 'Add media'}</button>
          </>
        }
      >
        <form id="media-form" onSubmit={create} className="space-y-4">
          <div>
            <label className="label">Title</label>
            <input required className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Brand video — 60s cut" />
          </div>
          <div>
            <label className="label">File URL</label>
            <input required type="url" className="input" value={form.file_url} onChange={(e) => setForm({ ...form, file_url: e.target.value })} placeholder="https://…" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Type</label>
              <select className="input" value={form.file_type} onChange={(e) => setForm({ ...form, file_type: e.target.value })}>
                <option value="video">Video</option>
                <option value="image">Image</option>
                <option value="document">Document</option>
              </select>
            </div>
            <div>
              <label className="label">Project</label>
              <select required className="input" value={form.project_id} onChange={(e) => setForm({ ...form, project_id: e.target.value })}>
                <option value="">Select a project…</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.project_name}</option>
                ))}
              </select>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
