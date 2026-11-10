import { Link } from 'react-router-dom';
import CtaBand from '../components/CtaBand.jsx';
import { MissionIcon, VALUE_ICONS, VisionIcon } from '../components/icons.js';
import PageHero from '../components/PageHero.jsx';
import Reveal from '../components/Reveal.jsx';
import SectionHeading from '../components/SectionHeading.jsx';
import Stats from '../components/Stats.jsx';
import WhyChoose from '../components/WhyChoose.jsx';
import { useContent } from '../hooks/useContent.jsx';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { assetUrl } from '../services/api.js';

const VALUES_FALLBACK = [
  { title: 'Trust', text: 'Long-lasting relationships built on honesty.' },
  { title: 'Quality', text: 'Best materials and careful workmanship.' },
  { title: 'Transparency', text: 'Clear process and honest communication.' },
  { title: 'Customer Centric', text: 'Homes designed around your needs.' },
];

export default function About() {
  const { get, list } = useContent();
  usePageMeta('About Us', get('about.intro'));
  const values = list('about.valuesJson').length ? list('about.valuesJson') : VALUES_FALLBACK;

  return (
    <>
      <PageHero eyebrow="About Us" title={get('about.heroTitle')} text={get('about.heroText')} image={get('about.heroImage')} />

      <section className="section" aria-labelledby="intro-heading">
        <div className="container narrow center-text">
          <SectionHeading eyebrow="Company Introduction" title={get('about.introTitle')} center id="intro-heading" />
          <p className="lead">{get('about.intro')}</p>
        </div>
      </section>

      <section className="section section-tight" aria-labelledby="story-heading">
        <div className="container story-grid">
          <Reveal className="story-media arch-frame">
            <img src={assetUrl(get('about.storyImage'))} alt="" loading="lazy" />
          </Reveal>
          <Reveal className="story-copy" delay={100}>
            <SectionHeading eyebrow="Our Story" title={get('about.storyTitle')} id="story-heading" />
            <p className="pre-line">{get('about.story')}</p>
          </Reveal>
          <Reveal className="story-aside" delay={200}>
            <svg viewBox="0 0 200 90" aria-hidden="true" className="sketch">
              <path d="M30 70h140M50 70V42l40-22 40 22v28M80 70V52h20v18M110 50h12v10h-12zM58 50h12v10H58z" />
              <path d="M150 70c0-18 4-30 10-34 6 4 10 16 10 34M20 70c0-14 3-24 8-27 5 3 8 13 8 27" />
            </svg>
            <p>
              Years of
              <br />
              Trust &amp; Excellence
              <br />
              in Construction
            </p>
            <span className="title-rule" aria-hidden="true" />
          </Reveal>
        </div>
      </section>

      <section className="vm-band" aria-label="Vision and mission">
        <div className="container vm-grid">
          <div className="vm-item">
            <VisionIcon aria-hidden="true" />
            <div>
              <h2>Our Vision</h2>
              <p>{get('about.vision')}</p>
            </div>
          </div>
          <div className="vm-item">
            <MissionIcon aria-hidden="true" />
            <div>
              <h2>Our Mission</h2>
              <p>{get('about.mission')}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="values-heading">
        <div className="container values-grid">
          <div>
            <SectionHeading eyebrow="Our Values" title="Built on Strong *Foundations*" id="values-heading" />
            <ul className="values-list">
              {values.map((v, i) => {
                const Icon = VALUE_ICONS[i % VALUE_ICONS.length];
                return (
                  <Reveal as="li" key={v.title} delay={i * 70}>
                    <span className="value-icon">
                      <Icon aria-hidden="true" />
                    </span>
                    <strong>{v.title}</strong>
                    {v.text && <span>{v.text}</span>}
                  </Reveal>
                );
              })}
            </ul>
          </div>
          <Reveal className="values-media" delay={120}>
            <img src={assetUrl(get('about.valuesImage'))} alt="" loading="lazy" />
          </Reveal>
        </div>
      </section>

      <WhyChoose />

      <section className="section" aria-label="Company statistics">
        <div className="container">
          <Stats variant="band" />
          <p className="center-text muted-note">
            <Link to="/projects" className="text-link">
              See our projects
            </Link>
          </p>
        </div>
      </section>

      <CtaBand buttonLabel="Get in Touch" />
    </>
  );
}
