import { useId } from 'react';

/** Label + control + error message, wired for screen readers. Pass `as="select"` or `as="textarea"`. */
export default function Field({ label, error, hint, as: Control = 'input', required, className = '', children, icon: Icon, ...props }) {
  const id = useId();
  const describedBy = [error && `${id}-error`, hint && `${id}-hint`].filter(Boolean).join(' ') || undefined;
  return (
    <div className={`field ${error ? 'has-error' : ''} ${className}`}>
      <label htmlFor={id}>
        {label}
        {required && <span className="required" aria-hidden="true"> *</span>}
      </label>
      <div className={`control ${Icon ? 'has-icon' : ''}`}>
        {Icon && <Icon className="control-icon" aria-hidden="true" />}
        <Control id={id} aria-invalid={Boolean(error)} aria-describedby={describedBy} required={required} {...props}>
          {children}
        </Control>
      </div>
      {hint && !error && (
        <small id={`${id}-hint`} className="field-hint">
          {hint}
        </small>
      )}
      {error && (
        <small id={`${id}-error`} className="field-error">
          {error}
        </small>
      )}
    </div>
  );
}
