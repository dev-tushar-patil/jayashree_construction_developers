import { useState } from 'react';
import { PageHeader } from './ui.jsx';
import SettingsForm from './SettingsForm.jsx';

const ACCENT_HINT = 'Wrap words in *asterisks* to show them in the orange italic accent, e.g. "Homes with *Trust*".';

const TABS = {
  company: {
    label: 'Company',
    groups: [
      {
        title: 'Company Details',
        fields: [
          { key: 'company.name', label: 'Company name', wide: true },
          { key: 'company.shortName', label: 'Short name' },
          { key: 'company.tagline', label: 'Tagline' },
          { key: 'company.intro', label: 'Company introduction (footer)', type: 'textarea', rows: 3 },
        ],
      },
    ],
  },
  home: {
    label: 'Home Page',
    groups: [
      {
        title: 'Hero Banner',
        fields: [
          { key: 'home.heroTitle', label: 'Headline', wide: true, hint: ACCENT_HINT },
          { key: 'home.heroSubtitle', label: 'Description', type: 'textarea', rows: 3 },
          { key: 'home.heroImage', label: 'Background image', type: 'image', hint: 'A wide landscape photo works best (at least 1600 px wide).' },
        ],
      },
      {
        title: 'About Section',
        fields: [
          { key: 'home.aboutTitle', label: 'Heading', wide: true, hint: ACCENT_HINT },
          { key: 'home.aboutText', label: 'Text', type: 'textarea', rows: 4 },
          { key: 'home.aboutImage', label: 'Image', type: 'image' },
        ],
      },
      {
        title: 'Why Choose Us',
        fields: [{ key: 'home.whyChooseJson', label: 'Reasons', type: 'list', hint: 'Shown on the Home, About and Services pages. Icons follow the order.' }],
      },
      {
        title: 'Call to Action',
        fields: [
          { key: 'home.ctaTitle', label: 'Heading', wide: true },
          { key: 'home.ctaText', label: 'Text', type: 'textarea', rows: 2 },
        ],
      },
    ],
  },
  stats: {
    label: 'Statistics',
    groups: [
      {
        title: 'Company Statistics',
        description: 'Shown on the homepage and About page. Numbers like "60+" count up when scrolled into view. Leave a value empty to show just the label with its icon.',
        fields: [1, 2, 3, 4].flatMap((n) => [
          { key: `stats.${n}.value`, label: `Statistic ${n}: value`, placeholder: 'e.g. 60+' },
          { key: `stats.${n}.label`, label: `Statistic ${n}: label`, placeholder: 'e.g. Sites Across Satara' },
        ]),
      },
    ],
  },
  about: {
    label: 'About Page',
    groups: [
      {
        title: 'Hero',
        fields: [
          { key: 'about.heroTitle', label: 'Heading', wide: true, hint: ACCENT_HINT },
          { key: 'about.heroText', label: 'Text', type: 'textarea', rows: 2 },
          { key: 'about.heroImage', label: 'Hero image', type: 'image' },
        ],
      },
      {
        title: 'Introduction & Story',
        fields: [
          { key: 'about.introTitle', label: 'Introduction heading', wide: true },
          { key: 'about.intro', label: 'Company introduction', type: 'textarea' },
          { key: 'about.storyTitle', label: 'Story heading', wide: true },
          { key: 'about.story', label: 'Our story', type: 'textarea', rows: 6 },
          { key: 'about.storyImage', label: 'Story image', type: 'image' },
        ],
      },
      {
        title: 'Vision & Mission',
        fields: [
          { key: 'about.vision', label: 'Our vision', type: 'textarea', rows: 3 },
          { key: 'about.mission', label: 'Our mission', type: 'textarea', rows: 3 },
        ],
      },
      {
        title: 'Core Values',
        fields: [
          { key: 'about.valuesJson', label: 'Values', type: 'list' },
          { key: 'about.valuesImage', label: 'Values image', type: 'image' },
        ],
      },
    ],
  },
  seo: {
    label: 'Footer & SEO',
    groups: [
      {
        title: 'Footer',
        fields: [
          { key: 'footer.text', label: 'Footer banner text', wide: true },
          { key: 'footer.copyright', label: 'Copyright note', wide: true, hint: 'Shown after "© year Company name."' },
        ],
      },
      {
        title: 'Search Engines (SEO)',
        description: 'How the website appears in Google results and when links are shared.',
        fields: [
          { key: 'seo.title', label: 'Website title', wide: true, hint: 'About 50–60 characters.' },
          { key: 'seo.description', label: 'Description', type: 'textarea', rows: 3, hint: 'About 150–160 characters.' },
        ],
      },
    ],
  },
};

export default function ContentAdmin() {
  const [tab, setTab] = useState('home');
  return (
    <>
      <PageHeader title="Manage Website Content" subtitle="Edit the text and images on the website. Changes go live as soon as you save." />
      <div className="segmented tabs" role="tablist" aria-label="Content sections">
        {Object.entries(TABS).map(([key, t]) => (
          <button key={key} type="button" role="tab" aria-selected={tab === key} className={tab === key ? 'is-active' : ''} onClick={() => setTab(key)}>
            {t.label}
          </button>
        ))}
      </div>
      <SettingsForm key={tab} groups={TABS[tab].groups} />
    </>
  );
}
