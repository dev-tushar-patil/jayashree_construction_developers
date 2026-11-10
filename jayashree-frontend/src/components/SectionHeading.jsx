import Accent from './Accent.jsx';

/** Eyebrow ("— OUR SERVICES") + serif heading, as in the design reference. */
export default function SectionHeading({ eyebrow, title, text, center, light, as: Tag = 'h2', id }) {
  return (
    <header className={`section-heading ${center ? 'is-center' : ''} ${light ? 'is-light' : ''}`}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <Tag id={id}>
        <Accent text={title} />
      </Tag>
      {text && <p className="section-text">{text}</p>}
    </header>
  );
}
