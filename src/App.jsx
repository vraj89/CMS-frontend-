import { Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Tasks from './pages/Tasks';
import Content from './pages/Content';
import Media from './pages/Media';
import Review from './pages/Review';
import Payments from './pages/Payments';
import Notifications from './pages/Notifications';
import AuditLogs from './pages/AuditLogs';
import { useAuth } from './context/AuthContext';

const ALL = ['marketing', 'admin', 'task_manager', 'content_writer', 'video_editor', 'client'];

function RootRedirect() {
  const { user, isAuthenticated, booting } = useAuth();
  if (booting) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: { fontSize: '14px', borderRadius: '10px', border: '1px solid #E5E7EB', boxShadow: '0 10px 30px rgba(16,24,40,0.08)' },
          success: { iconTheme: { primary: '#10B981', secondary: '#fff' } },
          error: { iconTheme: { primary: '#EF4444', secondary: '#fff' } },
        }}
      />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route element={<ProtectedRoute roles={['marketing', 'admin']} />}>
              <Route path="/clients" element={<Clients />} />
            </Route>
            <Route element={<ProtectedRoute roles={['admin', 'task_manager']} />}>
              <Route path="/projects" element={<Projects />} />
              <Route path="/projects/:id" element={<ProjectDetail />} />
            </Route>
            <Route element={<ProtectedRoute roles={['task_manager', 'content_writer', 'video_editor']} />}>
              <Route path="/tasks" element={<Tasks />} />
            </Route>
            <Route element={<ProtectedRoute roles={['content_writer', 'admin']} />}>
              <Route path="/content" element={<Content />} />
            </Route>
            <Route element={<ProtectedRoute roles={['video_editor', 'admin']} />}>
              <Route path="/media" element={<Media />} />
            </Route>
            <Route element={<ProtectedRoute roles={['client', 'admin']} />}>
              <Route path="/review" element={<Review />} />
            </Route>
            <Route element={<ProtectedRoute roles={['admin', 'client']} />}>
              <Route path="/payments" element={<Payments />} />
            </Route>
            <Route path="/notifications" element={<Notifications />} />
            <Route element={<ProtectedRoute roles={['admin']} />}>
              <Route path="/audit-logs" element={<AuditLogs />} />
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
}
