import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { publicApi } from '../services/api.js';

/*
 * Website text, contact details and social links all come from the admin panel (GET /api/content).
 * These values are used only until the API answers, or if it cannot be reached, so phone and WhatsApp
 * keep working either way.
 */
const FALLBACK = {
  'company.name': 'Jayashree Construction & Developers',
  'company.shortName': 'Jayashree',
  'company.tagline': 'Building Dreams. Creating Lasting Foundations.',
  'company.intro':
    'Jayashree Construction & Developers is a Satara-based construction and real estate development company, delivering quality homes, bungalows and villas built on trust, transparency and commitment.',
  'home.heroTitle': 'Building Dreams. *Creating Lasting Foundations.*',
  'home.heroSubtitle':
    'From thoughtfully designed homes to quality construction, Jayashree Construction & Developers brings your dream spaces to life with trust, quality and commitment.',
  'home.heroImage': '/images/hero/home.webp',
  'home.aboutTitle': 'Building with Trust, Growing with *Excellence*',
  'home.aboutText':
    'Jayashree Construction & Developers is committed to delivering quality construction and thoughtfully designed spaces. We believe every project is more than just a structure — it is a foundation for dreams, relationships and a better future.',
  'home.aboutImage': '/images/hero/about.webp',
  'home.ctaTitle': "Let's Build Your Dream Home Together",
  'home.ctaText': 'Tell us about your plot and your plans. Our team will get in touch with a customised solution.',
  'home.whyChooseJson': '[]',
  'stats.1.value': '60+',
  'stats.1.label': 'Sites Across Satara',
  'stats.2.value': '',
  'stats.2.label': 'Quality Construction',
  'stats.3.value': '',
  'stats.3.label': 'Experienced Team',
  'stats.4.value': '',
  'stats.4.label': 'Customer Satisfaction',
  'about.heroTitle': 'A Legacy of Building Homes with *Trust*',
  'about.heroImage': '/images/hero/about.webp',
  'about.storyImage': '/images/about/lantern.webp',
  'about.valuesImage': '/images/about/living.webp',
  'about.valuesJson': '[]',
  'contact.person': 'Gaurav Gaikwad',
  'contact.phone1': '7558298818',
  'contact.phone2': '',
  'contact.whatsapp': '917558298818',
  'contact.email': '',
  'contact.address': 'Satara, Maharashtra, India',
  'contact.hours': 'Monday – Saturday: 9:00 AM to 7:00 PM\nSunday: By appointment',
  'contact.mapsUrl': 'https://www.google.com/maps/search/?api=1&query=Satara%2C+Maharashtra',
  'contact.mapQuery': 'Satara, Maharashtra, India',
  'contact.whatsappMessage':
    'Hello Jayashree Construction & Developers, I am interested in your construction services. Please share more information.',
  'footer.text': 'Quality Construction | Timely Delivery | Lasting Relationships',
  'footer.copyright': 'All rights reserved.',
  'seo.title': 'Jayashree Construction & Developers | Homes, Bungalows & Villas in Satara',
  'seo.description':
    'Jayashree Construction & Developers, Satara: residential construction, bungalows, villas, architectural planning and land development, built with quality and trust.',
};

const ContentContext = createContext({ content: FALLBACK, get: (k) => FALLBACK[k] || '', list: () => [], loaded: false });

export function ContentProvider({ children }) {
  const [content, setContent] = useState(FALLBACK);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(() => {
    return publicApi
      .content()
      .then((data) => setContent({ ...FALLBACK, ...data }))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo(() => {
    const get = (key) => content[key] ?? '';
    /** Parses a "...Json" list of {title, text}. */
    const list = (key) => {
      try {
        const parsed = JSON.parse(content[key] || '[]');
        return Array.isArray(parsed) ? parsed.filter((i) => i && i.title) : [];
      } catch {
        return [];
      }
    };
    return { content, get, list, loaded, refresh };
  }, [content, loaded, refresh]);

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export const useContent = () => useContext(ContentContext);
