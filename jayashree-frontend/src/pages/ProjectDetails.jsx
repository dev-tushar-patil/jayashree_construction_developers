import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { TbArrowLeft, TbCalendar, TbCategory, TbCircleCheckFilled, TbMapPin, TbMapPinFilled, TbPhoto } from 'react-icons/tb';
import EnquiryForm from '../components/EnquiryForm.jsx';
import Lightbox from '../components/Lightbox.jsx';
import ProjectCard, { StatusBadge } from '../components/ProjectCard.jsx';
import SectionHeading from '../components/SectionHeading.jsx';
import { ErrorState, Spinner } from '../components/States.jsx';
import WhatsAppButton from '../components/WhatsAppButton.jsx';
import { useFetch } from '../hooks/useFetch.js';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { assetUrl, publicApi } from '../services/api.js';
import { projectWhatsappMessage } from '../services/contact.js';
import { PROJECT_CATEGORIES, formatDate } from '../services/labels.js';
import NotFound from './NotFound.jsx';

export default function ProjectDetails() {
  const { slug } = useParams();
  const { data: project, loading, error, reload } = useFetch(() => publicApi.project(slug), [slug]);
  const related = useFetch(() => publicApi.featuredProjects(4), []);
  const [lightbox, setLightbox] = useState(null);
  usePageMeta(project?.name, project?.shortDescription);

  if (loading) return <Spinner label="Loading project…" />;
  if (error?.response?.status === 404) return <NotFound what="project" />;
  if (error) {
    return (
      <div className="container section">
        <ErrorState error={error} onRetry={reload} />
      </div>
    );
  }

  const cover = project.images.find((i) => i.cover) || project.images[0];
  const gallery = project.images.map((i) => ({ url: i.url, thumbUrl: i.thumbUrl, title: i.caption || project.name }));
  const whatsappMessage = projectWhatsappMessage(project.name);
  const others = (related.data || []).filter((p) => p.id !== project.id).slice(0, 3);

  return (
    <>
      <section className="project-banner">
        {cover ? <img src={assetUrl(cover.url)} alt="" fetchpriority="high" /> : <div className="project-banner-empty" />}
        <div className="project-banner-shade" aria-hidden="true" />
        <div className="container project-banner-inner">
          <Link to="/projects" className="back-link">
            <TbArrowLeft aria-hidden="true" /> All projects
          </Link>
          <StatusBadge status={project.status} />
          <h1>{project.name}</h1>
          <p>
            <TbMapPin aria-hidden="true" /> {project.location}
          </p>
        </div>
      </section>

      <section className="section section-tight">
        <div className="container detail-grid">
          <div className="detail-main">
            <SectionHeading eyebrow="About the Project" title={project.shortDescription} as="h2" />
            {project.description && <p className="pre-line detail-description">{project.description}</p>}

            {project.features.length > 0 && (
              <>
                <h2 className="detail-subheading">Project Features</h2>
                <ul className="feature-list">
                  {project.features.map((f) => (
                    <li key={f}>
                      <TbCircleCheckFilled aria-hidden="true" /> {f}
                    </li>
                  ))}
                </ul>
              </>
            )}

            <h2 className="detail-subheading">
              Project Gallery <span className="muted">({gallery.length} photos)</span>
            </h2>
            {gallery.length === 0 ? (
              <p className="muted">
                <TbPhoto aria-hidden="true" /> Photos of this project will be added soon.
              </p>
            ) : (
              <div className="detail-gallery">
                {gallery.map((img, i) => (
                  <button key={img.url} type="button" className="detail-thumb" onClick={() => setLightbox(i)} aria-label={`Open photo ${i + 1} of ${gallery.length}`}>
                    <img src={assetUrl(img.thumbUrl || img.url)} alt="" loading="lazy" decoding="async" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <aside className="detail-aside">
            <div className="info-card">
              <h2>Project Information</h2>
              <dl>
                <div>
                  <dt>
                    <TbCategory aria-hidden="true" /> Type
                  </dt>
                  <dd>{PROJECT_CATEGORIES[project.category]}</dd>
                </div>
                <div>
                  <dt>
                    <TbMapPin aria-hidden="true" /> Location
                  </dt>
                  <dd>{project.location}</dd>
                </div>
                <div>
                  <dt>
                    <TbCircleCheckFilled aria-hidden="true" /> Status
                  </dt>
                  <dd>
                    <StatusBadge status={project.status} />
                  </dd>
                </div>
                {project.startDate && (
                  <div>
                    <dt>
                      <TbCalendar aria-hidden="true" /> Started
                    </dt>
                    <dd>{formatDate(project.startDate, { month: 'long', year: 'numeric' })}</dd>
                  </div>
                )}
                {project.completionDate && (
                  <div>
                    <dt>
                      <TbCalendar aria-hidden="true" /> Completed
                    </dt>
                    <dd>{formatDate(project.completionDate, { month: 'long', year: 'numeric' })}</dd>
                  </div>
                )}
              </dl>
              <div className="info-actions">
                {project.mapsUrl && (
                  <a className="btn btn-outline btn-block" href={project.mapsUrl} target="_blank" rel="noopener noreferrer">
                    <TbMapPinFilled aria-hidden="true" /> View on Google Maps
                  </a>
                )}
                <WhatsAppButton className="btn btn-whatsapp btn-block" message={whatsappMessage}>
                  Enquiry on WhatsApp
                </WhatsAppButton>
              </div>
            </div>

            <div className="info-card">
              <h2>Enquire About This Project</h2>
              <EnquiryForm type="PROJECT" projectId={project.id} projectName={project.name} compact whatsappMessage={whatsappMessage} />
            </div>
          </aside>
        </div>
      </section>

      {others.length > 0 && (
        <section className="section section-sand">
          <div className="container">
            <SectionHeading eyebrow="Explore More" title="Other *Projects*" />
            <div className="card-grid">
              {others.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {lightbox !== null && <Lightbox images={gallery} index={lightbox} onClose={() => setLightbox(null)} onNavigate={setLightbox} />}
    </>
  );
}
