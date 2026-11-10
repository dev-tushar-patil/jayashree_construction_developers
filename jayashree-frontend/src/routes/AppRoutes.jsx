import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Spinner } from '../components/States.jsx';
import { IS_PREVIEW } from '../services/api.js';
import PreviewAdminNotice from '../pages/PreviewAdminNotice.jsx';
import SiteLayout from '../layouts/SiteLayout.jsx';
import About from '../pages/About.jsx';
import Contact from '../pages/Contact.jsx';
import Gallery from '../pages/Gallery.jsx';
import Home from '../pages/Home.jsx';
import NotFound from '../pages/NotFound.jsx';
import ProjectDetails from '../pages/ProjectDetails.jsx';
import Projects from '../pages/Projects.jsx';
import Quote from '../pages/Quote.jsx';
import Reviews from '../pages/Reviews.jsx';
import ServiceDetails from '../pages/ServiceDetails.jsx';
import Services from '../pages/Services.jsx';

// The admin panel is loaded only when someone opens /admin, so visitors never download it.
const AdminRoot = lazy(() => import('../admin/AdminRoot.jsx'));

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="projects" element={<Projects />} />
        <Route path="projects/:slug" element={<ProjectDetails />} />
        <Route path="services" element={<Services />} />
        <Route path="services/:slug" element={<ServiceDetails />} />
        <Route path="gallery" element={<Gallery />} />
        <Route path="reviews" element={<Reviews />} />
        <Route path="contact" element={<Contact />} />
        <Route path="get-a-quote" element={<Quote />} />
        <Route path="*" element={<NotFound />} />
      </Route>
      {IS_PREVIEW ? (
        <Route element={<SiteLayout />}>
          <Route path="admin/*" element={<PreviewAdminNotice />} />
        </Route>
      ) : (
        <Route
          path="admin/*"
          element={
            <Suspense fallback={<Spinner label="Loading admin panel…" />}>
              <AdminRoot />
            </Suspense>
          }
        />
      )}
    </Routes>
  );
}
