import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { TbArrowLeft, TbDeviceFloppy, TbExternalLink, TbStar, TbStarFilled, TbTrash } from 'react-icons/tb';
import Field from '../components/Field.jsx';
import { ErrorState, Spinner } from '../components/States.jsx';
import { useToast } from '../hooks/useToast.jsx';
import { adminApi, assetUrl, errorMessage, fieldErrors } from '../services/api.js';
import { PROJECT_CATEGORIES, PROJECT_STATUS } from '../services/labels.js';
import { MultiImagePicker, PageHeader, ProgressBar, Toggle, useConfirm } from './ui.jsx';
import { projectImageUpload } from './uploads.js';

const EMPTY = {
  name: '',
  category: 'RESIDENTIAL',
  shortDescription: '',
  description: '',
  location: '',
  mapsUrl: '',
  status: 'ONGOING',
  startDate: '',
  completionDate: '',
  features: '',
  featured: false,
  published: true,
};

function toForm(p) {
  return {
    name: p.name,
    category: p.category,
    shortDescription: p.shortDescription,
    description: p.description || '',
    location: p.location,
    mapsUrl: p.mapsUrl || '',
    status: p.status,
    startDate: p.startDate || '',
    completionDate: p.completionDate || '',
    features: (p.features || []).join('\n'),
    featured: p.featured,
    published: p.published,
  };
}

function validate(f) {
  const e = {};
  if (!f.name.trim()) e.name = 'Please enter the project name.';
  if (!f.shortDescription.trim()) e.shortDescription = 'Please add a short description.';
  else if (f.shortDescription.length > 300) e.shortDescription = 'Keep it under 300 characters.';
  if (!f.location.trim()) e.location = 'Please enter the location.';
  if (f.mapsUrl.trim() && !/^https:\/\/\S+$/.test(f.mapsUrl.trim())) e.mapsUrl = 'Paste the full Google Maps link, starting with https://';
  if (f.startDate && f.completionDate && f.completionDate < f.startDate) e.completionDate = 'The completion date cannot be before the start date.';
  return e;
}

/**
 * Add / edit a project. On save: the project is stored, then the selected photos are compressed and uploaded in
 * batches and attached to it. If published, it is on the website as soon as this finishes.
 */
export default function ProjectEditor() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();
  const toast = useToast();
  const [confirm, confirmDialog] = useConfirm();

  const [project, setProject] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [picked, setPicked] = useState([]);
  const [mainIndex, setMainIndex] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState(null);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (isNew) return;
    adminApi
      .get(`/admin/projects/${id}`)
      .then((r) => {
        setProject(r.data);
        setForm(toForm(r.data));
      })
      .catch(setLoadError);
  }, [id, isNew]);

  const set = (key) => (e) => {
    const value = e?.target ? (e.target.type === 'checkbox' ? e.target.checked : e.target.value) : e;
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }));
  };

  async function uploadPicked(projectId, existingCount) {
    if (!picked.length) return null;
    const result = await projectImageUpload(projectId, picked, (value, label) => setProgress({ value, label }));
    // The chosen main photo is the (existingCount + mainIndex)-th image after upload.
    if (mainIndex != null && result?.images?.[existingCount + mainIndex]) {
      const chosen = result.images[existingCount + mainIndex];
      if (!chosen.cover) return (await adminApi.put(`/admin/projects/${projectId}/images/${chosen.id}/cover`)).data;
    }
    return result;
  }

  async function save(e) {
    e.preventDefault();
    const found = validate(form);
    setErrors(found);
    setFormError('');
    if (Object.keys(found).length) {
      setFormError('Please correct the highlighted fields.');
      return;
    }
    setSaving(true);
    const body = {
      ...form,
      startDate: form.startDate || null,
      completionDate: form.completionDate || null,
      features: form.features.split('\n').map((s) => s.trim()).filter(Boolean),
    };
    let saved = null;
    try {
      saved = isNew ? (await adminApi.post('/admin/projects', body)).data : (await adminApi.put(`/admin/projects/${id}`, body)).data;
    } catch (err) {
      setErrors(fieldErrors(err));
      setFormError(errorMessage(err));
      setSaving(false);
      return;
    }
    try {
      const withImages = await uploadPicked(saved.id, saved.images.length);
      if (withImages) saved = withImages;
      picked.forEach((p) => URL.revokeObjectURL(p.preview));
      setPicked([]);
      setMainIndex(null);
      toast.success(
        saved.published
          ? `"${saved.name}" saved and live on the website${saved.featured ? ' and homepage' : ''}.`
          : `"${saved.name}" saved as a draft.`,
      );
      if (isNew) navigate(`/admin/projects/${saved.id}`, { replace: true });
      else {
        setProject(saved);
        setForm(toForm(saved));
      }
    } catch (err) {
      // The project itself is saved; only some photos failed. Stay on the editor so they can be retried.
      toast.error(`Project saved, but some photos could not be uploaded: ${errorMessage(err)}`);
      if (isNew) navigate(`/admin/projects/${saved.id}`, { replace: true });
      else adminApi.get(`/admin/projects/${saved.id}`).then((r) => setProject(r.data));
    } finally {
      setSaving(false);
      setProgress(null);
    }
  }

  async function imageAction(request, success) {
    try {
      const { data } = await request();
      setProject(data);
      if (success) toast.success(success);
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }

  function deleteImage(image) {
    confirm({
      title: 'Delete photo?',
      message: 'This photo will be removed from the project and the website.',
      onConfirm: async () => {
        const { data } = await adminApi.delete(`/admin/projects/${id}/images/${image.id}`);
        setProject(data);
        toast.success('Photo deleted.');
      },
    });
  }

  function moveImage(index, delta) {
    const images = [...project.images];
    const target = index + delta;
    if (target < 0 || target >= images.length) return;
    [images[index], images[target]] = [images[target], images[index]];
    setProject({ ...project, images });
    imageAction(() => adminApi.put(`/admin/projects/${id}/images/order`, { ids: images.map((i) => i.id) }));
  }

  if (loadError) return <ErrorState error={loadError} />;
  if (!isNew && !project) return <Spinner />;

  return (
    <>
      <PageHeader title={isNew ? 'Add New Project' : `Edit: ${project.name}`} subtitle={isNew ? 'Fill in the details, add photos and save.' : null}>
        <Link to="/admin/projects" className="btn btn-ghost">
          <TbArrowLeft aria-hidden="true" /> All projects
        </Link>
        {!isNew && project.published && (
          <a href={`/projects/${project.slug}`} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
            View on website <TbExternalLink aria-hidden="true" />
          </a>
        )}
      </PageHeader>

      <form onSubmit={save} noValidate className="editor-grid">
        <div className="editor-main">
          <section className="panel panel-pad">
            <h2 className="panel-title">Project Details</h2>
            <div className="form-grid">
              <Field label="Project Name" required value={form.name} onChange={set('name')} error={errors.name} maxLength={150} className="span-2" placeholder="e.g. Jayashri Villa Homes" />
              <Field label="Project Category" as="select" required value={form.category} onChange={set('category')} error={errors.category}>
                {Object.entries(PROJECT_CATEGORIES).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </Field>
              <Field label="Project Status" as="select" required value={form.status} onChange={set('status')} error={errors.status}>
                {Object.entries(PROJECT_STATUS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </Field>
              <Field
                label="Short Description"
                required
                as="textarea"
                rows={2}
                value={form.shortDescription}
                onChange={set('shortDescription')}
                error={errors.shortDescription}
                maxLength={300}
                hint={`Shown on project cards. ${300 - form.shortDescription.length} characters left.`}
                className="span-2"
              />
              <Field
                label="Project Description"
                as="textarea"
                rows={7}
                value={form.description}
                onChange={set('description')}
                error={errors.description}
                maxLength={20000}
                hint="Shown on the project's details page. Line breaks are kept."
                className="span-2"
              />
              <Field label="Location Name" required value={form.location} onChange={set('location')} error={errors.location} maxLength={150} placeholder="e.g. Shahupuri, Satara" />
              <Field
                label="Google Maps Link"
                value={form.mapsUrl}
                onChange={set('mapsUrl')}
                error={errors.mapsUrl}
                maxLength={1000}
                placeholder="https://maps.app.goo.gl/…"
                hint="In Google Maps: Share → Copy link."
              />
              <Field label="Project Start Date" type="date" value={form.startDate} onChange={set('startDate')} error={errors.startDate} />
              <Field label="Completion Date (optional)" type="date" value={form.completionDate} onChange={set('completionDate')} error={errors.completionDate} />
              <Field
                label="Project Features"
                as="textarea"
                rows={5}
                value={form.features}
                onChange={set('features')}
                hint="One feature per line, e.g. 3 BHK bungalows"
                className="span-2"
              />
            </div>
          </section>

          {!isNew && (
            <section className="panel panel-pad">
              <h2 className="panel-title">
                Project Photos <span className="muted">({project.images.length})</span>
              </h2>
              {project.images.length === 0 ? (
                <p className="muted">No photos yet. Add some below.</p>
              ) : (
                <ul className="image-manager">
                  {project.images.map((img, i) => (
                    <li key={img.id} className={img.cover ? 'is-cover' : ''}>
                      <img src={assetUrl(img.thumbUrl || img.url)} alt="" loading="lazy" />
                      {img.cover && <span className="cover-label">Main image</span>}
                      <div className="image-manager-actions">
                        <button
                          type="button"
                          className="icon-btn"
                          disabled={img.cover}
                          onClick={() => imageAction(() => adminApi.put(`/admin/projects/${id}/images/${img.id}/cover`), 'Main image updated.')}
                          aria-label={img.cover ? 'Main image' : 'Set as main image'}
                          title="Set as main image"
                        >
                          {img.cover ? <TbStarFilled /> : <TbStar />}
                        </button>
                        <button type="button" className="icon-btn" disabled={i === 0} onClick={() => moveImage(i, -1)} aria-label="Move earlier" title="Move earlier">
                          ←
                        </button>
                        <button type="button" className="icon-btn" disabled={i === project.images.length - 1} onClick={() => moveImage(i, 1)} aria-label="Move later" title="Move later">
                          →
                        </button>
                        <button type="button" className="icon-btn icon-btn-danger" onClick={() => deleteImage(img)} aria-label="Delete photo" title="Delete photo">
                          <TbTrash />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          <section className="panel panel-pad">
            <h2 className="panel-title">{isNew ? 'Project Photos' : 'Add More Photos'}</h2>
            <MultiImagePicker files={picked} onChange={setPicked} mainIndex={mainIndex} onMainChange={setMainIndex} disabled={saving} />
            {isNew && picked.length > 0 && mainIndex == null && <p className="field-hint">The first photo becomes the main image unless you choose another.</p>}
          </section>
        </div>

        <aside className="editor-side">
          <section className="panel panel-pad sticky-panel">
            <h2 className="panel-title">Publishing</h2>
            <Toggle checked={form.published} onChange={set('published')} label="Published (visible on website)" />
            <Toggle checked={form.featured} onChange={set('featured')} label="Featured on homepage" />
            <p className="field-hint">Drafts are saved but not shown to visitors.</p>
            {progress && <ProgressBar value={progress.value} label={progress.label} />}
            {formError && (
              <p className="form-error" role="alert">
                {formError}
              </p>
            )}
            <button type="submit" className="btn btn-primary btn-block" disabled={saving}>
              <TbDeviceFloppy aria-hidden="true" /> {saving ? 'Saving…' : isNew ? 'Save Project' : 'Save Changes'}
            </button>
            {picked.length > 0 && (
              <p className="field-hint">
                {picked.length} new photo{picked.length === 1 ? '' : 's'} will be uploaded when you save.
              </p>
            )}
          </section>
        </aside>
      </form>
      {confirmDialog}
    </>
  );
}
