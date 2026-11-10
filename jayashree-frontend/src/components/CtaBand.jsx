import { Link } from 'react-router-dom';
import { TbPhone } from 'react-icons/tb';
import { useContent } from '../hooks/useContent.jsx';

/** Sunset call-to-action band with a soft hills silhouette (drawn, so there is no text baked into a photo). */
export default function CtaBand({ title, text, buttonLabel = 'Contact Us', to = '/contact' }) {
  const { get } = useContent();
  return (
    <section className="cta-band">
      <svg className="cta-hills" viewBox="0 0 1440 220" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 140 C 180 90 300 120 460 100 C 640 78 760 130 920 110 C 1100 88 1250 120 1440 96 L1440 220 L0 220 Z" fill="rgba(32,45,85,0.10)" />
        <path d="M0 170 C 200 140 360 175 560 150 C 760 126 900 172 1100 152 C 1260 136 1360 160 1440 150 L1440 220 L0 220 Z" fill="rgba(32,45,85,0.16)" />
      </svg>
      <span className="cta-sun" aria-hidden="true" />
      <div className="container cta-inner">
        <h2>{title || get('home.ctaTitle')}</h2>
        <span className="title-rule" aria-hidden="true" />
        {(text ?? get('home.ctaText')) && <p>{text ?? get('home.ctaText')}</p>}
        <Link to={to} className="btn btn-primary">
          <TbPhone aria-hidden="true" /> {buttonLabel}
        </Link>
      </div>
    </section>
  );
}
