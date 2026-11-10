import { useCallback, useEffect, useRef, useState } from 'react';
import { TbChevronLeft, TbChevronRight } from 'react-icons/tb';
import ReviewCard from './ReviewCard.jsx';

/** Shows 1, 2 or 3 reviews at a time depending on width; auto-advances unless hovered, focused or reduced-motion. */
export default function TestimonialSlider({ reviews }) {
  const [perView, setPerView] = useState(3);
  const [index, setIndex] = useState(0);
  const paused = useRef(false);
  const count = reviews.length;
  const pages = Math.max(1, count - perView + 1);

  useEffect(() => {
    const update = () => setPerView(window.innerWidth < 720 ? 1 : window.innerWidth < 1080 ? 2 : 3);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    if (index > pages - 1) setIndex(0);
  }, [index, pages]);

  const go = useCallback((n) => setIndex(((n % pages) + pages) % pages), [pages]);

  useEffect(() => {
    if (pages <= 1 || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;
    const timer = setInterval(() => {
      if (!paused.current) setIndex((i) => (i + 1) % pages);
    }, 6000);
    return () => clearInterval(timer);
  }, [pages]);

  return (
    <div
      className="slider"
      onMouseEnter={() => (paused.current = true)}
      onMouseLeave={() => (paused.current = false)}
      onFocus={() => (paused.current = true)}
      onBlur={() => (paused.current = false)}
      aria-roledescription="carousel"
    >
      <div className="slider-viewport">
        <div className="slider-track" style={{ transform: `translateX(-${(index * 100) / perView}%)` }}>
          {reviews.map((review, i) => (
            <div
              key={review.id}
              className="slider-slide"
              style={{ flexBasis: `${100 / perView}%` }}
              aria-hidden={i < index || i >= index + perView}
            >
              <ReviewCard review={review} />
            </div>
          ))}
        </div>
      </div>
      {pages > 1 && (
        <div className="slider-controls">
          <button type="button" className="icon-btn" onClick={() => go(index - 1)} aria-label="Previous reviews">
            <TbChevronLeft />
          </button>
          <div className="slider-dots">
            {Array.from({ length: pages }, (_, i) => (
              <button
                key={i}
                type="button"
                className={i === index ? 'is-active' : ''}
                onClick={() => go(i)}
                aria-label={`Show review ${i + 1}`}
                aria-current={i === index}
              />
            ))}
          </div>
          <button type="button" className="icon-btn" onClick={() => go(index + 1)} aria-label="Next reviews">
            <TbChevronRight />
          </button>
        </div>
      )}
    </div>
  );
}
