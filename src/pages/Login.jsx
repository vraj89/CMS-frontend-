import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowRight, BarChart3, CheckCircle2, Loader2, Lock, Mail, ShieldCheck, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { errorMessage } from '../api/axios';

const demoAccounts = [
  { email: 'marketing@prelytix.com', role: 'Marketing', name: 'Riya Shah' },
  { email: 'admin@prelytix.com', role: 'Admin', name: 'Piyush Suthar' },
  { email: 'manager@prelytix.com', role: 'Task Manager', name: 'Kalpesh Jadav' },
  { email: 'writer@prelytix.com', role: 'Content Writer', name: 'Vraj Vaghela' },
  { email: 'video@prelytix.com', role: 'Video Editor', name: 'Aarav Patel' },
  { email: 'client@acme.com', role: 'Client', name: 'John Doe' },
];

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('admin@prelytix.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  const submit = async (e, override) => {
    e?.preventDefault();
    const creds = override || { email, password };
    setLoading(true);
    try {
      const user = await login(creds.email, creds.password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}`);
      navigate(location.state?.from || '/dashboard', { replace: true });
    } catch (err) {
      toast.error(errorMessage(err, 'Unable to sign in'));
    } finally {
      setLoading(false);
    }
  };

  const quick = (account) => {
    setEmail(account.email);
    setPassword('password123');
    submit(null, { email: account.email, password: 'password123' });
  };

  return (
    <div className="flex min-h-screen bg-white">
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-600 p-12 text-white lg:flex">
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-24 right-0 h-96 w-96 rounded-full bg-violet-400/20 blur-3xl" />
        <div className="absolute right-16 top-1/3 h-40 w-40 rounded-full border border-white/20" />

        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-lg font-bold backdrop-blur">P</div>
          <div>
            <p className="text-lg font-semibold leading-none">Prelytix CMS</p>
            <p className="mt-1 text-xs text-indigo-200">Enterprise content operations</p>
          </div>
        </div>

        <div className="relative max-w-md">
          <h1 className="text-4xl font-semibold leading-tight tracking-tight">
            One workspace for every content stakeholder.
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-indigo-100">
            Onboard clients, allocate production work, run client review cycles and track milestone payments — with a
            complete audit trail behind every action.
          </p>
          <ul className="mt-8 space-y-4 text-sm">
            {[
              { icon: Users, text: 'Six purpose-built roles with strict access control' },
              { icon: ShieldCheck, text: 'Client approval portal with versioned revisions' },
              { icon: BarChart3, text: 'Live dashboards, payments and audit logging' },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/15">
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <span className="text-indigo-50">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative flex items-center gap-6 text-xs text-indigo-200">
          <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5" /> Role-based access</span>
          <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5" /> Audit ready</span>
          <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5" /> Demo data seeded</span>
        </div>
      </div>

      <div className="flex w-full items-center justify-center px-4 py-10 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-lg font-bold text-white">P</div>
            <div>
              <p className="text-base font-semibold leading-none text-gray-900">Prelytix CMS</p>
              <p className="mt-1 text-xs text-gray-500">Enterprise content operations</p>
            </div>
          </div>

          <h2 className="text-2xl font-semibold tracking-tight text-gray-900">Sign in to your workspace</h2>
          <p className="mt-1.5 text-sm text-gray-500">Use a demo account below or enter your credentials.</p>

          <form onSubmit={submit} className="mt-7 space-y-4">
            <div>
              <label className="label" htmlFor="email">Email address</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pl-9"
                  placeholder="you@company.com"
                />
              </div>
            </div>
            <div>
              <label className="label" htmlFor="password">Password</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pl-9"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {loading ? 'Signing in…' : 'Sign in'}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>

          <div className="mt-8">
            <div className="flex items-center gap-3">
              <span className="h-px flex-1 bg-gray-200" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Demo quick login</span>
              <span className="h-px flex-1 bg-gray-200" />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {demoAccounts.map((account) => (
                <button
                  key={account.email}
                  type="button"
                  onClick={() => quick(account)}
                  disabled={loading}
                  className="group rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-left transition hover:border-brand-500 hover:bg-indigo-50/50 active:scale-95 disabled:opacity-60"
                >
                  <p className="text-xs font-semibold text-gray-900">{account.role}</p>
                  <p className="mt-0.5 truncate text-[11px] text-gray-500">{account.name}</p>
                </button>
              ))}
            </div>
            <p className="mt-4 text-center text-[11px] text-gray-400">
              All demo accounts use the password <span className="font-medium text-gray-500">password123</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
