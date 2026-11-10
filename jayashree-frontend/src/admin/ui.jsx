import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { TbAlertTriangle, TbPhotoPlus, TbStar, TbStarFilled, TbTrash, TbUpload, TbX } from 'react-icons/tb';
import { adminApi, assetUrl, errorMessage } from '../services/api.js';
import { ACCEPT_ATTR, compressImage, validateImageFile } from '../services/imageCompression.js';

export function PageHeader({ title, subtitle, children }) {
  return (
    <header className="admin-page-header">
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {children && <div className="admin-page-actions">{children}</div>}
    </header>
  );
}

export function Badge({ tone = 'neutral', children }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

export function Toggle({ checked, onChange, label, disabled }) {
  return (
    <label className={`toggle ${disabled ? 'is-disabled' : ''}`}>
      <input type="checkbox" checked={Boolean(checked)} onChange={(e) => onChange(e.target.checked)} disabled={disabled} />
      <span className="toggle-track" aria-hidden="true">
        <span className="toggle-thumb" />
      </span>
      {label && <span className="toggle-label">{label}</span>}
    </label>
  );
}

export function Modal({ title, onClose, children, size = 'md', footer }) {
  const dialog = useRef(null);
  useEffect(() => {
    const previous = document.activeElement;
    dialog.current?.focus();
    document.body.style.overflow = 'hidden';
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      previous?.focus?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return createPortal(
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={dialog} className={`modal modal-${size}`} role="dialog" aria-modal="true" aria-label={title} tabIndex={-1}>
        <header className="modal-header">
          <h2>{title}</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            <TbX />
          </button>
        </header>
        <div className="modal-body">{children}</div>
        {footer && <footer className="modal-footer">{footer}</footer>}
      </div>
    </div>,
    document.body,
  );
}

/** Asks before a destructive action; shows the server's reason if it fails. */
export function ConfirmDialog({ title = 'Are you sure?', message, confirmLabel = 'Delete', onConfirm, onClose }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function run() {
    setBusy(true);
    setError('');
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }
  return (
    <Modal
      title={title}
      onClose={onClose}
      size="sm"
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button type="button" className="btn btn-danger" onClick={run} disabled={busy}>
            <TbTrash aria-hidden="true" /> {busy ? 'Working…' : confirmLabel}
          </button>
        </>
      }
    >
      <div className="confirm-body">
        <TbAlertTriangle className="confirm-icon" aria-hidden="true" />
        <p>{message}</p>
      </div>
      {error && <p className="form-error">{error}</p>}
    </Modal>
  );
}

/** One confirm dialog per page: confirm({ message, onConfirm }) */
export function useConfirm() {
  const [pending, setPending] = useState(null);
  const dialog = pending ? <ConfirmDialog {...pending} onClose={() => setPending(null)} /> : null;
  return [setPending, dialog];
}

export function Pagination({ page, totalPages, onPage }) {
  if (!totalPages || totalPages <= 1) return null;
  return (
    <nav className="admin-pagination" aria-label="Pages">
      <button type="button" className="btn btn-ghost btn-sm" disabled={page === 0} onClick={() => onPage(page - 1)}>
        Previous
      </button>
      <span>
        Page {page + 1} of {totalPages}
      </span>
      <button type="button" className="btn btn-ghost btn-sm" disabled={page + 1 >= totalPages} onClick={() => onPage(page + 1)}>
        Next
      </button>
    </nav>
  );
}

export function StarRatingInput({ value, onChange }) {
  return (
    <div className="admin-stars" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" role="radio" aria-checked={value === n} aria-label={`${n} star${n > 1 ? 's' : ''}`} onClick={() => onChange(n)}>
          {n <= value ? <TbStarFilled /> : <TbStar />}
        </button>
      ))}
    </div>
  );
}

/** Uploads one image straight away (compressed first) and hands back its URL. */
export function ImageUploadField({ label, value, onChange, hint }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function upload(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const invalid = validateImageFile(file);
    if (invalid) {
      setError(invalid);
      return;
    }
    setBusy(true);
    setError('');
    try {
      const form = new FormData();
      form.append('file', await compressImage(file));
      const { data } = await adminApi.post('/admin/uploads', form);
      onChange(data.url);
    } catch (err) {
      setError(errorMessage(err, 'The upload failed.'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="field">
      <span className="field-label">{label}</span>
      <div className="image-upload">
        {value ? <img src={assetUrl(value)} alt="" /> : <span className="image-upload-empty">No image</span>}
        <div className="image-upload-actions">
          <label className={`btn btn-ghost btn-sm ${busy ? 'is-busy' : ''}`}>
            <TbUpload aria-hidden="true" /> {busy ? 'Uploading…' : value ? 'Replace' : 'Upload'}
            <input type="file" accept={ACCEPT_ATTR} onChange={upload} disabled={busy} className="sr-only" />
          </label>
          {value && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => onChange('')}>
              Remove
            </button>
          )}
        </div>
      </div>
      {hint && !error && <small className="field-hint">{hint}</small>}
      {error && <small className="field-error">{error}</small>}
    </div>
  );
}

/**
 * Lets the admin pick many photos, preview them, remove any before saving, give each a title (optional)
 * and mark one as the main image (optional). Nothing is uploaded here; the parent uploads on save.
 */
export function MultiImagePicker({ files, onChange, withTitles, mainIndex, onMainChange, disabled }) {
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);

  useEffect(() => () => files.forEach((f) => URL.revokeObjectURL(f.preview)), []); // eslint-disable-line react-hooks/exhaustive-deps

  function add(list) {
    const accepted = [];
    const problems = [];
    Array.from(list).forEach((file) => {
      const invalid = validateImageFile(file);
      if (invalid) problems.push(invalid);
      else accepted.push({ id: `${file.name}-${file.size}-${Math.random()}`, file, preview: URL.createObjectURL(file), title: '' });
    });
    setError(problems.join(' '));
    if (accepted.length) onChange([...files, ...accepted]);
  }

  function remove(id) {
    const index = files.findIndex((f) => f.id === id);
    const target = files[index];
    if (target) URL.revokeObjectURL(target.preview);
    onChange(files.filter((f) => f.id !== id));
    if (onMainChange && mainIndex != null) {
      if (index === mainIndex) onMainChange(null);
      else if (index < mainIndex) onMainChange(mainIndex - 1);
    }
  }

  return (
    <div className="multi-picker">
      <label
        className={`dropzone ${dragging ? 'is-dragging' : ''} ${disabled ? 'is-disabled' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (!disabled) add(e.dataTransfer.files);
        }}
      >
        <TbPhotoPlus aria-hidden="true" />
        <strong>Choose photos or drag them here</strong>
        <span>JPG, PNG or WebP · select as many as you like · large photos are compressed automatically</span>
        <input
          type="file"
          accept={ACCEPT_ATTR}
          multiple
          disabled={disabled}
          className="sr-only"
          onChange={(e) => {
            add(e.target.files);
            e.target.value = '';
          }}
        />
      </label>
      {error && <p className="field-error">{error}</p>}
      {files.length > 0 && (
        <>
          <p className="multi-picker-count">
            {files.length} photo{files.length === 1 ? '' : 's'} selected
            {onMainChange && ' · click the star to choose the main image'}
          </p>
          <ul className="preview-grid">
            {files.map((f, i) => (
              <li key={f.id} className={mainIndex === i ? 'is-main' : ''}>
                <img src={f.preview} alt="" />
                {onMainChange && (
                  <button
                    type="button"
                    className="preview-star"
                    onClick={() => onMainChange(i)}
                    aria-label={mainIndex === i ? 'Main image' : 'Set as main image'}
                    aria-pressed={mainIndex === i}
                    disabled={disabled}
                  >
                    {mainIndex === i ? <TbStarFilled /> : <TbStar />}
                  </button>
                )}
                <button type="button" className="preview-remove" onClick={() => remove(f.id)} aria-label={`Remove ${f.file.name}`} disabled={disabled}>
                  <TbX />
                </button>
                {withTitles ? (
                  <input
                    className="preview-title"
                    value={f.title}
                    placeholder="Title (optional)"
                    maxLength={150}
                    disabled={disabled}
                    onChange={(e) => onChange(files.map((x) => (x.id === f.id ? { ...x, title: e.target.value } : x)))}
                    aria-label={`Title for ${f.file.name}`}
                  />
                ) : (
                  <span className="preview-name">{f.file.name}</span>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export function ProgressBar({ value, label }) {
  return (
    <div className="progress" role="progressbar" aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      <span style={{ width: `${value}%` }} />
      <em>{label}</em>
    </div>
  );
}
