import { Link } from 'react-router-dom';
import { TbArrowRight, TbBuildingEstate, TbMessageCircle } from 'react-icons/tb';
import Accent from '../components/Accent.jsx';
import CtaBand from '../components/CtaBand.jsx';
import { MissionIcon, VisionIcon } from '../components/icons.js';
import ProjectCard from '../components/ProjectCard.jsx';
import Reveal from '../components/Reveal.jsx';
import SectionHeading from '../components/SectionHeading.jsx';
import ServiceCard from '../components/ServiceCard.jsx';
import { EmptyState, ErrorState, SkeletonGrid } from '../components/States.jsx';
import Stats from '../components/Stats.jsx';
import TestimonialSlider from '../components/TestimonialSlider.jsx';
import WhyChoose from '../components/WhyChoose.jsx';
import { useContent } from '../hooks/useContent.jsx';
import { useFetch } from '../hooks/useFetch.js';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { assetUrl, publicApi } from '../services/api.js';

export default function Home() {
  const { get } = useContent();
  usePageMeta(null);
  // Featured projects first, then the newest published ones: a project added in the admin panel shows here at once.
  const projects = useFetch(() => publicApi.featuredProjects(6), []);
  const services = useFetch(() => publicApi.services(), []);
  const reviews = useFetch(() => publicApi.testimonials(), []);

  return (
    <>
      <section className="home-hero">
        <img className="home-hero-bg" src={assetUrl(get('home.heroImage'))} alt="" fetchpriority="high" />
        <div className="home-hero-shade" aria-hidden="true" />
        <div className="container home-hero-inner">
          <p className="eyebrow eyebrow-light">{get('company.name')}</p>
          <h1>
            <Accent text={get('home.heroTitle')} />
          </h1>
          <p className="home-hero-text">{get('home.heroSubtitle')}</p>
          <div className="hero-actions">
            <Link to="/projects" className="btn btn-primary btn-lg">
              <TbBuildingEstate aria-hidden="true" /> Explore Our Projects
            </Link>
            <Link to="/get-a-quote" className="btn btn-light btn-lg">
              <TbMessageCircle aria-hidden="true" /> Get a Free Consultation
            </Link>
          </div>
        </div>
      </section>

      <section className="stats-section" aria-label="Company highlights">
        <div className="container">
          <Stats variant="cards" />
        </div>
      </section>

      <section className="section" aria-labelledby="about-heading">
        <div className="container split">
          <Reveal className="split-media arch-frame">
            <img src={assetUrl(get('home.aboutImage'))} alt="A home built by Jayashri Construction & Developers" loading="lazy" />
          </Reveal>
          <Reveal className="split-copy" delay={100}>
            <SectionHeading eyebrow="About Jayashri" title={get('home.aboutTitle')} id="about-heading" />
            <p className="lead">{get('home.aboutText')}</p>
            <div className="mini-cards">
              <div className="mini-card">
                <VisionIcon aria-hidden="true" />
                <div>
                  <h3>Our Vision</h3>
                  <p>{get('about.vision')}</p>
                </div>
              </div>
              <div className="mini-card">
                <MissionIcon aria-hidden="true" />
                <div>
                  <h3>Our Mission</h3>
                  <p>{get('about.mission')}</p>
                </div>
              </div>
            </div>
            <Link to="/about" className="btn btn-outline">
              Read More <TbArrowRight aria-hidden="true" />
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="section section-sand" aria-labelledby="projects-heading">
        <div className="container">
          <div className="section-head-row">
            <SectionHeading eyebrow="Featured Projects" title="Homes & Spaces We've *Built*" id="projects-heading" />
            <Link to="/projects" className="text-link">
              View all projects <TbArrowRight aria-hidden="true" />
            </Link>
          </div>
          {projects.loading && <SkeletonGrid count={3} />}
          {projects.error && <ErrorState error={projects.error} onRetry={projects.reload} />}
          {projects.data && projects.data.length === 0 && (
            <EmptyState title="Our first projects are coming soon">New projects will appear here as soon as they are published.</EmptyState>
          )}
          {projects.data && projects.data.length > 0 && (
            <div className="card-grid">
              {projects.data.map((p, i) => (
                <Reveal key={p.id} delay={(i % 3) * 80}>
                  <ProjectCard project={p} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section" aria-labelledby="services-heading">
        <div className="container">
          <div className="section-head-row">
            <SectionHeading eyebrow="Our Services" title="What We *Offer*" id="services-heading" />
            <Link to="/services" className="text-link">
              All services <TbArrowRight aria-hidden="true" />
            </Link>
          </div>
          {services.loading && <SkeletonGrid count={3} className="service-grid" />}
          {services.error && <ErrorState error={services.error} onRetry={services.reload} />}
          {services.data && (
            <div className="service-grid">
              {services.data.slice(0, 6).map((s, i) => (
                <Reveal key={s.id} delay={(i % 3) * 80}>
                  <ServiceCard service={s} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      <WhyChoose />

      {reviews.data && reviews.data.length > 0 && (
        <section className="section" aria-labelledby="reviews-heading">
          <div className="container">
            <div className="section-head-row">
              <SectionHeading eyebrow="Customer Reviews" title="What Our *Customers* Say" id="reviews-heading" />
              <Link to="/reviews" className="text-link">
                All reviews <TbArrowRight aria-hidden="true" />
              </Link>
            </div>
            <TestimonialSlider reviews={reviews.data} />
          </div>
        </section>
      )}

      <CtaBand buttonLabel="Contact Us" />
    </>
  );
}
