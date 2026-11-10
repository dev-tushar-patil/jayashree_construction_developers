import { Link } from 'react-router-dom';
import { TbArrowRight, TbCircleCheck, TbHourglassHigh, TbMapPin, TbPhoto } from 'react-icons/tb';
import { assetUrl } from '../services/api.js';
import { PROJECT_STATUS } from '../services/labels.js';

export function StatusBadge({ status }) {
  const Icon = status === 'COMPLETED' ? TbCircleCheck : TbHourglassHigh;
  return (
    <span className={`status-badge status-${String(status).toLowerCase()}`}>
      <Icon aria-hidden="true" /> {PROJECT_STATUS[status] || status}
    </span>
  );
}

export default function ProjectCard({ project }) {
  const to = `/projects/${project.slug}`;
  const image = project.coverThumbUrl || project.coverUrl;
  return (
    <article className="project-card">
      <Link to={to} className="project-card-media" tabIndex={-1} aria-hidden="true">
        {image ? (
          <img src={assetUrl(image)} alt="" loading="lazy" decoding="async" />
        ) : (
          <span className="image-placeholder">
            <TbPhoto />
          </span>
        )}
        <StatusBadge status={project.status} />
      </Link>
      <div className="project-card-body">
        <h3>
          <Link to={to}>{project.name}</Link>
        </h3>
        <p className="project-location">
          <TbMapPin aria-hidden="true" /> {project.location}
        </p>
        <p className="project-summary">{project.shortDescription}</p>
        <Link to={to} className="btn btn-outline btn-sm" aria-label={`View details of ${project.name}`}>
          View Details <TbArrowRight aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
