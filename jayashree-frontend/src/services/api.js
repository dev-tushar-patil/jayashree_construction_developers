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
export const publicApi = {
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
