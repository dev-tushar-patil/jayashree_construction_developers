import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { TbCheck, TbEdit, TbEye, TbEyeOff, TbPlus, TbSearch, TbStar, TbStarFilled, TbTrash, TbX } from 'react-icons/tb';
import Field from '../components/Field.jsx';
import { Avatar, Stars } from '../components/ReviewCard.jsx';
import { EmptyState, ErrorState, Spinner } from '../components/States.jsx';
import { useFetch } from '../hooks/useFetch.js';
import { useToast } from '../hooks/useToast.jsx';
import { adminApi, errorMessage, fieldErrors } from '../services/api.js';
import { REVIEW_STATUS, formatDate } from '../services/labels.js';
import { Badge, ImageUploadField, Modal, PageHeader, Pagination, StarRatingInput, Toggle, useConfirm } from './ui.jsx';

const TONE = { APPROVED: 'green', PENDING: 'orange', REJECTED: 'neutral' };
const today = () => new Date().toISOString().slice(0, 10);

function ReviewModal({ review, onClose, onSaved }) {
  const { data: projects } = useFetch(() => adminApi.get('/admin/projects/options').then((r) => r.data), []);
  const [form, setForm] = useState(
    review
      ? { ...review, photoUrl: review.photoUrl || '', projectId: review.projectId || '', projectName: review.projectName || '' }
      : { customerName: '', photoUrl: '', rating: 5, content: '', projectId: '', projectName: '', reviewDate: today(), status: 'APPROVED', featured: false, visible: true },
  );
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e?.target ? e.target.value : e }));

  async function save() {
    const found = {};
    if (!form.customerName.trim()) found.customerName = "Please enter the customer's name.";
    if (!form.content.trim()) found.content = 'Please enter the review.';
    setErrors(found);
    if (Object.keys(found).length) return;
    setBusy(true);
    const body = {
      customerName: form.customerName,
      photoUrl: form.photoUrl,
      rating: form.rating,
      content: form.content,
      projectId: form.projectId ? Number(form.projectId) : null,
      projectName: form.projectId ? null : form.projectName,
      reviewDate: form.reviewDate || null,
      status: form.status,
      featured: form.featured,
      visible: form.visible,
    };
    try {
      const { data } = review ? await adminApi.put(`/admin/reviews/${review.id}`, body) : await adminApi.post('/admin/reviews', body);
      onSaved(data, !review);
    } catch (err) {
      setErrors(fieldErrors(err));
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <Modal
      title={review ? 'Edit Review' : 'Add Review'}
      onClose={onClose}
      size="lg"
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={save} disabled={busy}>
            {busy ? 'Saving…' : 'Save Review'}
          </button>
        </>
      }
    >
      <div className="form-grid">
        <Field label="Customer Name" required value={form.customerName} onChange={set('customerName')} error={errors.customerName} maxLength={120} />
        <div className="field">
          <span className="field-label">Rating</span>
          <StarRatingInput value={form.rating} onChange={set('rating')} />
        </div>
        <Field label="Review" required as="textarea" rows={5} value={form.content} onChange={set('content')} error={errors.content} maxLength={2000} className="span-2" />
        <Field label="Project" as="select" value={form.projectId} onChange={set('projectId')} hint="Link to one of your projects, or type a name below.">
          <option value="">— Not linked —</option>
          {(projects || []).map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </Field>
        <Field label="Project name (if not linked)" value={form.projectName} onChange={set('projectName')} disabled={Boolean(form.projectId)} maxLength={150} />
        <Field label="Review Date" type="date" value={form.reviewDate || ''} onChange={set('reviewDate')} />
        <Field label="Status" as="select" value={form.status} onChange={set('status')}>
          {Object.entries(REVIEW_STATUS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </Field>
        <div className="span-2">
          <ImageUploadField label="Customer Photo (optional)" value={form.photoUrl} onChange={set('photoUrl')} />
        </div>
        <div className="span-2 toggles-row">
          <Toggle checked={form.visible} onChange={set('visible')} label="Visible on website" />
          <Toggle checked={form.featured} onChange={set('featured')} label="Featured (homepage testimonials)" />
        </div>
      </div>
      {review?.customerPhone && <p className="field-hint">Phone given by the customer (private): {review.customerPhone}</p>}
      {error && <p className="form-error">{error}</p>}
    </Modal>
  );
}

export default function ReviewsAdmin() {
  const toast = useToast();
  const [confirm, confirmDialog] = useConfirm();
  const [params, setParams] = useSearchParams();
  const status = params.get('status') || '';
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState(null);

  const { data, loading, error, reload, setData } = useFetch(
    () => adminApi.get('/admin/reviews', { params: { status: status || undefined, q: q || undefined, page, size: 20 } }).then((r) => r.data),
    [status, q, page],
  );

  useEffect(() => {
    const t = setTimeout(() => {
      setQ(search);
      setPage(0);
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  async function moderate(review, changes, message) {
    try {
      const { data: updated } = await adminApi.patch(`/admin/reviews/${review.id}`, changes);
      setData((d) => ({ ...d, content: d.content.map((r) => (r.id === updated.id ? updated : r)) }));
      toast.success(message);
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }

  function remove(review) {
    confirm({
      title: 'Delete review?',
      message: `The review by ${review.customerName} will be permanently deleted.`,
      onConfirm: async () => {
        await adminApi.delete(`/admin/reviews/${review.id}`);
        toast.success('Review deleted.');
        reload();
      },
    });
  }

  return (
    <>
      <PageHeader title="Manage Reviews" subtitle="Only approved and visible reviews appear on the website.">
        <button type="button" className="btn btn-primary" onClick={() => setEditing({})}>
          <TbPlus aria-hidden="true" /> Add Review
        </button>
      </PageHeader>

      <div className="toolbar">
        <div className="segmented" role="tablist" aria-label="Filter by status">
          {[['', 'All'], ...Object.entries(REVIEW_STATUS)].map(([k, v]) => (
            <button
              key={k}
              type="button"
              role="tab"
              aria-selected={status === k}
              className={status === k ? 'is-active' : ''}
              onClick={() => {
                setPage(0);
                setParams(k ? { status: k } : {}, { replace: true });
              }}
            >
              {v}
            </button>
          ))}
        </div>
        <label className="search-box">
          <TbSearch aria-hidden="true" />
          <input type="search" placeholder="Search name or text" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search reviews" />
        </label>
      </div>

      {loading && !data && <Spinner />}
      {error && <ErrorState error={error} onRetry={reload} />}
      {data && data.content.length === 0 && <EmptyState title={status === 'PENDING' ? 'No reviews waiting for approval' : 'No reviews found'} />}
      {data && data.content.length > 0 && (
        <ul className="review-admin-list">
          {data.content.map((r) => (
            <li key={r.id} className={r.visible ? '' : 'is-hidden'}>
              <Avatar name={r.customerName} photoUrl={r.photoUrl} />
              <div className="review-admin-body">
                <div className="review-admin-head">
                  <strong>{r.customerName}</strong>
                  <Stars rating={r.rating} />
                  <Badge tone={TONE[r.status]}>{REVIEW_STATUS[r.status]}</Badge>
                  {r.featured && <Badge tone="orange">Featured</Badge>}
                  {!r.visible && <Badge>Hidden</Badge>}
                  {r.source === 'WEBSITE' && <Badge tone="blue">From website</Badge>}
                  {r.sample && <Badge>Sample</Badge>}
                </div>
                <p>{r.content}</p>
                <span className="muted">
                  {r.projectName && `${r.projectName} · `}
                  {formatDate(r.reviewDate)}
                </span>
              </div>
              <div className="review-admin-actions">
                {r.status !== 'APPROVED' && (
                  <button type="button" className="btn btn-sm btn-success" onClick={() => moderate(r, { status: 'APPROVED' }, 'Review approved and published.')}>
                    <TbCheck aria-hidden="true" /> Approve
                  </button>
                )}
                {r.status !== 'REJECTED' && (
                  <button type="button" className="btn btn-sm btn-ghost" onClick={() => moderate(r, { status: 'REJECTED' }, 'Review rejected.')}>
                    <TbX aria-hidden="true" /> Reject
                  </button>
                )}
                <div className="cell-actions">
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={() => moderate(r, { featured: !r.featured }, r.featured ? 'Removed from testimonials.' : 'Added to homepage testimonials.')}
                    aria-label={r.featured ? 'Unfeature' : 'Feature'}
                    title={r.featured ? 'Unfeature' : 'Feature on homepage'}
                  >
                    {r.featured ? <TbStarFilled /> : <TbStar />}
                  </button>
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={() => moderate(r, { visible: !r.visible }, r.visible ? 'Review hidden.' : 'Review visible.')}
                    aria-label={r.visible ? 'Hide' : 'Show'}
                    title={r.visible ? 'Hide' : 'Show'}
                  >
                    {r.visible ? <TbEye /> : <TbEyeOff />}
                  </button>
                  <button type="button" className="icon-btn" onClick={() => setEditing(r)} aria-label="Edit review" title="Edit">
                    <TbEdit />
                  </button>
                  <button type="button" className="icon-btn icon-btn-danger" onClick={() => remove(r)} aria-label="Delete review" title="Delete">
                    <TbTrash />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      {data && <Pagination page={data.page} totalPages={data.totalPages} onPage={setPage} />}
      {editing && (
        <ReviewModal
          review={editing.id ? editing : null}
          onClose={() => setEditing(null)}
          onSaved={(_, created) => {
            setEditing(null);
            toast.success(created ? 'Review added.' : 'Review updated.');
            reload();
          }}
        />
      )}
      {confirmDialog}
    </>
  );
}
