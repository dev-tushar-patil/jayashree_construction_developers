import { Link, useParams } from 'react-router-dom';
import { TbArrowLeft, TbCircleCheckFilled, TbFileDescription } from 'react-icons/tb';
import CtaBand from '../components/CtaBand.jsx';
import { serviceIcon } from '../components/icons.js';
import SectionHeading from '../components/SectionHeading.jsx';
import ServiceCard from '../components/ServiceCard.jsx';
import { ErrorState, Spinner } from '../components/States.jsx';
import WhatsAppButton from '../components/WhatsAppButton.jsx';
import { useFetch } from '../hooks/useFetch.js';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { assetUrl, publicApi } from '../services/api.js';
import { serviceWhatsappMessage } from '../services/contact.js';
import NotFound from './NotFound.jsx';

export default function ServiceDetails() {
  const { slug } = useParams();
  const { data: service, loading, error, reload } = useFetch(() => publicApi.service(slug), [slug]);
  const all = useFetch(() => publicApi.services(), []);
  usePageMeta(service?.title, service?.shortDescription);

  if (loading) return <Spinner label="Loading service…" />;
  if (error?.response?.status === 404) return <NotFound what="service" />;
  if (error) {
    return (
      <div className="container section">
        <ErrorState error={error} onRetry={reload} />
      </div>
    );
  }

  const Icon = serviceIcon(service.icon);
  const others = (all.data || []).filter((s) => s.id !== service.id).slice(0, 3);

  return (
    <>
      <section className="section service-detail">
        <div className="container split">
          <div className="split-copy">
            <Link to="/services" className="back-link back-link-dark">
              <TbArrowLeft aria-hidden="true" /> All services
            </Link>
            <span className="service-detail-icon">
              <Icon aria-hidden="true" />
            </span>
            <h1 className="detail-title">{service.title}</h1>
            <p className="lead">{service.shortDescription}</p>
            {service.description && <p className="pre-line">{service.description}</p>}
            {service.features.length > 0 && (
              <ul className="feature-list">
                {service.features.map((f) => (
                  <li key={f}>
                    <TbCircleCheckFilled aria-hidden="true" /> {f}
                  </li>
                ))}
              </ul>
            )}
            <div className="hero-actions">
              <WhatsAppButton message={serviceWhatsappMessage(service.title)}>Enquiry on WhatsApp</WhatsAppButton>
              <Link to="/get-a-quote" className="btn btn-outline">
                <TbFileDescription aria-hidden="true" /> Get a Quote
              </Link>
            </div>
          </div>
          {service.imageUrl && (
            <div className="split-media arch-frame">
              <img src={assetUrl(service.imageUrl)} alt="" />
            </div>
          )}
        </div>
      </section>

      {others.length > 0 && (
        <section className="section section-sand">
          <div className="container">
            <SectionHeading eyebrow="More Services" title="Explore Other *Services*" />
            <div className="service-grid">
              {others.map((s) => (
                <ServiceCard key={s.id} service={s} />
              ))}
            </div>
          </div>
        </section>
      )}

      <CtaBand buttonLabel="Get in Touch" />
    </>
  );
}
