import { useState } from 'react';
import { TbCircleCheck, TbMessageStar, TbStar, TbStarFilled } from 'react-icons/tb';
import CtaBand from '../components/CtaBand.jsx';
import Field from '../components/Field.jsx';
import PageHero from '../components/PageHero.jsx';
import ReviewCard, { Stars } from '../components/ReviewCard.jsx';
import SectionHeading from '../components/SectionHeading.jsx';
import { EmptyState, ErrorState, SkeletonGrid } from '../components/States.jsx';
import { useFetch } from '../hooks/useFetch.js';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { errorMessage, fieldErrors, publicApi } from '../services/api.js';

function StarInput({ value, onChange, error }) {
  const [hover, setHover] = useState(0);
  return (
    <fieldset className={`field star-input ${error ? 'has-error' : ''}`}>
      <legend>
        Your Rating <span className="required" aria-hidden="true">*</span>
      </legend>
      <div onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <label key={n} onMouseEnter={() => setHover(n)}>
            <input type="radio" name="rating" value={n} checked={value === n} onChange={() => onChange(n)} className="sr-only" />
            {(hover || value) >= n ? <TbStarFilled aria-hidden="true" /> : <TbStar aria-hidden="true" />}
            <span className="sr-only">
              {n} star{n > 1 ? 's' : ''}
            </span>
          </label>
        ))}
      </div>
      {error && <small className="field-error">{error}</small>}
    </fieldset>
  );
}

function ReviewForm() {
  const empty = { customerName: '', customerPhone: '', rating: 0, content: '', projectName: '', website: '' };
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ busy: false, error: '', done: '' });
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    const found = {};
    if (!form.customerName.trim()) found.customerName = 'Please enter your name.';
    if (!form.rating) found.rating = 'Please choose a star rating.';
    if (form.content.trim().length < 10) found.content = 'Please write at least a sentence about your experience.';
    if (form.customerPhone && form.customerPhone.replace(/\D/g, '').length < 10) found.customerPhone = 'Please enter a valid mobile number.';
    setErrors(found);
    if (Object.keys(found).length) return;
    setStatus({ busy: true, error: '', done: '' });
    try {
      const res = await publicApi.submitReview(form);
      setStatus({ busy: false, error: '', done: res.message });
      setForm(empty);
    } catch (err) {
      setErrors(fieldErrors(err));
      setStatus({ busy: false, error: errorMessage(err), done: '' });
    }
  }

  if (status.done) {
    return (
      <div className="form-success-panel" role="status">
        <TbCircleCheck aria-hidden="true" />
        <h3>{status.done}</h3>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="review-form">
      <div className="hp-field" aria-hidden="true">
        <label>
          Website <input tabIndex={-1} autoComplete="off" value={form.website} onChange={set('website')} />
        </label>
      </div>
      <div className="form-grid">
        <Field label="Your Name" required value={form.customerName} onChange={set('customerName')} error={errors.customerName} maxLength={120} autoComplete="name" />
        <Field
          label="Mobile Number"
          hint="Optional, never shown publicly"
          type="tel"
          value={form.customerPhone}
          onChange={set('customerPhone')}
          error={errors.customerPhone}
          maxLength={20}
        />
        <div className="span-2">
          <StarInput value={form.rating} onChange={(rating) => setForm((f) => ({ ...f, rating }))} error={errors.rating} />
        </div>
        <Field label="Project (optional)" value={form.projectName} onChange={set('projectName')} maxLength={150} className="span-2" placeholder="Which home or project did we build for you?" />
        <Field label="Your Review" required as="textarea" rows={5} value={form.content} onChange={set('content')} error={errors.content} maxLength={2000} className="span-2" />
      </div>
      {status.error && (
        <p className="form-error" role="alert">
          {status.error}
        </p>
      )}
      <button type="submit" className="btn btn-primary" disabled={status.busy}>
        {status.busy ? 'Submitting…' : 'Submit Review'}
      </button>
      <p className="field-hint">Reviews are published after a quick check by our team.</p>
    </form>
  );
}

export default function Reviews() {
  usePageMeta('Reviews', 'What customers say about Jayashri Construction & Developers.');
  const [page, setPage] = useState(0);
  const { data, loading, error, reload } = useFetch(() => publicApi.reviews({ page, size: 9 }), [page]);
  const summary = useFetch(() => publicApi.reviewSummary(), []);

  return (
    <>
      <PageHero
        eyebrow="Reviews & Testimonials"
        title="Trusted by *Families* Across Satara"
        text="Every home we build is a relationship. Here is what our customers say about working with us."
        image="/images/about/living.webp"
      >
        {summary.data && summary.data.count > 0 && (
          <div className="rating-summary">
            <strong>{summary.data.average.toFixed(1)}</strong>
            <div>
              <Stars rating={Math.round(summary.data.average)} />
              <span>
                from {summary.data.count} review{summary.data.count === 1 ? '' : 's'}
              </span>
            </div>
          </div>
        )}
      </PageHero>

      <section className="section" aria-labelledby="reviews-list">
        <div className="container">
          <SectionHeading eyebrow="Customer Reviews" title="What Our *Customers* Say" id="reviews-list" />
          {loading && <SkeletonGrid count={3} className="review-grid" />}
          {error && <ErrorState error={error} onRetry={reload} />}
          {data && data.content.length === 0 && (
            <EmptyState title="No reviews yet" icon={TbMessageStar}>
              Be the first to share your experience below.
            </EmptyState>
          )}
          {data && data.content.length > 0 && (
            <>
              <div className="review-grid">
                {data.content.map((r) => (
                  <ReviewCard key={r.id} review={r} />
                ))}
              </div>
              {data.totalPages > 1 && (
                <nav className="pager" aria-label="Review pages">
                  <button type="button" className="btn btn-outline btn-sm" disabled={page === 0} onClick={() => setPage(page - 1)}>
                    Previous
                  </button>
                  <span>
                    Page {page + 1} of {data.totalPages}
                  </span>
                  <button type="button" className="btn btn-outline btn-sm" disabled={page + 1 >= data.totalPages} onClick={() => setPage(page + 1)}>
                    Next
                  </button>
                </nav>
              )}
            </>
          )}
        </div>
      </section>

      <section className="section section-sand" aria-labelledby="share-heading">
        <div className="container narrow">
          <div className="form-card">
            <SectionHeading eyebrow="Share Your Experience" title="Built a home with *us*?" text="We would love to hear from you." id="share-heading" />
            <ReviewForm />
          </div>
        </div>
      </section>

      <CtaBand buttonLabel="Contact Us" />
    </>
  );
}
