import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { TbChevronLeft, TbChevronRight, TbX } from 'react-icons/tb';
import { assetUrl } from '../services/api.js';

/** Full-size image viewer: arrow keys, Escape, swipe on touch screens, focus returned on close. */
export default function Lightbox({ images, index, onClose, onNavigate }) {
  const closeButton = useRef(null);
  const touchStart = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const image = images[index];
  const count = images.length;
  const next = () => onNavigate((index + 1) % count);
  const prev = () => onNavigate((index - 1 + count) % count);

  useEffect(() => {
    const previousFocus = document.activeElement;
    closeButton.current?.focus();
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
      previousFocus?.focus?.();
    };
  }, []);

  useEffect(() => setLoaded(false), [index]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  });

  if (!image) return null;

  return createPortal(
    <div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={image.title || 'Image viewer'}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onTouchStart={(e) => (touchStart.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchStart.current == null) return;
        const dx = e.changedTouches[0].clientX - touchStart.current;
        if (Math.abs(dx) > 50) (dx < 0 ? next : prev)();
        touchStart.current = null;
      }}
    >
      <button ref={closeButton} type="button" className="lightbox-btn lightbox-close" onClick={onClose} aria-label="Close">
        <TbX />
      </button>
      {count > 1 && (
        <button type="button" className="lightbox-btn lightbox-prev" onClick={prev} aria-label="Previous image">
          <TbChevronLeft />
        </button>
      )}
      <figure className="lightbox-figure">
        {!loaded && <span className="spinner lightbox-spinner" aria-hidden="true" />}
        <img
          key={image.url}
          src={assetUrl(image.url)}
          alt={image.title || ''}
          onLoad={() => setLoaded(true)}
          className={loaded ? 'is-loaded' : ''}
        />
        <figcaption>
          <span>
            {image.title}
            {image.description && <small>{image.description}</small>}
          </span>
          <span className="lightbox-count">
            {index + 1} / {count}
          </span>
        </figcaption>
      </figure>
      {count > 1 && (
        <button type="button" className="lightbox-btn lightbox-next" onClick={next} aria-label="Next image">
          <TbChevronRight />
        </button>
      )}
    </div>,
    document.body,
  );
}
