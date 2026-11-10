import { useState } from 'react';
import Field from '../components/Field.jsx';
import { useAuth } from '../hooks/useAuth.jsx';
import { useToast } from '../hooks/useToast.jsx';
import { adminApi, errorMessage, fieldErrors } from '../services/api.js';
import { PageHeader } from './ui.jsx';

export default function PasswordAdmin() {
  const { replaceToken } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    const found = {};
    if (!form.currentPassword) found.currentPassword = 'Please enter your current password.';
    if (form.newPassword.length < 10) found.newPassword = 'Use at least 10 characters.';
    if (form.newPassword !== form.confirm) found.confirm = 'The passwords do not match.';
    setErrors(found);
    setError('');
    if (Object.keys(found).length) return;
    setBusy(true);
    try {
      const { data } = await adminApi.put('/admin/account/password', { currentPassword: form.currentPassword, newPassword: form.newPassword });
      replaceToken(data);
      setForm({ currentPassword: '', newPassword: '', confirm: '' });
      toast.success('Password changed. Other devices have been signed out.');
    } catch (err) {
      setErrors(fieldErrors(err));
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader title="Change Password" subtitle="Changing your password signs out every other device." />
      <form onSubmit={submit} noValidate className="panel panel-pad narrow-panel">
        <Field label="Current password" type="password" value={form.currentPassword} onChange={set('currentPassword')} error={errors.currentPassword} autoComplete="current-password" required />
        <Field
          label="New password"
          type="password"
          value={form.newPassword}
          onChange={set('newPassword')}
          error={errors.newPassword}
          autoComplete="new-password"
          hint="At least 10 characters. A short phrase is easier to remember and harder to guess."
          required
        />
        <Field label="Confirm new password" type="password" value={form.confirm} onChange={set('confirm')} error={errors.confirm} autoComplete="new-password" required />
        {error && <p className="form-error">{error}</p>}
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? 'Saving…' : 'Change Password'}
        </button>
      </form>
    </>
  );
}
