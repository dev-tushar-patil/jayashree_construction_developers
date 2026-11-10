import { useEffect, useState } from 'react';
import { Link, NavLink, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  TbAddressBook,
  TbBuildingEstate,
  TbExternalLink,
  TbLayoutDashboard,
  TbLock,
  TbLogout,
  TbMenu2,
  TbMessages,
  TbPhoto,
  TbQuote,
  TbShare,
  TbStar,
  TbTool,
  TbWriting,
  TbX,
} from 'react-icons/tb';
import { Spinner } from '../components/States.jsx';
import { useAuth } from '../hooks/useAuth.jsx';

const MENU = [
  { to: '/admin', label: 'Dashboard', Icon: TbLayoutDashboard, end: true },
  { to: '/admin/projects', label: 'Manage Projects', Icon: TbBuildingEstate },
  { to: '/admin/gallery', label: 'Manage Gallery', Icon: TbPhoto },
  { to: '/admin/services', label: 'Manage Services', Icon: TbTool },
  { to: '/admin/reviews', label: 'Manage Reviews', Icon: TbStar },
  { to: '/admin/enquiries', label: 'Manage Enquiries', Icon: TbMessages },
  { to: '/admin/testimonials', label: 'Manage Testimonials', Icon: TbQuote },
  { to: '/admin/content', label: 'Manage Website Content', Icon: TbWriting },
  { to: '/admin/contact', label: 'Contact Information', Icon: TbAddressBook },
  { to: '/admin/social', label: 'Social Media Settings', Icon: TbShare },
  { to: '/admin/password', label: 'Change Password', Icon: TbLock },
];

/** Protected shell: anyone without a valid admin token is sent to /admin/login. */
export default function AdminLayout() {
  const { admin, checking, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => setOpen(false), [location.pathname]);
  useEffect(() => {
    document.title = 'Admin | Jayashree Construction & Developers';
  }, [location.pathname]);

  if (checking) return <Spinner label="Checking your session…" />;
  if (!admin) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;

  async function signOut() {
    await logout();
    navigate('/admin/login', { replace: true });
  }

  return (
    <div className={`admin ${open ? 'sidebar-open' : ''}`}>
      <aside className="admin-sidebar" aria-label="Admin menu">
        <div className="admin-brand">
          <img src="/images/brand/favicon.png" alt="" width="40" height="40" />
          <div>
            <strong>Jayashree</strong>
            <span>Admin Panel</span>
          </div>
          <button type="button" className="icon-btn admin-close" onClick={() => setOpen(false)} aria-label="Close menu">
            <TbX />
          </button>
        </div>
        <nav>
          <ul>
            {MENU.map(({ to, label, Icon, end }) => (
              <li key={to}>
                <NavLink to={to} end={end}>
                  <Icon aria-hidden="true" /> {label}
                </NavLink>
              </li>
            ))}
            <li>
              <button type="button" onClick={signOut}>
                <TbLogout aria-hidden="true" /> Logout
              </button>
            </li>
          </ul>
        </nav>
      </aside>
      {open && <button type="button" className="admin-backdrop" aria-label="Close menu" onClick={() => setOpen(false)} />}

      <div className="admin-main">
        <header className="admin-topbar">
          <button type="button" className="icon-btn admin-menu-btn" onClick={() => setOpen(true)} aria-label="Open menu">
            <TbMenu2 />
          </button>
          <Link to="/" target="_blank" className="admin-view-site">
            View website <TbExternalLink aria-hidden="true" />
          </Link>
          <div className="admin-user">
            <span className="admin-avatar" aria-hidden="true">
              {(admin.displayName || admin.username || 'A')[0].toUpperCase()}
            </span>
            <div>
              <strong>{admin.displayName}</strong>
              <span>{admin.email}</span>
            </div>
          </div>
        </header>
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
