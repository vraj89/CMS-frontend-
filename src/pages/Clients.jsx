import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Building2, CheckCircle2, Plus, Search, ShieldAlert, XCircle } from 'lucide-react';
import api, { errorMessage } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import { SkeletonTable } from '../components/Skeleton';
import { formatDate } from '../utils/format';

const blank = { company_name: '', contact_person: '', email: '', phone: '', industry: '' };

export default function Clients() {
  const { user } = useAuth();
  const isAdmin = user.role === 'admin';
  const isMarketing = user.role === 'marketing';
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api
      .get('/clients')
      .then(({ data }) => setClients(data))
      .catch((err) => toast.error(errorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const create = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/clients', form);
      toast.success('Client onboarded — awaiting admin verification');
      setOpen(false);
      setForm(blank);
      load();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const verify = async (client) => {
    try {
      await api.patch(`/clients/${client.id}/verify`);
      toast.success(`${client.company_name} verified`);
      load();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const reject = async (client) => {
    if (!window.confirm(`Reject ${client.company_name}?`)) return;
    try {
      await api.patch(`/clients/${client.id}/reject`);
      toast.success(`${client.company_name} rejected`);
      load();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const filtered = clients.filter((c) =>
    `${c.company_name} ${c.contact_person} ${c.email} ${c.industry}`.toLowerCase().includes(query.toLowerCase()),
  );
  const pending = clients.filter((c) => c.status === 'pending_verification').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-gray-900">Client accounts</h2>
          <p className="mt-1 text-sm text-gray-500">
            {isAdmin ? 'Verify new accounts before projects can be created.' : 'Onboard new clients for the agency.'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search clients…"
              className="input w-full pl-9 sm:w-64"
            />
          </div>
          {isMarketing && (
            <button onClick={() => setOpen(true)} className="btn-primary">
              <Plus className="h-4 w-4" /> Add client
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: 'Total clients', value: clients.length, icon: Building2, tone: 'text-indigo-600 bg-indigo-50' },
          { label: 'Active accounts', value: clients.filter((c) => c.status === 'active').length, icon: CheckCircle2, tone: 'text-emerald-600 bg-emerald-50' },
          { label: 'Pending verification', value: pending, icon: ShieldAlert, tone: 'text-amber-600 bg-amber-50' },
        ].map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="card flex items-center gap-4 p-4">
            <span className={`flex h-10 w-10 items-center justify-center rounded-full ${tone}`}>
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-lg font-semibold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {loading ? (
        <SkeletonTable />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No clients found"
          message={isMarketing ? 'Onboard your first client to get started.' : 'Clients onboarded by marketing will appear here.'}
          action={isMarketing ? <button onClick={() => setOpen(true)} className="btn-primary"><Plus className="h-4 w-4" /> Add client</button> : null}
        />
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-xl border border-gray-200 bg-white md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-100 bg-gray-50/60">
                <tr>
                  <th className="table-head px-5 py-3">Company</th>
                  <th className="table-head px-5 py-3">Contact</th>
                  <th className="table-head px-5 py-3">Industry</th>
                  <th className="table-head px-5 py-3">Projects</th>
                  <th className="table-head px-5 py-3">Status</th>
                  <th className="table-head px-5 py-3">Onboarded</th>
                  {isAdmin && <th className="table-head px-5 py-3 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((client) => (
                  <tr key={client.id} className="transition hover:bg-gray-50/70">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-gray-900">{client.company_name}</p>
                      <p className="text-xs text-gray-500">{client.email}</p>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">
                      <p>{client.contact_person}</p>
                      <p className="text-xs text-gray-400">{client.phone || '—'}</p>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">{client.industry || '—'}</td>
                    <td className="px-5 py-3.5 text-gray-600">{client.project_count ?? 0}</td>
                    <td className="px-5 py-3.5"><Badge status={client.status} /></td>
                    <td className="px-5 py-3.5 text-gray-500">{formatDate(client.created_at)}</td>
                    {isAdmin && (
                      <td className="px-5 py-3.5">
                        <div className="flex justify-end gap-2">
                          {client.status === 'pending_verification' && (
                            <>
                              <button onClick={() => verify(client)} className="btn-success px-3 py-1.5 text-xs">
                                <CheckCircle2 className="h-3.5 w-3.5" /> Verify
                              </button>
                              <button onClick={() => reject(client)} className="btn-secondary px-3 py-1.5 text-xs text-red-600">
                                <XCircle className="h-3.5 w-3.5" /> Reject
                              </button>
                            </>
                          )}
                          {client.status !== 'pending_verification' && <span className="text-xs text-gray-400">—</span>}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 md:hidden">
            {filtered.map((client) => (
              <div key={client.id} className="card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-gray-900">{client.company_name}</p>
                    <p className="text-xs text-gray-500">{client.contact_person} · {client.email}</p>
                  </div>
                  <Badge status={client.status} />
                </div>
                <p className="mt-2 text-xs text-gray-500">{client.industry || 'General'} · {client.project_count ?? 0} projects</p>
                {isAdmin && client.status === 'pending_verification' && (
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => verify(client)} className="btn-success flex-1 py-1.5 text-xs">Verify</button>
                    <button onClick={() => reject(client)} className="btn-secondary flex-1 py-1.5 text-xs text-red-600">Reject</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Onboard a new client"
        description="New clients stay pending until an admin verifies them."
        footer={
          <>
            <button className="btn-secondary" onClick={() => setOpen(false)}>Cancel</button>
            <button form="client-form" type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving…' : 'Create client'}
            </button>
          </>
        }
      >
        <form id="client-form" onSubmit={create} className="space-y-4">
          <div>
            <label className="label">Company name</label>
            <input required className="input" value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} placeholder="Beta Industries" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Contact person</label>
              <input required className="input" value={form.contact_person} onChange={(e) => setForm({ ...form, contact_person: e.target.value })} placeholder="Priya Mehta" />
            </div>
            <div>
              <label className="label">Email</label>
              <input required type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="priya@beta.com" />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Phone</label>
              <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 98250 00000" />
            </div>
            <div>
              <label className="label">Industry</label>
              <input className="input" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} placeholder="Manufacturing" />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
