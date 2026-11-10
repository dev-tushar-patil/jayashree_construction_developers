import { TbClock, TbMail, TbMapPin, TbPhone, TbUser } from 'react-icons/tb';
import EnquiryForm from '../components/EnquiryForm.jsx';
import PageHero from '../components/PageHero.jsx';
import SectionHeading from '../components/SectionHeading.jsx';
import WhatsAppButton from '../components/WhatsAppButton.jsx';
import { useContent } from '../hooks/useContent.jsx';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { formatPhone, mapEmbedUrl, telLink } from '../services/contact.js';

export default function Contact() {
  const { get } = useContent();
  usePageMeta('Contact Us', `Call ${get('contact.person')} or send an enquiry to Jayashree Construction & Developers, Satara.`);
  const phones = [get('contact.phone1'), get('contact.phone2')].filter(Boolean);
  const email = get('contact.email');

  return (
    <>
      <PageHero
        eyebrow="Contact Us"
        title="We'd Love to Hear From *You*"
        text="Whether you have a question, want to discuss your dream home, or need more information about our services — we're here to help."
        image="/images/hero/contact.webp"
        script="Let's Build Something Beautiful Together"
      />

      <section className="section" aria-label="Contact details and enquiry form">
        <div className="container contact-grid">
          <div>
            <SectionHeading eyebrow="Get in Touch" title="Our Contact *Details*" text="Reach out through any of these channels. We'd be happy to assist you." />
            <ul className="contact-list">
              <li>
                <span className="contact-icon">
                  <TbUser aria-hidden="true" />
                </span>
                <div>
                  <h3>Contact Person</h3>
                  <p>{get('contact.person')}</p>
                </div>
              </li>
              <li>
                <span className="contact-icon">
                  <TbPhone aria-hidden="true" />
                </span>
                <div>
                  <h3>Call Us</h3>
                  {phones.map((p) => (
                    <p key={p}>
                      <a href={telLink(p)}>{formatPhone(p)}</a>
                    </p>
                  ))}
                </div>
              </li>
              {email && (
                <li>
                  <span className="contact-icon">
                    <TbMail aria-hidden="true" />
                  </span>
                  <div>
                    <h3>Email Us</h3>
                    <p>
                      <a href={`mailto:${email}`}>{email}</a>
                    </p>
                  </div>
                </li>
              )}
              <li>
                <span className="contact-icon">
                  <TbMapPin aria-hidden="true" />
                </span>
                <div>
                  <h3>Our Office</h3>
                  <p className="pre-line">{get('contact.address')}</p>
                  {get('contact.mapsUrl') && (
                    <p>
                      <a href={get('contact.mapsUrl')} target="_blank" rel="noopener noreferrer" className="text-link">
                        Get directions
                      </a>
                    </p>
                  )}
                </div>
              </li>
              <li>
                <span className="contact-icon">
                  <TbClock aria-hidden="true" />
                </span>
                <div>
                  <h3>Working Hours</h3>
                  <p className="pre-line">{get('contact.hours')}</p>
                </div>
              </li>
            </ul>
            <WhatsAppButton>Chat on WhatsApp</WhatsAppButton>
            <p className="script-note script-note-dark">Your dream home is just a call away!</p>
          </div>

          <div className="form-card">
            <SectionHeading eyebrow="Send Us a Message" title="Get in *Touch*" text="Fill in the form below and our team will get back to you as soon as possible." />
            <EnquiryForm type="CONTACT" />
          </div>
        </div>
      </section>

      <section className="section section-tight" aria-label="Office location map">
        <div className="container map-grid">
          <div className="map-frame">
            <iframe
              title={`Map: ${get('contact.mapQuery')}`}
              src={mapEmbedUrl(get('contact.mapQuery'))}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
          <div className="quote-card">
            <img src="/images/gallery/veranda-swing.webp" alt="" loading="lazy" />
            <blockquote>“Better Homes for a Brighter Tomorrow”</blockquote>
          </div>
        </div>
      </section>
    </>
  );
}
