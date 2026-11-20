import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Banknote, CheckCircle2, Clock, Plus, Wallet } from 'lucide-react';
import api, { errorMessage } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import { SkeletonTable } from '../components/Skeleton';
import { currency, formatDate } from '../utils/format';

export default function Payments() {
  const { user } = useAuth();
  const isAdmin = user.role === 'admin';
  const [payments, setPayments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ project_id: '', milestone: '', amount: '', due_date: '' });

  const load = () => {
    setLoading(true);
    api
      .get('/payments')
      .then(({ data }) => setPayments(data))
      .catch((err) => toast.error(errorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    if (isAdmin) api.get('/projects').then(({ data }) => setProjects(data)).catch(() => {});
  }, [isAdmin]);

  const markPaid = async (payment) => {
    try {
      await api.patch(`/payments/${payment.id}/mark-paid`);
      toast.success(`${payment.milestone} marked as paid`);
      load();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const create = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/payments', form);
      toast.success('Milestone added');
      setOpen(false);
      setForm({ project_id: '', milestone: '', amount: '', due_date: '' });
      load();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const total = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const paid = payments.filter((p) => p.status === 'paid').reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const outstanding = total - paid;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-gray-900">Payments</h2>
          <p className="mt-1 text-sm text-gray-500">
            {isAdmin ? 'Track milestone invoices and confirm collections.' : 'Your project milestone schedule.'}
          </p>
        </div>
        {isAdmin && (
          <button onClick={() => setOpen(true)} className="btn-primary">
            <Plus className="h-4 w-4" /> Add milestone
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: 'Total contracted', value: currency(total), icon: Wallet, tone: 'bg-indigo-50 text-indigo-600' },
          { label: 'Collected', value: currency(paid), icon: CheckCircle2, tone: 'bg-emerald-50 text-emerald-600' },
          { label: 'Outstanding', value: currency(outstanding), icon: Clock, tone: 'bg-amber-50 text-amber-600' },
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
      ) : payments.length === 0 ? (
        <EmptyState icon={Banknote} title="No milestones yet" message={isAdmin ? 'Add the first payment milestone for a project.' : 'Milestones will appear once the agency schedules them.'} />
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="hidden w-full text-left text-sm md:table">
            <thead className="border-b border-gray-100 bg-gray-50/60">
              <tr>
                <th className="table-head px-5 py-3">Milestone</th>
                <th className="table-head px-5 py-3">Project</th>
                <th className="table-head px-5 py-3">Amount</th>
                <th className="table-head px-5 py-3">Due</th>
                <th className="table-head px-5 py-3">Paid on</th>
                <th className="table-head px-5 py-3">Status</th>
                {isAdmin && <th className="table-head px-5 py-3 text-right">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/70">
                  <td className="px-5 py-3.5 font-medium text-gray-900">{p.milestone}</td>
                  <td className="px-5 py-3.5 text-gray-600">{p.project_name}</td>
                  <td className="px-5 py-3.5 font-medium text-gray-900">{currency(p.amount)}</td>
                  <td className="px-5 py-3.5 text-gray-500">{formatDate(p.due_date)}</td>
                  <td className="px-5 py-3.5 text-gray-500">{formatDate(p.paid_date)}</td>
                  <td className="px-5 py-3.5"><Badge status={p.status} /></td>
                  {isAdmin && (
                    <td className="px-5 py-3.5 text-right">
                      {p.status === 'paid' ? (
                        <span className="text-xs text-gray-400">Settled</span>
                      ) : (
                        <button onClick={() => markPaid(p)} className="btn-success px-3 py-1.5 text-xs">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Mark paid
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          <div className="divide-y divide-gray-50 md:hidden">
            {payments.map((p) => (
              <div key={p.id} className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{p.milestone}</p>
                    <p className="text-xs text-gray-500">{p.project_name} · due {formatDate(p.due_date)}</p>
                  </div>
                  <Badge status={p.status} />
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-900">{currency(p.amount)}</span>
                  {isAdmin && p.status !== 'paid' && (
                    <button onClick={() => markPaid(p)} className="btn-success px-3 py-1.5 text-xs">Mark paid</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Add a payment milestone"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setOpen(false)}>Cancel</button>
            <button form="payment-form" type="submit" disabled={saving} className="btn-primary">{saving ? 'Adding…' : 'Add milestone'}</button>
          </>
        }
      >
        <form id="payment-form" onSubmit={create} className="space-y-4">
          <div>
            <label className="label">Project</label>
            <select required className="input" value={form.project_id} onChange={(e) => setForm({ ...form, project_id: e.target.value })}>
              <option value="">Select a project…</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.project_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Milestone</label>
            <input required className="input" value={form.milestone} onChange={(e) => setForm({ ...form, milestone: e.target.value })} placeholder="Design sign-off — 35%" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Amount (₹)</label>
              <input required type="number" min="0" className="input" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="29750" />
            </div>
            <div>
              <label className="label">Due date</label>
              <input type="date" className="input" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
