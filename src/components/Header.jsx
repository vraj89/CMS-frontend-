import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bell, ChevronDown, LogOut, Menu, Search } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { initials, roleLabels } from '../utils/format';

const titles = {
  dashboard: 'Dashboard',
  clients: 'Clients',
  projects: 'Projects',
  tasks: 'Tasks',
  content: 'Content Studio',
  media: 'Media Library',
  review: 'Client Review Portal',
  payments: 'Payments',
  notifications: 'Notifications',
  'audit-logs': 'Audit Logs',
};

export default function Header({ onMenu }) {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const segment = pathname.split('/')[1] || 'dashboard';
  const section = titles[segment] || 'Workspace';

  useEffect(() => {
    let active = true;
    const load = () =>
      api
        .get('/notifications')
        .then(({ data }) => active && setUnread(data.filter((n) => !n.is_read).length))
        .catch(() => {});
    load();
    const timer = setInterval(load, 30000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [pathname]);

  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-gray-200 bg-white/90 px-4 backdrop-blur sm:px-6">
      <button onClick={onMenu} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden" aria-label="Open menu">
        <Menu className="h-5 w-5" />
      </button>

      <div className="min-w-0 flex-1">
        <nav className="flex items-center gap-1.5 text-xs text-gray-400">
          <span>Prelytix</span>
          <span>/</span>
          <span className="font-medium text-gray-600">{section}</span>
        </nav>
        <h1 className="truncate text-[15px] font-semibold text-gray-900">{section}</h1>
      </div>

      <div className="hidden items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-400 md:flex">
        <Search className="h-3.5 w-3.5" />
        <span>Search…</span>
        <kbd className="rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[10px] text-gray-400">⌘K</kbd>
      </div>

      <span className="hidden rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium capitalize text-gray-600 sm:inline-flex">
        {roleLabels[user?.role] || 'Member'}
      </span>

      <Link
        to="/notifications"
        className="relative rounded-lg p-2 text-gray-500 transition hover:bg-gray-100"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
          </span>
        )}
      </Link>

      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="flex items-center gap-2 rounded-full border border-gray-200 bg-white py-1 pl-1 pr-2 transition hover:bg-gray-50"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-[11px] font-semibold text-white">
            {initials(user?.name)}
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
        </button>
        {menuOpen && (
          <div className="absolute right-0 mt-2 w-56 animate-toastIn overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
            <div className="border-b border-gray-100 px-4 py-3">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="truncate text-xs text-gray-500">{user?.email}</p>
              <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-brand-600">{roleLabels[user?.role]}</p>
            </div>
            <button
              onClick={() => {
                logout();
                navigate('/login', { replace: true });
              }}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-gray-600 transition hover:bg-gray-50"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
