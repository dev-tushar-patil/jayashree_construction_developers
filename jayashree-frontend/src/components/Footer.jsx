import { Link } from 'react-router-dom';
import { TbClock, TbMail, TbMapPin, TbPhone, TbUser } from 'react-icons/tb';
import { useContent } from '../hooks/useContent.jsx';
import { useFetch } from '../hooks/useFetch.js';
import { publicApi } from '../services/api.js';
import { formatPhone, telLink } from '../services/contact.js';
import { NAV_ITEMS } from './Header.jsx';
import SocialLinks from './SocialLinks.jsx';
import WhatsAppButton from './WhatsAppButton.jsx';

export default function Footer() {
  const { get } = useContent();
  const { data: services } = useFetch(() => publicApi.services(), []);
  const phones = [get('contact.phone1'), get('contact.phone2')].filter(Boolean);
  const email = get('contact.email');
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-band">
        <div className="container footer-band-inner">
          <div>
            <h2>{get('home.ctaTitle')}</h2>
            <p>{get('footer.text')}</p>
          </div>
          <Link to="/get-a-quote" className="btn btn-primary">
            <TbPhone aria-hidden="true" /> Get a Quote
          </Link>
        </div>
      </div>

      <div className="container footer-grid">
        <div className="footer-about">
          <Link to="/" className="footer-logo" aria-label={`${get('company.name')} home`}>
            <img src="/images/brand/logo.jpeg" alt={get('company.name')} width="640" height="640" loading="lazy" />
          </Link>
          <p>{get('company.intro')}</p>
          <SocialLinks className="footer-social" />
          <WhatsAppButton className="btn btn-whatsapp btn-sm">Chat on WhatsApp</WhatsAppButton>
        </div>

        <nav aria-label="Quick links">
          <h3>Quick Links</h3>
          <ul>
            {NAV_ITEMS.map((item) => (
              <li key={item.to}>
                <Link to={item.to}>{item.label}</Link>
              </li>
            ))}
            <li>
              <Link to="/get-a-quote">Get a Quote</Link>
            </li>
          </ul>
        </nav>

        <nav aria-label="Services">
          <h3>Our Services</h3>
          <ul>
            {(services || []).slice(0, 7).map((s) => (
              <li key={s.id}>
                <Link to={`/services/${s.slug}`}>{s.title}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h3>Contact Us</h3>
          <ul className="footer-contact">
            <li>
              <TbUser aria-hidden="true" />
              <span>{get('contact.person')}</span>
            </li>
            {phones.map((p) => (
              <li key={p}>
                <TbPhone aria-hidden="true" />
                <a href={telLink(p)}>{formatPhone(p)}</a>
              </li>
            ))}
            {email && (
              <li>
                <TbMail aria-hidden="true" />
                <a href={`mailto:${email}`}>{email}</a>
              </li>
            )}
            <li>
              <TbMapPin aria-hidden="true" />
              <span>{get('contact.address')}</span>
            </li>
            <li>
              <TbClock aria-hidden="true" />
              <span className="pre-line">{get('contact.hours')}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p>
            © {year} {get('company.name')}. {get('footer.copyright')}
          </p>
          <Link to="/admin/login" className="admin-link" rel="nofollow">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
