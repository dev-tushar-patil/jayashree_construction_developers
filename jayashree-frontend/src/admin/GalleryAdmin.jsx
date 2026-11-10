import { useEffect, useState } from 'react';
import { TbEdit, TbEye, TbEyeOff, TbSearch, TbStarFilled, TbTrash, TbUpload } from 'react-icons/tb';
import Field from '../components/Field.jsx';
import { EmptyState, ErrorState, Spinner } from '../components/States.jsx';
import { useFetch } from '../hooks/useFetch.js';
import { useToast } from '../hooks/useToast.jsx';
import { adminApi, assetUrl, errorMessage, fieldErrors } from '../services/api.js';
import { GALLERY_CATEGORIES } from '../services/labels.js';
import { Badge, Modal, MultiImagePicker, PageHeader, Pagination, ProgressBar, Toggle, useConfirm } from './ui.jsx';
import { uploadInBatches } from './uploads.js';

function UploadPanel({ onDone }) {
  const toast = useToast();
  const [picked, setPicked] = useState([]);
  const [meta, setMeta] = useState({ category: 'EXTERIOR', description: '', published: true, featured: false });
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState('');

  async function upload() {
    if (!picked.length) {
      setError('Please choose at least one photo.');
      return;
    }
    setError('');
    try {
      await uploadInBatches(
        picked,
        (files, group) => {
          const form = new FormData();
          files.forEach((f, i) => {
            form.append('files', f);
            form.append('titles', group[i].title || '');
          });
          form.append('category', meta.category);
          form.append('description', meta.description);
          form.append('published', meta.published);
          form.append('featured', meta.featured);
          return form;
        },
        (form) => adminApi.post('/admin/gallery', form).then((r) => r.data),
        (value, label) => setProgress({ value, label }),
      );
      toast.success(`${picked.length} photo${picked.length === 1 ? '' : 's'} uploaded${meta.published ? ' and live in the gallery' : ''}.`);
      picked.forEach((p) => URL.revokeObjectURL(p.preview));
      setPicked([]);
      onDone();
    } catch (err) {
      setError(`${errorMessage(err)} Photos uploaded before the error are saved.`);
      onDone();
    } finally {
      setProgress(null);
    }
  }

  const busy = Boolean(progress);
  return (
    <section className="panel panel-pad">
      <h2 className="panel-title">Upload Photos</h2>
      <div className="form-grid form-grid-4">
        <Field label="Category" as="select" required value={meta.category} onChange={(e) => setMeta((m) => ({ ...m, category: e.target.value }))} disabled={busy}>
          {Object.entries(GALLERY_CATEGORIES).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </Field>
        <Field
          label="Description (optional, applies to all)"
          value={meta.description}
          onChange={(e) => setMeta((m) => ({ ...m, description: e.target.value }))}
          maxLength={500}
          disabled={busy}
          className="span-2"
        />
        <div className="field toggles-stack">
          <Toggle checked={meta.published} onChange={(v) => setMeta((m) => ({ ...m, published: v }))} label="Visible on website" disabled={busy} />
          <Toggle checked={meta.featured} onChange={(v) => setMeta((m) => ({ ...m, featured: v }))} label="Featured" disabled={busy} />
        </div>
      </div>
      <MultiImagePicker files={picked} onChange={setPicked} withTitles disabled={busy} />
      {progress && <ProgressBar value={progress.value} label={progress.label} />}
      {error && <p className="form-error">{error}</p>}
      <div className="panel-actions">
        <button type="button" className="btn btn-primary" onClick={upload} disabled={busy || !picked.length}>
          <TbUpload aria-hidden="true" /> {busy ? 'Uploading…' : `Upload ${picked.length || ''} photo${picked.length === 1 ? '' : 's'}`}
        </button>
      </div>
    </section>
  );
}

function EditModal({ image, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: image.title,
    description: image.description || '',
    category: image.category,
    featured: image.featured,
    published: image.published,
    sortOrder: image.sortOrder,
  });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function save() {
    if (!form.title.trim()) {
      setErrors({ title: 'Please enter a title.' });
      return;
    }
    setBusy(true);
    try {
      const { data } = await adminApi.put(`/admin/gallery/${image.id}`, { ...form, sortOrder: Number(form.sortOrder) || 0 });
      onSaved(data);
    } catch (err) {
      setErrors(fieldErrors(err));
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <Modal
      title="Edit photo"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={save} disabled={busy}>
            {busy ? 'Saving…' : 'Save'}
          </button>
        </>
      }
    >
      <img src={assetUrl(image.thumbUrl || image.url)} alt="" className="modal-preview" />
      <div className="form-grid">
        <Field label="Title" required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} error={errors.title} maxLength={150} className="span-2" />
        <Field label="Description" as="textarea" rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} maxLength={500} className="span-2" />
        <Field label="Category" as="select" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
          {Object.entries(GALLERY_CATEGORIES).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </Field>
        <Field label="Display order" type="number" value={form.sortOrder} onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))} hint="Lower numbers show first." />
        <div className="span-2 toggles-row">
          <Toggle checked={form.published} onChange={(v) => setForm((f) => ({ ...f, published: v }))} label="Visible on website" />
          <Toggle checked={form.featured} onChange={(v) => setForm((f) => ({ ...f, featured: v }))} label="Featured (shown first)" />
        </div>
      </div>
      {error && <p className="form-error">{error}</p>}
    </Modal>
  );
}

export default function GalleryAdmin() {
  const toast = useToast();
  const [confirm, confirmDialog] = useConfirm();
  const [filters, setFilters] = useState({ q: '', category: '', published: '', page: 0 });
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);

  const { data, loading, error, reload, setData } = useFetch(
    () =>
      adminApi
        .get('/admin/gallery', {
          params: { q: filters.q || undefined, category: filters.category || undefined, published: filters.published || undefined, page: filters.page, size: 24 },
        })
        .then((r) => r.data),
    [filters],
  );

  useEffect(() => {
    const t = setTimeout(() => setFilters((f) => (f.q === search ? f : { ...f, q: search, page: 0 })), 350);
    return () => clearTimeout(t);
  }, [search]);

  const replace = (updated) => setData((d) => ({ ...d, content: d.content.map((g) => (g.id === updated.id ? updated : g)) }));

  async function toggleVisible(image) {
    try {
      const { data: updated } = await adminApi.put(`/admin/gallery/${image.id}`, {
        title: image.title,
        description: image.description,
        category: image.category,
        featured: image.featured,
        published: !image.published,
        sortOrder: image.sortOrder,
      });
      replace(updated);
      toast.success(updated.published ? 'Photo is visible on the website.' : 'Photo hidden from the website.');
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }

  function remove(image) {
    confirm({
      title: 'Delete photo?',
      message: `"${image.title}" will be permanently deleted from the gallery.`,
      onConfirm: async () => {
        await adminApi.delete(`/admin/gallery/${image.id}`);
        toast.success('Photo deleted.');
        reload();
      },
    });
  }

  return (
    <>
      <PageHeader title="Manage Gallery" subtitle="Visible photos appear on the website's Gallery page straight away." />
      <UploadPanel onDone={reload} />

      <div className="toolbar">
        <label className="search-box">
          <TbSearch aria-hidden="true" />
          <input type="search" placeholder="Search titles" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search photos" />
        </label>
        <select value={filters.category} onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value, page: 0 }))} aria-label="Filter by category">
          <option value="">All categories</option>
          {Object.entries(GALLERY_CATEGORIES).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <select value={filters.published} onChange={(e) => setFilters((f) => ({ ...f, published: e.target.value, page: 0 }))} aria-label="Filter by visibility">
          <option value="">Visible &amp; hidden</option>
          <option value="true">Visible</option>
          <option value="false">Hidden</option>
        </select>
      </div>

      {loading && !data && <Spinner />}
      {error && <ErrorState error={error} onRetry={reload} />}
      {data && data.content.length === 0 && <EmptyState title="No photos found">Upload photos above to fill the gallery.</EmptyState>}
      {data && data.content.length > 0 && (
        <ul className="gallery-admin-grid">
          {data.content.map((g) => (
            <li key={g.id} className={g.published ? '' : 'is-hidden'}>
              <img src={assetUrl(g.thumbUrl || g.url)} alt="" loading="lazy" />
              <div className="gallery-admin-body">
                <strong className="clamp-1">{g.title}</strong>
                <span>
                  {GALLERY_CATEGORIES[g.category]}
                  {g.featured && (
                    <>
                      {' '}
                      · <TbStarFilled className="inline-star" aria-label="Featured" />
                    </>
                  )}
                  {!g.published && (
                    <>
                      {' '}
                      · <Badge>Hidden</Badge>
                    </>
                  )}
                </span>
              </div>
              <div className="gallery-admin-actions">
                <button type="button" className="icon-btn" onClick={() => toggleVisible(g)} aria-label={g.published ? 'Hide from website' : 'Show on website'} title={g.published ? 'Hide' : 'Show'}>
                  {g.published ? <TbEye /> : <TbEyeOff />}
                </button>
                <button type="button" className="icon-btn" onClick={() => setEditing(g)} aria-label={`Edit ${g.title}`} title="Edit">
                  <TbEdit />
                </button>
                <button type="button" className="icon-btn icon-btn-danger" onClick={() => remove(g)} aria-label={`Delete ${g.title}`} title="Delete">
                  <TbTrash />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {data && <Pagination page={data.page} totalPages={data.totalPages} onPage={(page) => setFilters((f) => ({ ...f, page }))} />}
      {editing && (
        <EditModal
          image={editing}
          onClose={() => setEditing(null)}
          onSaved={(updated) => {
            replace(updated);
            setEditing(null);
            toast.success('Photo updated.');
          }}
        />
      )}
      {confirmDialog}
    </>
  );
}
