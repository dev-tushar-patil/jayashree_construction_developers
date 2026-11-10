import { TbBrandWhatsapp } from 'react-icons/tb';
import { useContent } from '../hooks/useContent.jsx';
import { whatsappLink } from '../services/contact.js';

/** Opens WhatsApp (app or web) with a prefilled, URL-encoded message to the configured number. */
export default function WhatsAppButton({ message, children = 'Enquire on WhatsApp', className = 'btn btn-whatsapp' }) {
  const { get } = useContent();
  const href = whatsappLink(get('contact.whatsapp'), message || get('contact.whatsappMessage'));
  if (!href) return null;
  return (
    <a className={className} href={href} target="_blank" rel="noopener noreferrer">
      <TbBrandWhatsapp aria-hidden="true" />
      <span>{children}</span>
    </a>
  );
}

export function WhatsAppFloat() {
  const { get } = useContent();
  const href = whatsappLink(get('contact.whatsapp'), get('contact.whatsappMessage'));
  if (!href) return null;
  return (
    <a className="whatsapp-float" href={href} target="_blank" rel="noopener noreferrer" aria-label="Chat with us on WhatsApp">
      <TbBrandWhatsapp aria-hidden="true" />
      <span className="whatsapp-float-label">Chat with us</span>
    </a>
  );
}
