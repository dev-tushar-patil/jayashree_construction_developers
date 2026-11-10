import axios from 'axios';

const API_ORIGIN = (import.meta.env.VITE_API_ORIGIN || '').replace(/\/$/, '');
const TOKEN_KEY = 'jayashree.admin.token';

/** Public API: read-only content plus the enquiry and review forms. */
export const api = axios.create({ baseURL: `${API_ORIGIN}/api`, timeout: 20000 });

/** Admin API: attaches the JWT and reports expiry so the panel can return to the login page. */
export const adminApi = axios.create({ baseURL: `${API_ORIGIN}/api`, timeout: 120000 });

let onUnauthorized = () => {};
export const setUnauthorizedHandler = (fn) => {
  onUnauthorized = fn;
};

adminApi.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login')) onUnauthorized();
    return Promise.reject(error);
  },
);

// The token lives in sessionStorage: it is gone when the browser tab closes, and never in source code.
function storage() {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}
export const getToken = () => storage()?.getItem(TOKEN_KEY) || null;
export const setToken = (token) => (token ? storage()?.setItem(TOKEN_KEY, token) : storage()?.removeItem(TOKEN_KEY));

/** Bundled demo images are served by the website; uploads by the API (or the configured storage). */
export function assetUrl(url) {
  if (!url) return '';
  if (url.startsWith('/images/')) return `${import.meta.env.BASE_URL}${url.slice(1)}`;
  return url.startsWith('/uploads/') ? `${API_ORIGIN}${url}` : url;
}

export function errorMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.response?.status === 413) return 'The upload is too large. Try fewer or smaller images at a time.';
  if (error?.request && !error?.response) return 'We could not reach the server. Please check your connection and try again.';
  return fallback;
}

export const fieldErrors = (error) => error?.response?.data?.fieldErrors || {};

const data = (promise) => promise.then((r) => r.data);

/** Everything the public site reads or submits. */
const liveApi = {
  content: () => data(api.get('/content')),
  projects: (params) => data(api.get('/projects', { params })),
  featuredProjects: (limit = 6) => data(api.get('/projects/featured', { params: { limit } })),
  project: (slug) => data(api.get(`/projects/${encodeURIComponent(slug)}`)),
  services: () => data(api.get('/services')),
  service: (slug) => data(api.get(`/services/${encodeURIComponent(slug)}`)),
  gallery: (params) => data(api.get('/gallery', { params })),
  reviews: (params) => data(api.get('/reviews', { params })),
  testimonials: () => data(api.get('/reviews/featured')),
  reviewSummary: () => data(api.get('/reviews/summary')),
  submitReview: (body) => data(api.post('/reviews', body)),
  enquire: (body) => data(api.post('/enquiries', body)),
};

/*
 * Static preview (GitHub Pages): no server, so content comes from a saved snapshot (preview-data.json, made by
 * `npm run build:pages`) and is filtered here. Forms don't save anything; the success panels offer WhatsApp.
 */
export const IS_PREVIEW = import.meta.env.VITE_STATIC_PREVIEW === 'true';

let snapshot;
const preview = () => {
  snapshot ||= fetch(`${import.meta.env.BASE_URL}preview-data.json`).then((r) => {
    if (!r.ok) throw new Error('Preview content could not be loaded');
    return r.json();
  });
  return snapshot;
};

const notFound = () => Promise.reject(Object.assign(new Error('Not found'), { response: { status: 404, data: { message: 'Not found' } } }));

function paged(items, { page = 0, size = 12 } = {}) {
  const start = page * size;
  return { content: items.slice(start, start + size), page, size, totalElements: items.length, totalPages: Math.ceil(items.length / size) };
}

const previewApi = {
  content: () => preview().then((d) => d.content),
  projects: (params = {}) =>
    preview().then((d) =>
      paged(
        d.projects.filter((p) => (!params.category || p.category === params.category) && (!params.status || p.status === params.status)),
        params,
      ),
    ),
  featuredProjects: (limit = 6) => preview().then((d) => d.featured.slice(0, limit)),
  project: (slug) => preview().then((d) => d.projectDetails[slug] || notFound()),
  services: () => preview().then((d) => d.services),
  service: (slug) => preview().then((d) => d.services.find((s) => s.slug === slug) || notFound()),
  gallery: (params = {}) => preview().then((d) => paged(d.gallery.filter((g) => !params.category || g.category === params.category), params)),
  reviews: (params = {}) => preview().then((d) => paged(d.reviews, params)),
  testimonials: () => preview().then((d) => d.testimonials),
  reviewSummary: () => preview().then((d) => d.reviewSummary),
  submitReview: async () => ({ message: 'Thank you! (This is a demo preview, so reviews are not saved yet.)' }),
  enquire: async () => ({ id: 0, preview: true }),
};

export const publicApi = IS_PREVIEW ? previewApi : liveApi;
