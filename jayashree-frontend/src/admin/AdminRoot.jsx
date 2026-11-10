import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../hooks/useAuth.jsx';
import '../styles/admin.css';
import AdminLayout from './AdminLayout.jsx';
import AdminLogin from './AdminLogin.jsx';
import ContactAdmin from './ContactAdmin.jsx';
import ContentAdmin from './ContentAdmin.jsx';
import Dashboard from './Dashboard.jsx';
import EnquiriesAdmin from './EnquiriesAdmin.jsx';
import GalleryAdmin from './GalleryAdmin.jsx';
import PasswordAdmin from './PasswordAdmin.jsx';
import ProjectEditor from './ProjectEditor.jsx';
import ProjectsAdmin from './ProjectsAdmin.jsx';
import ReviewsAdmin from './ReviewsAdmin.jsx';
import ServicesAdmin from './ServicesAdmin.jsx';
import SocialAdmin from './SocialAdmin.jsx';
import TestimonialsAdmin from './TestimonialsAdmin.jsx';

/** Everything under /admin. All routes except /admin/login require a signed-in admin (see AdminLayout). */
export default function AdminRoot() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="login" element={<AdminLogin />} />
        <Route element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="projects" element={<ProjectsAdmin />} />
          <Route path="projects/new" element={<ProjectEditor />} />
          <Route path="projects/:id" element={<ProjectEditor />} />
          <Route path="gallery" element={<GalleryAdmin />} />
          <Route path="services" element={<ServicesAdmin />} />
          <Route path="reviews" element={<ReviewsAdmin />} />
          <Route path="testimonials" element={<TestimonialsAdmin />} />
          <Route path="enquiries" element={<EnquiriesAdmin />} />
          <Route path="content" element={<ContentAdmin />} />
          <Route path="contact" element={<ContactAdmin />} />
          <Route path="social" element={<SocialAdmin />} />
          <Route path="password" element={<PasswordAdmin />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
