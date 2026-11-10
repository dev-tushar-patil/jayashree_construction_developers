/** WhatsApp and phone links built from the admin-configured numbers. */

const digits = (value) => String(value || '').replace(/\D/g, '');

/** wa.me needs the country code: a 10-digit Indian mobile gets 91 in front. */
export function whatsappNumber(value) {
  const d = digits(value);
  return d.length === 10 ? `91${d}` : d;
}

export function whatsappLink(number, message) {
  const n = whatsappNumber(number);
  if (!n) return null;
  return `https://wa.me/${n}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
}

export function projectWhatsappMessage(projectName) {
  return `Hello, I am interested in ${projectName}. Please share more details about this project.`;
}

export function serviceWhatsappMessage(serviceTitle) {
  return `Hello Jayashri Construction & Developers, I am interested in your ${serviceTitle} service. Please share more information.`;
}

/** tel: link; 10-digit numbers are dialled with +91. */
export function telLink(value) {
  const d = digits(value);
  if (!d) return null;
  return d.length === 10 ? `tel:+91${d}` : `tel:+${d}`;
}

/** "7558298818" -> "+91 75582 98818"; anything else is shown as entered. */
export function formatPhone(value) {
  const d = digits(value);
  if (d.length === 10) return `+91 ${d.slice(0, 5)} ${d.slice(5)}`;
  if (d.length === 12 && d.startsWith('91')) return `+91 ${d.slice(2, 7)} ${d.slice(7)}`;
  return value || '';
}

export function mapEmbedUrl(query) {
  return `https://www.google.com/maps?q=${encodeURIComponent(query || 'Satara, Maharashtra')}&output=embed`;
}
