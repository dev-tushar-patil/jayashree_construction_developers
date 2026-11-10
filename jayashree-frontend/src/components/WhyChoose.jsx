import { useContent } from '../hooks/useContent.jsx';
import { WHY_ICONS } from './icons.js';
import Reveal from './Reveal.jsx';
import SectionHeading from './SectionHeading.jsx';

const FALLBACK = [
  { title: 'Quality Construction', text: 'Tested materials, skilled workmanship and strict site supervision.' },
  { title: 'Transparent Process', text: 'Clear estimates, honest communication and regular updates.' },
  { title: 'Experienced Team', text: 'Engineers, planners and site teams who have built across Satara.' },
  { title: 'Timely Delivery', text: 'Realistic schedules and on-time handover.' },
  { title: 'Customer Satisfaction', text: 'Homes designed around your needs.' },
  { title: 'Attention to Detail', text: 'From foundations to finishing, every detail is cared for.' },
];

export default function WhyChoose({ compact }) {
  const { list } = useContent();
  const items = list('home.whyChooseJson');
  const shown = items.length ? items : FALLBACK;

  if (compact) {
    return (
      <div className="why-strip">
        <h2>
          Why Choose <em>Jayashri?</em>
        </h2>
        <ul>
          {shown.slice(0, 4).map((item, i) => {
            const Icon = WHY_ICONS[i % WHY_ICONS.length];
            return (
              <li key={item.title}>
                <Icon aria-hidden="true" />
                <span>{item.title}</span>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  return (
    <section className="section section-sand" aria-labelledby="why-heading">
      <div className="container">
        <SectionHeading eyebrow="Why Choose Us" title="Why Families Choose *Jayashri*" center id="why-heading" />
        <div className="why-grid">
          {shown.map((item, i) => {
            const Icon = WHY_ICONS[i % WHY_ICONS.length];
            return (
              <Reveal key={item.title} className="why-card" delay={i * 60}>
                <span className="why-icon">
                  <Icon aria-hidden="true" />
                </span>
                <h3>{item.title}</h3>
                {item.text && <p>{item.text}</p>}
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
