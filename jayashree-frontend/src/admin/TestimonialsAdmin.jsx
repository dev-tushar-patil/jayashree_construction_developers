import { Link } from 'react-router-dom';
import { TbArrowDown, TbArrowUp, TbStarOff } from 'react-icons/tb';
import { Avatar, Stars } from '../components/ReviewCard.jsx';
import { EmptyState, ErrorState, Spinner } from '../components/States.jsx';
import { useFetch } from '../hooks/useFetch.js';
import { useToast } from '../hooks/useToast.jsx';
import { adminApi, errorMessage } from '../services/api.js';
import { Badge, PageHeader } from './ui.jsx';

/**
 * Testimonials are reviews marked "Featured". This page sets their order in the homepage slider.
 * Only approved, visible ones are shown to visitors.
 */
export default function TestimonialsAdmin() {
  const toast = useToast();
  const { data, loading, error, reload, setData } = useFetch(() => adminApi.get('/admin/testimonials').then((r) => r.data), []);

  async function move(index, delta) {
    const list = [...data];
    const target = index + delta;
    if (target < 0 || target >= list.length) return;
    [list[index], list[target]] = [list[target], list[index]];
    setData(list);
    try {
      setData((await adminApi.put('/admin/testimonials/order', { ids: list.map((r) => r.id) })).data);
    } catch (err) {
      toast.error(errorMessage(err));
      reload();
    }
  }

  async function unfeature(review) {
    try {
      await adminApi.patch(`/admin/reviews/${review.id}`, { featured: false });
      toast.success('Removed from testimonials.');
      reload();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }

  return (
    <>
      <PageHeader
        title="Manage Testimonials"
        subtitle="The homepage slider shows reviews marked as Featured, in this order. Feature a review from Manage Reviews."
      >
        <Link to="/admin/reviews?status=APPROVED" className="btn btn-ghost">
          Choose reviews to feature
        </Link>
      </PageHeader>
      {loading && !data && <Spinner />}
      {error && <ErrorState error={error} onRetry={reload} />}
      {data && data.length === 0 && (
        <EmptyState title="No featured reviews">
          Until you feature some, the homepage shows your newest approved reviews. <Link to="/admin/reviews">Go to reviews</Link>
        </EmptyState>
      )}
      {data && data.length > 0 && (
        <ul className="sortable-list">
          {data.map((r, i) => (
            <li key={r.id}>
              <div className="sort-buttons">
                <button type="button" className="icon-btn" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">
                  <TbArrowUp />
                </button>
                <button type="button" className="icon-btn" onClick={() => move(i, 1)} disabled={i === data.length - 1} aria-label="Move down">
                  <TbArrowDown />
                </button>
              </div>
              <Avatar name={r.customerName} photoUrl={r.photoUrl} />
              <div className="sortable-body">
                <strong>
                  {r.customerName} <Stars rating={r.rating} />
                  {(r.status !== 'APPROVED' || !r.visible) && <Badge tone="orange">Not shown: {r.status !== 'APPROVED' ? 'not approved' : 'hidden'}</Badge>}
                </strong>
                <span className="clamp-2">{r.content}</span>
              </div>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => unfeature(r)}>
                <TbStarOff aria-hidden="true" /> Unfeature
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
