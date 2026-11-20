import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  FolderKanban,
  ListChecks,
  FileText,
  Clapperboard,
  ShieldCheck,
  Wallet,
  Bell,
  ScrollText,
  LogOut,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { menuByRole, roleLabels } from '../utils/format';

export const navItems = {
  dashboard: { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
  clients: { label: 'Clients', icon: Building2, to: '/clients' },
  projects: { label: 'Projects', icon: FolderKanban, to: '/projects' },
  tasks: { label: 'Tasks', icon: ListChecks, to: '/tasks' },
  content: { label: 'Content', icon: FileText, to: '/content' },
  media: { label: 'Media', icon: Clapperboard, to: '/media' },
  review: { label: 'Client Review', icon: ShieldCheck, to: '/review' },
  payments: { label: 'Payments', icon: Wallet, to: '/payments' },
  notifications: { label: 'Notifications', icon: Bell, to: '/notifications' },
  'audit-logs': { label: 'Audit Logs', icon: ScrollText, to: '/audit-logs' },
};

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const items = (menuByRole[user?.role] || []).map((key) => navItems[key]).filter(Boolean);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-gray-900/40 backdrop-blur-sm transition-opacity lg:hidden ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[260px] flex-col border-r border-gray-200 bg-white transition-transform duration-300 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between gap-2 border-b border-gray-100 px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">P</div>
            <div>
              <p className="text-sm font-semibold leading-none text-gray-900">Prelytix</p>
              <p className="mt-1 text-[11px] leading-none text-gray-400">Content Operations</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 lg:hidden" aria-label="Close menu">
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Workspace</p>
          {items.map(({ label, icon: Icon, to }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive ? 'bg-indigo-50 text-brand-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <span className="absolute inset-y-1.5 left-0 w-1 rounded-r bg-brand-600" />}
                  <Icon className={`h-[18px] w-[18px] ${isActive ? 'text-brand-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                  {label}
                </>
              )}
            </NavLink>
          ))}

          <div className="mt-6 border-t border-gray-100 pt-3">
            <NavLink
              to="/notifications"
              className={({ isActive }) =>
                `group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive ? 'bg-indigo-50 text-brand-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <Bell className="h-[18px] w-[18px] text-gray-400 group-hover:text-gray-600" />
              Notifications
            </NavLink>
          </div>
        </nav>

        <div className="border-t border-gray-100 p-4">
          <div className="rounded-xl bg-gray-50 p-3">
            <p className="text-xs font-medium text-gray-900">{roleLabels[user?.role] || 'Member'}</p>
            <p className="mt-0.5 truncate text-xs text-gray-500">{user?.email}</p>
            <button
              onClick={handleLogout}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 transition hover:bg-gray-50 active:scale-95"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
