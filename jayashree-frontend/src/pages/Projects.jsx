import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { TbBuildingCottage, TbBuildingEstate, TbCircleCheck, TbCrane, TbHome, TbLayoutGrid } from 'react-icons/tb';
import CtaBand from '../components/CtaBand.jsx';
import PageHero from '../components/PageHero.jsx';
import ProjectCard from '../components/ProjectCard.jsx';
import Reveal from '../components/Reveal.jsx';
import SectionHeading from '../components/SectionHeading.jsx';
import { EmptyState, ErrorState, SkeletonGrid } from '../components/States.jsx';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { errorMessage, publicApi } from '../services/api.js';

/** Each tab maps to an API filter; the tab is kept in the URL (?filter=villas) so it can be shared. */
const FILTERS = [
  { key: 'all', label: 'All Projects', Icon: TbLayoutGrid, params: {} },
  { key: 'residential', label: 'Residential Homes', Icon: TbHome, params: { category: 'RESIDENTIAL' } },
  { key: 'bungalows', label: 'Bungalows', Icon: TbBuildingCottage, params: { category: 'BUNGALOW' } },
  { key: 'villas', label: 'Villas', Icon: TbBuildingEstate, params: { category: 'VILLA' } },
  { key: 'ongoing', label: 'Ongoing Projects', Icon: TbCrane, params: { status: 'ONGOING' } },
  { key: 'completed', label: 'Completed Projects', Icon: TbCircleCheck, params: { status: 'COMPLETED' } },
];
const PAGE_SIZE = 9;

export default function Projects() {
  usePageMeta('Projects', 'Residential homes, bungalows and villas built by Jayashree Construction & Developers in Satara.');
  const [params, setParams] = useSearchParams();
  const active = FILTERS.find((f) => f.key === params.get('filter')) || FILTERS[0];
  const [state, setState] = useState({ items: [], page: 0, totalPages: 0, loading: true, error: null, more: false });

  async function load(page, append) {
    setState((s) => ({ ...s, loading: !append, more: append, error: null }));
    try {
      const data = await publicApi.projects({ ...active.params, page, size: PAGE_SIZE });
      setState((s) => ({
        items: append ? [...s.items, ...data.content] : data.content,
        page: data.page,
        totalPages: data.totalPages,
        loading: false,
        more: false,
        error: null,
      }));
    } catch (error) {
      setState((s) => ({ ...s, loading: false, more: false, error: append ? s.error : error, moreError: append ? errorMessage(error) : '' }));
    }
  }

  useEffect(() => {
    load(0, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active.key]);

  return (
    <>
      <PageHero
        eyebrow="Our Projects"
        title="Homes & Spaces We've Built with *Trust*"
        text="A showcase of our residential homes, bungalows and villas, crafted with quality, care and attention to detail."
        image="/images/hero/projects.webp"
      />

      <div className="container">
        <div className="filter-bar" role="tablist" aria-label="Filter projects">
          {FILTERS.map(({ key, label, Icon }) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={active.key === key}
              className={active.key === key ? 'is-active' : ''}
              onClick={() => setParams(key === 'all' ? {} : { filter: key }, { replace: true })}
            >
              <Icon aria-hidden="true" /> {label}
            </button>
          ))}
        </div>
      </div>

      <section className="section section-tight" aria-labelledby="projects-list-heading">
        <div className="container">
          <SectionHeading title={active.key === 'all' ? 'Our *Projects*' : active.label} id="projects-list-heading" />
          {state.loading && <SkeletonGrid count={6} />}
          {state.error && <ErrorState error={state.error} onRetry={() => load(0, false)} />}
          {!state.loading && !state.error && state.items.length === 0 && (
            <EmptyState title="No projects here yet">
              {active.key === 'all' ? 'Our projects will appear here soon.' : 'Try another category, or view all projects.'}
            </EmptyState>
          )}
          {!state.loading && state.items.length > 0 && (
            <>
              <div className="card-grid">
                {state.items.map((p, i) => (
                  <Reveal key={p.id} delay={(i % 3) * 70}>
                    <ProjectCard project={p} />
                  </Reveal>
                ))}
              </div>
              {state.page + 1 < state.totalPages && (
                <div className="load-more">
                  <button type="button" className="btn btn-outline" disabled={state.more} onClick={() => load(state.page + 1, true)}>
                    {state.more ? 'Loading…' : 'Load more projects'}
                  </button>
                  {state.moreError && <p className="form-error">{state.moreError}</p>}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <CtaBand title="Planning Your Dream Home?" text="Explore our projects or talk to our team for a custom plan." buttonLabel="Get in Touch" />
    </>
  );
}
