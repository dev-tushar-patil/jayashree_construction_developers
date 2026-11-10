/**
 * Saves the running site's public content into public/preview-data.json for the static GitHub Pages preview.
 * Needs the API running (start-local.cmd). Usage: npm run build:pages
 * Only public, read-only data is exported: no enquiries, admin data or review phone numbers.
 */
import { writeFileSync } from 'node:fs';

const API = (process.env.PREVIEW_API || 'http://localhost:8070') + '/api';

async function get(path) {
  const res = await fetch(API + path);
  if (!res.ok) throw new Error(`${path} -> HTTP ${res.status}. Is the API running? (start-local.cmd)`);
  return res.json();
}

const content = await get('/content');
const services = await get('/services');
const projects = (await get('/projects?size=24&page=0')).content;
const featured = await get('/projects/featured?limit=6');
const projectDetails = {};
for (const p of projects) projectDetails[p.slug] = await get(`/projects/${encodeURIComponent(p.slug)}`);
const gallery = (await get('/gallery?size=60&page=0')).content;
const reviews = (await get('/reviews?size=50&page=0')).content;
const testimonials = await get('/reviews/featured');
const reviewSummary = await get('/reviews/summary');

const uploaded = JSON.stringify({ projects: Object.values(projectDetails), gallery, reviews, services, content }).includes('/uploads/');
if (uploaded) {
  console.warn('Note: some images are uploads served by the API; they will not show on the static preview.');
}

writeFileSync(
  new URL('../public/preview-data.json', import.meta.url),
  JSON.stringify({ exportedAt: new Date().toISOString(), content, services, projects, featured, projectDetails, gallery, reviews, testimonials, reviewSummary }),
);
console.log(`Preview data saved: ${projects.length} projects, ${gallery.length} photos, ${reviews.length} reviews, ${services.length} services.`);
