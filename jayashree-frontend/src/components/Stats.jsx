import { useContent } from '../hooks/useContent.jsx';
import { useCountUp, useInView } from '../hooks/useInView.js';
import { STAT_ICONS } from './icons.js';

function Stat({ value, label, Icon, active }) {
  const shown = useCountUp(value, active);
  return (
    <div className="stat">
      <Icon className="stat-icon" aria-hidden="true" />
      {value ? <strong className="stat-value">{shown}</strong> : null}
      <span className="stat-label">{label}</span>
    </div>
  );
}

/** The four admin-editable statistics. A stat with no value shows its icon and label only. */
export default function Stats({ variant = 'cards' }) {
  const { get } = useContent();
  const [ref, inView] = useInView({ threshold: 0.3 });
  const stats = [1, 2, 3, 4]
    .map((n, i) => ({ value: get(`stats.${n}.value`), label: get(`stats.${n}.label`), Icon: STAT_ICONS[i] }))
    .filter((s) => s.label);

  return (
    <div ref={ref} className={`stats stats-${variant}`}>
      {stats.map((s) => (
        <Stat key={s.label} {...s} active={inView} />
      ))}
    </div>
  );
}
