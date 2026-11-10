import { Link } from 'react-router-dom';
import { TbHomeQuestion } from 'react-icons/tb';
import { usePageMeta } from '../hooks/usePageMeta.js';

export default function NotFound({ what = 'page' }) {
  usePageMeta('Page not found');
  return (
    <section className="section not-found">
      <div className="container narrow center-text">
        <TbHomeQuestion className="not-found-icon" aria-hidden="true" />
        <h1>We couldn't find that {what}</h1>
        <p className="lead">It may have been moved or is no longer available.</p>
        <div className="hero-actions center">
          <Link to="/" className="btn btn-primary">
            Back to Home
          </Link>
          <Link to="/projects" className="btn btn-outline">
            View Projects
          </Link>
        </div>
      </div>
    </section>
  );
}
