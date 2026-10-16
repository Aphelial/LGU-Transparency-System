import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Protected } from './auth';
import PageTransition from './components/PageTransition';
import Spinner from './components/Spinner';

const PublicLayout = lazy(() => import('./layouts/PublicLayout'));
const AdminLayout = lazy(() => import('./layouts/AdminLayout'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Projects = lazy(() => import('./pages/Projects'));
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'));
const Budgets = lazy(() => import('./pages/Budgets'));
const Announcements = lazy(() => import('./pages/Announcements'));
const AnnouncementDetail = lazy(() => import('./pages/AnnouncementDetail'));
const NotFound = lazy(() => import('./pages/Shared').then((module) => ({ default: module.NotFound })));
const Unauthorized = lazy(() => import('./pages/Shared').then((module) => ({ default: module.Unauthorized })));
const Login = lazy(() => import('./pages/admin/Login'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminBudgets = lazy(() => import('./pages/admin/AdminBudgets'));
const AdminProjects = lazy(() => import('./pages/admin/AdminProjects'));
const AdminProjectDetail = lazy(() => import('./pages/admin/AdminProjectDetail'));
const ProjectForm = lazy(() => import('./pages/admin/ProjectForm'));
const Expenses = lazy(() => import('./pages/admin/Expenses'));
const AdminAnnouncements = lazy(() => import('./pages/admin/AdminAnnouncements'));
const AnnouncementForm = lazy(() => import('./pages/admin/AnnouncementForm'));
 
export default function App() {
  return (
    <Suspense fallback={<div className="grid min-h-screen place-items-center" role="status"><Spinner /></div>}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/budgets" element={<Budgets />} />
          <Route path="/announcements" element={<Announcements />} />
          <Route path="/announcements/:id" element={<AnnouncementDetail />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route path="/admin/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/admin" element={<Protected><AdminLayout /></Protected>}>
          <Route index element={<AdminDashboard />} />
          <Route path="budgets" element={<AdminBudgets />} />
          <Route path="projects" element={<AdminProjects />} />
          <Route path="projects/create" element={<ProjectForm />} />
          <Route path="projects/:id" element={<AdminProjectDetail />} />
          <Route path="projects/:id/edit" element={<ProjectForm />} />
          <Route path="projects/:id/expenses" element={<Expenses />} />
          <Route path="announcements" element={<AdminAnnouncements />} />
          <Route path="announcements/create" element={<AnnouncementForm />} />
          <Route path="announcements/:id/edit" element={<AnnouncementForm />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
