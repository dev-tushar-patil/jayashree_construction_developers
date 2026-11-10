import { Link } from 'react-router-dom';
import { TbLock } from 'react-icons/tb';
import { usePageMeta } from '../hooks/usePageMeta.js';

/** Shown at /admin on the static preview, which has no server for the admin panel to talk to. */
export default function PreviewAdminNotice() {
  usePageMeta('Admin');
  return (
    <section className="section not-found">
      <div className="container narrow center-text">
        <TbLock className="not-found-icon" aria-hidden="true" />
        <h1>The admin panel isn't part of this preview</h1>
        <p className="lead">This is a demo of the public website. The secure admin panel runs on the live server once the site is hosted.</p>
        <div className="hero-actions center">
          <Link to="/" className="btn btn-primary">
            Back to Home
          </Link>
        </div>
      </div>
    </section>
  );
}
