import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Check, CheckCircle2, ExternalLink, FileText, RotateCcw, ShieldCheck } from 'lucide-react';
import api, { errorMessage } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';
import { SkeletonCards } from '../components/Skeleton';
import { formatDateTime } from '../utils/format';

function buildItems(content, media) {
  const rows = [
    ...content.map((c) => ({ ...c, entity_type: 'content', creator: c.creator_name, preview: c.body })),
    ...media.map((m) => ({ ...m, entity_type: 'media', creator: m.uploader_name, preview: m.file_url })),
  ];
  return rows.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

export default function Review() {
  const { user } = useAuth();
  const canDecide = user.role === 'client';
  const [content, setContent] = useState([]);
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('pending');
  const [active, setActive] = useState(null);
  const [mode, setMode] = useState(null);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([api.get('/content'), api.get('/media')])
      .then(([c, m]) => {
        setContent(c.data);
        setMedia(m.data);
      })
      .catch((err) => toast.error(errorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const items = useMemo(() => buildItems(content, media), [content, media]);
  const pending = items.filter((i) => i.status === 'submitted_for_review');
  const approved = items.filter((i) => i.status === 'approved');
  const revision = items.filter((i) => i.status === 'revision_requested');
  const list = tab === 'pending' ? pending : tab === 'approved' ? approved : revision;

  const decide = async (item, status, note) => {
    setSubmitting(true);
    try {
      if (status === 'approved') {
        await api.post('/approvals', { entity_type: item.entity_type, entity_id: item.id, status, comments: note });
        toast.success('Approved — creator notified');
      } else {
        await api.post('/revisions', { entity_type: item.entity_type, entity_id: item.id, reason: note });
        toast.success('Revision requested — creator notified');
      }
      setActive(null);
      setMode(null);
      setComment('');
      load();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 to-violet-50 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight text-gray-900">
              <ShieldCheck className="h-5 w-5 text-brand-600" /> Client review portal
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              {canDecide
                ? 'Review each submission, then approve it or send it back with feedback.'
                : 'Read-only view of the client approval queue.'}
            </p>
          </div>
          <div className="flex gap-2 text-center">
            {[
              { label: 'Pending', value: pending.length, tone: 'bg-white text-amber-600' },
              { label: 'Approved', value: approved.length, tone: 'bg-white text-emerald-600' },
              { label: 'Revisions', value: revision.length, tone: 'bg-white text-gray-600' },
            ].map((s) => (
              <div key={s.label} className={`rounded-xl px-4 py-2 shadow-sm ${s.tone}`}>
                <p className="text-lg font-semibold">{s.value}</p>
                <p className="text-[11px] text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-1 border-b border-gray-200">
        {[
          { key: 'pending', label: 'Awaiting review' },
          { key: 'approved', label: 'Approved' },
          { key: 'revision', label: 'Revision requested' },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`border-b-2 px-4 py-2.5 text-sm font-medium transition ${
              tab === t.key ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <SkeletonCards count={2} />
      ) : list.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title={tab === 'pending' ? 'Nothing waiting for review' : 'No items here yet'}
          message={tab === 'pending' ? 'Submitted content and media will appear here for approval.' : 'Items will show up once they move through review.'}
        />
      ) : (
        <div className="space-y-5">
          {list.map((item) => (
            <article key={`${item.entity_type}-${item.id}`} className="card overflow-hidden">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 px-5 py-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-gray-600">
                      {item.entity_type}
                    </span>
                    <h3 className="text-base font-semibold text-gray-900">{item.title}</h3>
                    <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-brand-600">v{item.version}</span>
                    <Badge status={item.status} />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    {item.project_name} · submitted by {item.creator} · {formatDateTime(item.created_at)}
                  </p>
                </div>
                {item.entity_type === 'media' && (
                  <a href={item.file_url} target="_blank" rel="noreferrer" className="text-xs font-medium text-brand-600 hover:underline">
                    <span className="inline-flex items-center gap-1">Open asset <ExternalLink className="h-3 w-3" /></span>
                  </a>
                )}
              </div>

              <div className="px-5 py-4">
                {item.entity_type === 'content' ? (
                  <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-4">
                    <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                      <FileText className="h-3.5 w-3.5" /> Copy preview
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-gray-700">{item.preview || 'No body provided.'}</p>
                  </div>
                ) : item.file_type === 'image' ? (
                  <img src={item.preview} alt={item.title} className="max-h-[360px] w-full rounded-xl border border-gray-100 object-contain" />
                ) : item.file_type === 'video' ? (
                  <video src={item.preview} controls className="max-h-[420px] w-full rounded-xl bg-black" />
                ) : (
                  <div className="rounded-xl border border-dashed border-gray-200 px-4 py-8 text-center text-sm text-gray-500">
                    Document submitted — <a className="text-brand-600 hover:underline" href={item.preview} target="_blank" rel="noreferrer">open the file</a>
                  </div>
                )}
              </div>

              {canDecide && item.status === 'submitted_for_review' && (
                <div className="border-t border-gray-100 bg-gray-50/40 px-5 py-4">
                  {active === item.id ? (
                    <div className="space-y-3">
                      <label className="text-xs font-medium text-gray-600">
                        {mode === 'approved' ? 'Add an approval note (optional)' : 'What needs to change?'}
                      </label>
                      <textarea
                        rows={3}
                        autoFocus
                        className="input"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder={mode === 'approved' ? 'Looks great — approved for publishing.' : 'Please adjust the headline and add the pricing section…'}
                      />
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          disabled={submitting || (mode === 'revision' && !comment.trim())}
                          onClick={() => decide(item, mode, comment)}
                          className={mode === 'approved' ? 'btn-success' : 'btn-warning'}
                        >
                          {submitting ? 'Sending…' : mode === 'approved' ? 'Confirm approval' : 'Send revision request'}
                        </button>
                        <button onClick={() => { setActive(null); setMode(null); setComment(''); }} className="btn-secondary">
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => { setActive(item.id); setMode('approved'); setComment(''); }} className="btn-success">
                        <Check className="h-4 w-4" /> Approve
                      </button>
                      <button onClick={() => { setActive(item.id); setMode('revision'); setComment(''); }} className="btn-warning">
                        <RotateCcw className="h-4 w-4" /> Request revision
                      </button>
                    </div>
                  )}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
