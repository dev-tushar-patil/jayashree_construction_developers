import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { TbBuildingCottage, TbCircleCheck, TbCrane, TbHome, TbHomeEco, TbPhoto, TbSofa } from 'react-icons/tb';
import CtaBand from '../components/CtaBand.jsx';
import Lightbox from '../components/Lightbox.jsx';
import PageHero from '../components/PageHero.jsx';
import { EmptyState, ErrorState, Spinner } from '../components/States.jsx';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { assetUrl, errorMessage, publicApi } from '../services/api.js';

const FILTERS = [
  { key: 'all', label: 'All', Icon: TbPhoto },
  { key: 'EXTERIOR', label: 'Exterior', Icon: TbHome },
  { key: 'INTERIOR', label: 'Interior', Icon: TbSofa },
  { key: 'BUNGALOW', label: 'Bungalows', Icon: TbBuildingCottage },
  { key: 'RESIDENTIAL', label: 'Residential Projects', Icon: TbHomeEco },
  { key: 'ONGOING', label: 'Ongoing Projects', Icon: TbCrane },
  { key: 'COMPLETED', label: 'Completed Projects', Icon: TbCircleCheck },
];
const PAGE_SIZE = 18;

export default function Gallery() {
  usePageMeta('Gallery', 'Photos of homes, bungalows, villas and interiors by Jayashri Construction & Developers.');
  const [params, setParams] = useSearchParams();
  const active = FILTERS.find((f) => f.key === params.get('category')) || FILTERS[0];
  const [state, setState] = useState({ items: [], page: 0, totalPages: 0, loading: true, error: null, more: false, moreError: '' });
  const [lightbox, setLightbox] = useState(null);

  async function load(page, append) {
    setState((s) => ({ ...s, loading: !append, more: append, error: null, moreError: '' }));
    try {
      const data = await publicApi.gallery({ category: active.key === 'all' ? undefined : active.key, page, size: PAGE_SIZE });
      setState((s) => ({
        items: append ? [...s.items, ...data.content] : data.content,
        page: data.page,
        totalPages: data.totalPages,
        loading: false,
        more: false,
        error: null,
        moreError: '',
      }));
    } catch (error) {
      setState((s) => ({ ...s, loading: false, more: false, error: append ? null : error, moreError: append ? errorMessage(error) : '' }));
    }
  }

  useEffect(() => {
    load(0, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active.key]);

  return (
    <>
      <PageHero
        eyebrow="Our Gallery"
        title="A Glimpse of Our *Work*"
        text="Explore our completed and ongoing projects, showcasing the quality, design and craftsmanship that define Jayashri Construction & Developers."
        image="/images/hero/gallery.webp"
      />

      <div className="container">
        <div className="filter-bar" role="tablist" aria-label="Filter photos">
          {FILTERS.map(({ key, label, Icon }) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={active.key === key}
              className={active.key === key ? 'is-active' : ''}
              onClick={() => setParams(key === 'all' ? {} : { category: key }, { replace: true })}
            >
              <Icon aria-hidden="true" /> {label}
            </button>
          ))}
        </div>
      </div>

      <section className="section section-tight" aria-label={`${active.label} photos`}>
        <div className="container">
          {state.loading && <Spinner label="Loading photos…" />}
          {state.error && <ErrorState error={state.error} onRetry={() => load(0, false)} />}
          {!state.loading && !state.error && state.items.length === 0 && (
            <EmptyState title="No photos in this category yet" icon={TbPhoto}>
              New photos appear here as soon as they are uploaded.
            </EmptyState>
          )}
          {!state.loading && state.items.length > 0 && (
            <>
              <div className="masonry">
                {state.items.map((img, i) => (
                  <button key={img.id} type="button" className="masonry-item" onClick={() => setLightbox(i)} aria-label={`Open photo: ${img.title}`}>
                    <img
                      src={assetUrl(img.thumbUrl || img.url)}
                      alt={img.title}
                      loading="lazy"
                      decoding="async"
                      width={img.width || undefined}
                      height={img.height || undefined}
                    />
                    <span className="masonry-caption">{img.title}</span>
                  </button>
                ))}
              </div>
              {state.page + 1 < state.totalPages && (
                <div className="load-more">
                  <button type="button" className="btn btn-outline" disabled={state.more} onClick={() => load(state.page + 1, true)}>
                    {state.more ? 'Loading…' : 'Load more photos'}
                  </button>
                  {state.moreError && <p className="form-error">{state.moreError}</p>}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <CtaBand title="Inspired by Our Work?" text="Let's build a home that is uniquely yours." buttonLabel="Get in Touch" />

      {lightbox !== null && <Lightbox images={state.items} index={lightbox} onClose={() => setLightbox(null)} onNavigate={setLightbox} />}
    </>
  );
}
