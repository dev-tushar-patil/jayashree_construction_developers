import { TbBrandFacebook, TbBrandInstagram, TbBrandLinkedin, TbBrandYoutube } from 'react-icons/tb';
import { useContent } from '../hooks/useContent.jsx';

const NETWORKS = [
  ['social.facebook', 'Facebook', TbBrandFacebook],
  ['social.instagram', 'Instagram', TbBrandInstagram],
  ['social.youtube', 'YouTube', TbBrandYoutube],
  ['social.linkedin', 'LinkedIn', TbBrandLinkedin],
];

/** Only networks with a link set in the admin panel are shown. */
export default function SocialLinks({ className = '' }) {
  const { get } = useContent();
  const links = NETWORKS.filter(([key]) => get(key));
  if (!links.length) return null;
  return (
    <ul className={`social-links ${className}`}>
      {links.map(([key, label, Icon]) => (
        <li key={key}>
          <a href={get(key)} target="_blank" rel="noopener noreferrer" aria-label={label}>
            <Icon aria-hidden="true" />
          </a>
        </li>
      ))}
    </ul>
  );
}
