import { TbAlertTriangle, TbMoodEmpty } from 'react-icons/tb';
import { errorMessage } from '../services/api.js';

export function Spinner({ label = 'Loading…', small }) {
  return (
    <div className={`spinner-wrap ${small ? 'spinner-small' : ''}`} role="status">
      <span className="spinner" aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </div>
  );
}

/** Grey placeholder cards shown while a grid loads, so the layout doesn't jump. */
export function SkeletonGrid({ count = 6, className = 'card-grid' }) {
  return (
    <div className={className} aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="skeleton-card">
          <div className="skeleton skeleton-img" />
          <div className="skeleton skeleton-line" />
          <div className="skeleton skeleton-line short" />
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ title, children, icon: Icon = TbMoodEmpty }) {
  return (
    <div className="empty-state">
      <Icon aria-hidden="true" />
      <h3>{title}</h3>
      {children && <div className="empty-state-text">{children}</div>}
    </div>
  );
}

export function ErrorState({ error, onRetry }) {
  return (
    <div className="empty-state error-state" role="alert">
      <TbAlertTriangle aria-hidden="true" />
      <h3>We couldn't load this right now</h3>
      <p>{errorMessage(error)}</p>
      {onRetry && (
        <button type="button" className="btn btn-outline btn-sm" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}
