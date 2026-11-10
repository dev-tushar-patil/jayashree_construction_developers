import { useEffect } from 'react';
import { useContent } from './useContent.jsx';

function setMeta(selector, value) {
  const tag = document.head.querySelector(selector);
  if (tag && value) tag.setAttribute('content', value);
}

/** Per-page title and description for search results and link previews; defaults come from the SEO settings. */
export function usePageMeta(title, description) {
  const { get } = useContent();
  const siteTitle = get('seo.title');
  const siteDescription = get('seo.description');
  const company = get('company.name');

  useEffect(() => {
    const full = title ? `${title} | ${company}` : siteTitle;
    const desc = description || siteDescription;
    document.title = full;
    setMeta('meta[name="description"]', desc);
    setMeta('meta[property="og:title"]', full);
    setMeta('meta[property="og:description"]', desc);
  }, [title, description, siteTitle, siteDescription, company]);
}
