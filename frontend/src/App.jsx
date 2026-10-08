import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import Home from './pages/Home';
import ProjectDetails from './pages/ProjectDetails';
import NotFound from './pages/NotFound';
import { PageSpinner } from './components/ui';

// The admin area is only needed by the site owner, so it is split into its own chunks.
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminLayout = lazy(() => import('./layouts/AdminLayout'));
const Overview = lazy(() => import('./pages/admin/Overview'));
const AboutAdmin = lazy(() => import('./pages/admin/AboutAdmin'));
const SkillsAdmin = lazy(() => import('./pages/admin/SkillsAdmin'));
const ProjectsAdmin = lazy(() => import('./pages/admin/ProjectsAdmin'));
const MessagesAdmin = lazy(() => import('./pages/admin/MessagesAdmin'));
const SocialAdmin = lazy(() => import('./pages/admin/SocialAdmin'));
const ResumeAdmin = lazy(() => import('./pages/admin/ResumeAdmin'));
const SettingsAdmin = lazy(() => import('./pages/admin/SettingsAdmin'));

export default function App() {
  return (
    <Suspense fallback={<PageSpinner />}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="projects/:slug" element={<ProjectDetails />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/dashboard" element={<AdminLayout />}>
          <Route index element={<Overview />} />
          <Route path="about" element={<AboutAdmin />} />
          <Route path="skills" element={<SkillsAdmin />} />
          <Route path="projects" element={<ProjectsAdmin />} />
          <Route path="messages" element={<MessagesAdmin />} />
          <Route path="social" element={<SocialAdmin />} />
          <Route path="resume" element={<ResumeAdmin />} />
          <Route path="settings" element={<SettingsAdmin />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
