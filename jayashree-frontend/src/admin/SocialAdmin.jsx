import { PageHeader } from './ui.jsx';
import SettingsForm from './SettingsForm.jsx';

const GROUPS = [
  {
    title: 'Social Media Links',
    description: 'Paste the full link to each page. Icons only appear on the website for links that are filled in.',
    fields: [
      { key: 'social.facebook', label: 'Facebook', type: 'url', wide: true, placeholder: 'https://www.facebook.com/…' },
      { key: 'social.instagram', label: 'Instagram', type: 'url', wide: true, placeholder: 'https://www.instagram.com/…' },
      { key: 'social.youtube', label: 'YouTube', type: 'url', wide: true, placeholder: 'https://www.youtube.com/@…' },
      { key: 'social.linkedin', label: 'LinkedIn', type: 'url', wide: true, placeholder: 'https://www.linkedin.com/company/…' },
    ],
  },
];

export default function SocialAdmin() {
  return (
    <>
      <PageHeader title="Social Media Settings" />
      <SettingsForm groups={GROUPS} />
    </>
  );
}
