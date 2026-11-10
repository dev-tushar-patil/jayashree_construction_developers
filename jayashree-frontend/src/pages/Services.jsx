import { Link } from 'react-router-dom';
import { TbArrowRight, TbClipboardCheck, TbCompass, TbHelmet, TbHomeCheck, TbMessages } from 'react-icons/tb';
import CtaBand from '../components/CtaBand.jsx';
import PageHero from '../components/PageHero.jsx';
import Reveal from '../components/Reveal.jsx';
import SectionHeading from '../components/SectionHeading.jsx';
import ServiceCard from '../components/ServiceCard.jsx';
import { EmptyState, ErrorState, SkeletonGrid } from '../components/States.jsx';
import WhyChoose from '../components/WhyChoose.jsx';
import { useFetch } from '../hooks/useFetch.js';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { publicApi } from '../services/api.js';

const PROCESS = [
  { title: 'Consultation', text: 'Understand your needs and vision', Icon: TbMessages },
  { title: 'Planning & Design', text: 'Create a functional and aesthetic plan', Icon: TbCompass },
  { title: 'Approvals', text: 'Handle permissions and clearances', Icon: TbClipboardCheck },
  { title: 'Construction', text: 'Build with quality and regular updates', Icon: TbHelmet },
  { title: 'Handover', text: 'Deliver your dream home on time', Icon: TbHomeCheck },
];

export default function Services() {
  usePageMeta('Services', 'Residential construction, bungalows, villas, project development, architectural planning and land development in Satara.');
  const { data, loading, error, reload } = useFetch(() => publicApi.services(), []);

  return (
    <>
      <PageHero
        eyebrow="Our Services"
        title="Complete Construction Solutions for Your *Dream Home*"
        text="From planning to possession, we provide end-to-end construction and development services with quality, transparency and trust."
        image="/images/hero/services.webp"
      >
        <Link to="/get-a-quote" className="btn btn-primary">
          Get a Free Consultation <TbArrowRight aria-hidden="true" />
        </Link>
      </PageHero>

      <section className="section" aria-labelledby="offer-heading">
        <div className="container">
          <SectionHeading eyebrow="Our Services" title="What We *Offer*" id="offer-heading" />
          {loading && <SkeletonGrid count={6} className="service-grid" />}
          {error && <ErrorState error={error} onRetry={reload} />}
          {data && data.length === 0 && <EmptyState title="Services will be listed here soon" />}
          {data && data.length > 0 && (
            <div className="service-grid">
              {data.map((s, i) => (
                <Reveal key={s.id} delay={(i % 3) * 70}>
                  <ServiceCard service={s} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="container">
        <WhyChoose compact />
      </div>

      <section className="section" aria-labelledby="process-heading">
        <div className="container">
          <SectionHeading eyebrow="Our Work Process" title="From Idea to Your *Dream Home*" id="process-heading" />
          <ol className="process">
            {PROCESS.map(({ title, text, Icon }, i) => (
              <Reveal as="li" key={title} delay={i * 80}>
                <span className="process-icon">
                  <Icon aria-hidden="true" />
                </span>
                <strong>{title}</strong>
                <span>{text}</span>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <CtaBand text="Tell us about your requirement and our team will get in touch with a customised solution." buttonLabel="Get in Touch" />
    </>
  );
}
