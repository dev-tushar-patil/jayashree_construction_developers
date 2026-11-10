import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { TbArrowLeft, TbEye, TbEyeOff, TbLock, TbUser } from 'react-icons/tb';
import Field from '../components/Field.jsx';
import { useAuth } from '../hooks/useAuth.jsx';
import { errorMessage } from '../services/api.js';

export default function AdminLogin() {
  const { admin, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ login: '', password: '' });
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (admin) return <Navigate to={location.state?.from || '/admin'} replace />;

  async function submit(e) {
    e.preventDefault();
    if (!form.login.trim() || !form.password) {
      setError('Please enter your username or email and your password.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await login(form.login.trim(), form.password);
      navigate(location.state?.from || '/admin', { replace: true });
    } catch (err) {
      setError(errorMessage(err, 'Sign in failed. Please try again.'));
      setBusy(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <img src="/images/brand/logo.jpeg" alt="Jayashri Construction & Developers" className="login-logo" width="640" height="640" />
        <h1>Admin Login</h1>
        <p className="login-sub">Sign in to manage the website.</p>
        <form onSubmit={submit} noValidate>
          <Field
            label="Username or email"
            icon={TbUser}
            value={form.login}
            onChange={(e) => setForm((f) => ({ ...f, login: e.target.value }))}
            autoComplete="username"
            autoFocus
            required
          />
          <div className="password-field">
            <Field
              label="Password"
              icon={TbLock}
              type={show ? 'text' : 'password'}
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              autoComplete="current-password"
              required
            />
            <button type="button" className="icon-btn password-toggle" onClick={() => setShow((v) => !v)} aria-label={show ? 'Hide password' : 'Show password'}>
              {show ? <TbEyeOff /> : <TbEye />}
            </button>
          </div>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
        <Link to="/" className="back-link back-link-dark login-back">
          <TbArrowLeft aria-hidden="true" /> Back to website
        </Link>
      </div>
    </div>
  );
}
