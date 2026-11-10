import { useContent } from '../hooks/useContent.jsx';
import { mapEmbedUrl } from '../services/contact.js';
import { PageHeader } from './ui.jsx';
import SettingsForm from './SettingsForm.jsx';

const GROUPS = [
  {
    title: 'Contact Details',
    fields: [
      { key: 'contact.person', label: 'Contact person' },
      { key: 'contact.email', label: 'Email address', type: 'email' },
      { key: 'contact.phone1', label: 'Phone number 1', type: 'phone', hint: '10-digit mobile, e.g. 7558298818' },
      { key: 'contact.phone2', label: 'Phone number 2', type: 'phone' },
      { key: 'contact.address', label: 'Office address', type: 'textarea', rows: 3 },
      { key: 'contact.hours', label: 'Working hours', type: 'textarea', rows: 2 },
    ],
  },
  {
    title: 'WhatsApp',
    description: 'Every WhatsApp button on the website opens a chat with this number.',
    fields: [
      { key: 'contact.whatsapp', label: 'WhatsApp number', type: 'phone', hint: 'With or without 91; a 10-digit number gets 91 added automatically.' },
      { key: 'contact.whatsappMessage', label: 'Default message', type: 'textarea', rows: 3, hint: 'Prefilled when visitors tap a general WhatsApp button.' },
    ],
  },
  {
    title: 'Office Location (Google Maps)',
    fields: [
      {
        key: 'contact.mapQuery',
        label: 'Map location',
        wide: true,
        hint: 'Address or coordinates shown on the Contact page map, e.g. "Shahupuri, Satara" or "17.6805,74.0183".',
      },
      { key: 'contact.mapsUrl', label: 'Google Maps link ("Get directions")', type: 'url', wide: true, hint: 'In Google Maps: Share → Copy link.' },
    ],
  },
];

function MapPreview() {
  const { get } = useContent();
  return (
    <section className="panel panel-pad">
      <h2 className="panel-title">Current map (after saving)</h2>
      <div className="map-frame map-frame-sm">
        <iframe title="Map preview" src={mapEmbedUrl(get('contact.mapQuery'))} loading="lazy" />
      </div>
    </section>
  );
}

export default function ContactAdmin() {
  return (
    <>
      <PageHeader title="Contact Information" subtitle="Shown in the header, footer, Contact page and WhatsApp buttons." />
      <SettingsForm groups={GROUPS} after={<MapPreview />} />
    </>
  );
}
