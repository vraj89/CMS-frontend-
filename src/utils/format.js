export const roleLabels = {
  marketing: 'Marketing',
  admin: 'Admin',
  task_manager: 'Task Manager',
  content_writer: 'Content Writer',
  video_editor: 'Video Editor',
  client: 'Client',
};

export const menuByRole = {
  marketing: ['dashboard', 'clients'],
  admin: ['dashboard', 'clients', 'projects', 'payments', 'audit-logs'],
  task_manager: ['dashboard', 'projects', 'tasks'],
  content_writer: ['dashboard', 'tasks', 'content'],
  video_editor: ['dashboard', 'tasks', 'media'],
  client: ['dashboard', 'review', 'payments'],
};

export function canAccess(role, path) {
  const key = path.replace('/', '');
  return (menuByRole[role] || []).includes(key);
}

export function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatDateTime(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export function timeAgo(value) {
  if (!value) return '';
  const diff = Date.now() - new Date(value).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(value);
}

export function currency(value) {
  return `₹${Number(value || 0).toLocaleString('en-IN')}`;
}

export function statusLabel(status) {
  return String(status || '').replaceAll('_', ' ');
}

export function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('');
}

export function taskStatusOrder(status) {
  return { pending: 0, in_progress: 1, submitted: 2, approved: 3 }[status] ?? 0;
}
