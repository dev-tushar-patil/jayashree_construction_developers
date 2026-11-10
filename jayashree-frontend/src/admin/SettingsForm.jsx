import { useEffect, useMemo, useState } from 'react';
import { TbArrowDown, TbArrowUp, TbDeviceFloppy, TbPlus, TbTrash } from 'react-icons/tb';
import Field from '../components/Field.jsx';
import { ErrorState, Spinner } from '../components/States.jsx';
import { useContent } from '../hooks/useContent.jsx';
import { useToast } from '../hooks/useToast.jsx';
import { adminApi, errorMessage, fieldErrors } from '../services/api.js';
import { ImageUploadField } from './ui.jsx';

/** Edits a JSON list of {title, text} as rows. */
function ListEditor({ label, value, onChange, error, hint }) {
  const items = useMemo(() => {
    try {
      const parsed = JSON.parse(value || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [value]);
  const write = (next) => onChange(JSON.stringify(next));
  const update = (i, key, v) => write(items.map((item, j) => (j === i ? { ...item, [key]: v } : item)));
  const move = (i, d) => {
    const next = [...items];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    write(next);
  };

  return (
    <div className="field span-2">
      <span className="field-label">{label}</span>
      {hint && <small className="field-hint">{hint}</small>}
      <ol className="list-editor">
        {items.map((item, i) => (
          <li key={i}>
            <input value={item.title || ''} onChange={(e) => update(i, 'title', e.target.value)} placeholder="Title" maxLength={80} aria-label={`Item ${i + 1} title`} />
            <input value={item.text || ''} onChange={(e) => update(i, 'text', e.target.value)} placeholder="Short description" maxLength={200} aria-label={`Item ${i + 1} description`} />
            <div className="cell-actions">
              <button type="button" className="icon-btn" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move up">
                <TbArrowUp />
              </button>
              <button type="button" className="icon-btn" disabled={i === items.length - 1} onClick={() => move(i, 1)} aria-label="Move down">
                <TbArrowDown />
              </button>
              <button type="button" className="icon-btn icon-btn-danger" onClick={() => write(items.filter((_, j) => j !== i))} aria-label="Remove item">
                <TbTrash />
              </button>
            </div>
          </li>
        ))}
      </ol>
      {items.length < 12 && (
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => write([...items, { title: '', text: '' }])}>
          <TbPlus aria-hidden="true" /> Add item
        </button>
      )}
      {error && <small className="field-error">{error}</small>}
    </div>
  );
}

/**
 * Generic editor for site content keys. `groups` = [{ title, fields: [{ key, label, type, hint, rows }] }].
 * Only changed keys are sent; the public website picks the changes up immediately.
 */
export default function SettingsForm({ groups, after }) {
  const toast = useToast();
  const { refresh } = useContent();
  const [initial, setInitial] = useState(null);
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [loadError, setLoadError] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    adminApi
      .get('/admin/content')
      .then((r) => {
        setInitial(r.data);
        setValues(r.data);
      })
      .catch(setLoadError);
  }, []);

  const keys = groups.flatMap((g) => g.fields.map((f) => f.key));
  const changed = initial ? keys.filter((k) => (values[k] ?? '') !== (initial[k] ?? '')) : [];

  useEffect(() => {
    const warn = (e) => {
      if (changed.length) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [changed.length]);

  const set = (key) => (e) => {
    const v = e?.target ? e.target.value : e;
    setValues((s) => ({ ...s, [key]: v }));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }));
  };

  async function save(e) {
    e.preventDefault();
    if (!changed.length) return;
    setBusy(true);
    try {
      const body = Object.fromEntries(changed.map((k) => [k, values[k] ?? '']));
      const { data } = await adminApi.put('/admin/content', body);
      setInitial(data);
      setValues(data);
      setErrors({});
      refresh();
      toast.success('Saved. The website has been updated.');
    } catch (err) {
      setErrors(fieldErrors(err));
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  if (loadError) return <ErrorState error={loadError} />;
  if (!initial) return <Spinner />;

  return (
    <form onSubmit={save} noValidate className="settings-form">
      {groups.map((group) => (
        <section key={group.title} className="panel panel-pad">
          <h2 className="panel-title">{group.title}</h2>
          {group.description && <p className="panel-description">{group.description}</p>}
          <div className="form-grid">
            {group.fields.map((f) => {
              const common = { label: f.label, hint: f.hint, error: errors[f.key], value: values[f.key] ?? '', onChange: set(f.key) };
              if (f.type === 'image') {
                return (
                  <div key={f.key} className="span-2">
                    <ImageUploadField {...common} />
                  </div>
                );
              }
              if (f.type === 'list') return <ListEditor key={f.key} {...common} />;
              if (f.type === 'textarea') return <Field key={f.key} {...common} as="textarea" rows={f.rows || 4} className="span-2" maxLength={10000} />;
              return (
                <Field
                  key={f.key}
                  {...common}
                  type={f.type === 'email' ? 'email' : f.type === 'url' ? 'url' : f.type === 'phone' ? 'tel' : 'text'}
                  placeholder={f.placeholder}
                  className={f.wide ? 'span-2' : ''}
                  maxLength={1000}
                />
              );
            })}
          </div>
        </section>
      ))}
      {after}
      <div className="save-bar">
        <span>{changed.length ? `${changed.length} unsaved change${changed.length === 1 ? '' : 's'}` : 'All changes saved'}</span>
        <button type="submit" className="btn btn-primary" disabled={busy || !changed.length}>
          <TbDeviceFloppy aria-hidden="true" /> {busy ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}
