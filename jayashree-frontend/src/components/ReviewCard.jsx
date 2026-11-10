import { Link } from 'react-router-dom';
import { TbQuote, TbStar, TbStarFilled } from 'react-icons/tb';
import { assetUrl } from '../services/api.js';
import { formatDate } from '../services/labels.js';

export function Stars({ rating, size }) {
  return (
    <span className="stars" role="img" aria-label={`${rating} out of 5 stars`} style={size ? { fontSize: size } : undefined}>
      {[1, 2, 3, 4, 5].map((n) => (n <= rating ? <TbStarFilled key={n} aria-hidden="true" /> : <TbStar key={n} aria-hidden="true" />))}
    </span>
  );
}

export function Avatar({ name, photoUrl }) {
  if (photoUrl) return <img className="avatar" src={assetUrl(photoUrl)} alt="" loading="lazy" />;
  const initials = String(name || '?')
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
  return (
    <span className="avatar avatar-initials" aria-hidden="true">
      {initials}
    </span>
  );
}

export default function ReviewCard({ review }) {
  return (
    <article className="review-card">
      <TbQuote className="review-quote" aria-hidden="true" />
      <Stars rating={review.rating} />
      <blockquote>{review.content}</blockquote>
      <footer>
        <Avatar name={review.customerName} photoUrl={review.photoUrl} />
        <div>
          <strong>{review.customerName}</strong>
          <span>
            {review.projectName &&
              (review.projectSlug ? <Link to={`/projects/${review.projectSlug}`}>{review.projectName}</Link> : review.projectName)}
            {review.projectName && review.reviewDate && ' · '}
            {review.reviewDate && <time dateTime={review.reviewDate}>{formatDate(review.reviewDate, { month: 'short', year: 'numeric' })}</time>}
          </span>
        </div>
      </footer>
    </article>
  );
}
