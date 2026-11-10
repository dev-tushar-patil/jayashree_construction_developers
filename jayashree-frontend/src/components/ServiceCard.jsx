import { Link } from 'react-router-dom';
import { TbArrowRight } from 'react-icons/tb';
import { assetUrl } from '../services/api.js';
import { serviceWhatsappMessage } from '../services/contact.js';
import { serviceIcon } from './icons.js';
import WhatsAppButton from './WhatsAppButton.jsx';

/** Text on the left, photo on the right behind a diagonal edge, as in the Services page reference. */
export default function ServiceCard({ service, actions = true }) {
  const Icon = serviceIcon(service.icon);
  const to = `/services/${service.slug}`;
  return (
    <article className="service-card">
      <div className="service-card-body">
        <Icon className="service-icon" aria-hidden="true" />
        <h3>
          <Link to={to}>{service.title}</Link>
        </h3>
        <p>{service.shortDescription}</p>
        {actions && (
          <div className="service-card-actions">
            <Link to={to} className="text-link" aria-label={`View details of ${service.title}`}>
              View Details <TbArrowRight aria-hidden="true" />
            </Link>
            <WhatsAppButton className="text-link text-link-wa" message={serviceWhatsappMessage(service.title)}>
              Enquire
            </WhatsAppButton>
          </div>
        )}
      </div>
      {service.imageUrl && (
        <div className="service-card-media" aria-hidden="true">
          <img src={assetUrl(service.imageUrl)} alt="" loading="lazy" decoding="async" />
        </div>
      )}
    </article>
  );
}
