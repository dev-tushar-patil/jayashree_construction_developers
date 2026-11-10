import { useState } from 'react';
import { TbArrowDown, TbArrowUp, TbEdit, TbPlus, TbTrash } from 'react-icons/tb';
import Field from '../components/Field.jsx';
import { SERVICE_ICONS, serviceIcon } from '../components/icons.js';
import { EmptyState, ErrorState, Spinner } from '../components/States.jsx';
import { useFetch } from '../hooks/useFetch.js';
import { useToast } from '../hooks/useToast.jsx';
import { adminApi, assetUrl, errorMessage, fieldErrors } from '../services/api.js';
import { Badge, ImageUploadField, Modal, PageHeader, Toggle, useConfirm } from './ui.jsx';

const EMPTY = { title: '', shortDescription: '', description: '', icon: 'home', imageUrl: '', features: '', published: true };

function ServiceModal({ service, onClose, onSaved }) {
  const [form, setForm] = useState(
    service ? { ...service, description: service.description || '', imageUrl: service.imageUrl || '', features: (service.features || []).join('\n') } : EMPTY,
  );
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e?.target ? e.target.value : e }));

  async function save() {
    const found = {};
    if (!form.title.trim()) found.title = 'Please enter the service title.';
    if (!form.shortDescription.trim()) found.shortDescription = 'Please add a short description.';
    setErrors(found);
    if (Object.keys(found).length) return;
    setBusy(true);
    const body = {
      title: form.title,
      shortDescription: form.shortDescription,
      description: form.description,
      icon: form.icon,
      imageUrl: form.imageUrl,
      published: form.published,
      features: form.features.split('\n').map((s) => s.trim()).filter(Boolean),
    };
    try {
      const { data } = service ? await adminApi.put(`/admin/services/${service.id}`, body) : await adminApi.post('/admin/services', body);
      onSaved(data, !service);
    } catch (err) {
      setErrors(fieldErrors(err));
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <Modal
      title={service ? `Edit: ${service.title}` : 'Add Service'}
      onClose={onClose}
      size="lg"
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={save} disabled={busy}>
            {busy ? 'Saving…' : 'Save Service'}
          </button>
        </>
      }
    >
      <div className="form-grid">
        <Field label="Service Title" required value={form.title} onChange={set('title')} error={errors.title} maxLength={120} />
        <Field label="Icon" as="select" value={form.icon} onChange={set('icon')}>
          {Object.entries(SERVICE_ICONS).map(([k, v]) => (
            <option key={k} value={k}>
              {v.label}
            </option>
          ))}
        </Field>
        <Field label="Short Description" required as="textarea" rows={2} value={form.shortDescription} onChange={set('shortDescription')} error={errors.shortDescription} maxLength={300} className="span-2" />
        <Field label="Full Description" as="textarea" rows={5} value={form.description} onChange={set('description')} maxLength={20000} className="span-2" hint="Shown on the service's details page." />
        <Field label="Features" as="textarea" rows={4} value={form.features} onChange={set('features')} className="span-2" hint="One per line." />
        <div className="span-2">
          <ImageUploadField label="Service Image" value={form.imageUrl} onChange={set('imageUrl')} />
        </div>
        <div className="span-2">
          <Toggle checked={form.published} onChange={set('published')} label="Visible on website" />
        </div>
      </div>
      {error && <p className="form-error">{error}</p>}
    </Modal>
  );
}

export default function ServicesAdmin() {
  const toast = useToast();
  const [confirm, confirmDialog] = useConfirm();
  const { data, loading, error, reload, setData } = useFetch(() => adminApi.get('/admin/services').then((r) => r.data), []);
  const [editing, setEditing] = useState(null); // null = closed, {} = new, service = edit

  async function move(index, delta) {
    const list = [...data];
    const target = index + delta;
    if (target < 0 || target >= list.length) return;
    [list[index], list[target]] = [list[target], list[index]];
    setData(list);
    try {
      setData((await adminApi.put('/admin/services/order', { ids: list.map((s) => s.id) })).data);
    } catch (err) {
      toast.error(errorMessage(err));
      reload();
    }
  }

  function remove(service) {
    confirm({
      title: 'Delete service?',
      message: `"${service.title}" will be removed from the website.`,
      onConfirm: async () => {
        await adminApi.delete(`/admin/services/${service.id}`);
        toast.success('Service deleted.');
        reload();
      },
    });
  }

  return (
    <>
      <PageHeader title="Manage Services" subtitle="Use the arrows to change the order shown on the website.">
        <button type="button" className="btn btn-primary" onClick={() => setEditing({})}>
          <TbPlus aria-hidden="true" /> Add Service
        </button>
      </PageHeader>
      {loading && !data && <Spinner />}
      {error && <ErrorState error={error} onRetry={reload} />}
      {data && data.length === 0 && <EmptyState title="No services yet" />}
      {data && data.length > 0 && (
        <ul className="sortable-list">
          {data.map((s, i) => {
            const Icon = serviceIcon(s.icon);
            return (
              <li key={s.id}>
                <div className="sort-buttons">
                  <button type="button" className="icon-btn" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move ${s.title} up`}>
                    <TbArrowUp />
                  </button>
                  <button type="button" className="icon-btn" onClick={() => move(i, 1)} disabled={i === data.length - 1} aria-label={`Move ${s.title} down`}>
                    <TbArrowDown />
                  </button>
                </div>
                {s.imageUrl ? <img src={assetUrl(s.imageUrl)} alt="" className="sortable-thumb" /> : <span className="sortable-thumb" />}
                <div className="sortable-body">
                  <strong>
                    <Icon aria-hidden="true" /> {s.title} {!s.published && <Badge>Hidden</Badge>}
                  </strong>
                  <span className="clamp-1">{s.shortDescription}</span>
                </div>
                <div className="cell-actions">
                  <button type="button" className="icon-btn" onClick={() => setEditing(s)} aria-label={`Edit ${s.title}`}>
                    <TbEdit />
                  </button>
                  <button type="button" className="icon-btn icon-btn-danger" onClick={() => remove(s)} aria-label={`Delete ${s.title}`}>
                    <TbTrash />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {editing && (
        <ServiceModal
          service={editing.id ? editing : null}
          onClose={() => setEditing(null)}
          onSaved={(_, created) => {
            setEditing(null);
            toast.success(created ? 'Service added.' : 'Service updated.');
            reload();
          }}
        />
      )}
      {confirmDialog}
    </>
  );
}
