import Accent from './Accent.jsx';
import { assetUrl } from '../services/api.js';

/**
 * Inner-page hero from the design reference: cream on the left with the heading, the photo on the right
 * fading into the cream. On phones the photo sits above the text.
 */
export default function PageHero({ eyebrow, title, text, image, children, script }) {
  return (
    <section className="page-hero">
      <div className="page-hero-media" aria-hidden="true">
        <img src={assetUrl(image)} alt="" fetchpriority="high" />
      </div>
      <div className="container page-hero-inner">
        <div className="page-hero-copy">
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h1>
            <Accent text={title} />
          </h1>
          {text && <p className="page-hero-text">{text}</p>}
          {script && <p className="script-note">{script}</p>}
          {children}
        </div>
      </div>
    </section>
  );
}
