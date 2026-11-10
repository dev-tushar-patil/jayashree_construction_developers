import { useState } from 'react';
import { TbCircleCheck, TbMail, TbMapPin, TbMessage2, TbPhone, TbSend, TbUser } from 'react-icons/tb';
import { errorMessage, fieldErrors, publicApi } from '../services/api.js';
import { INTERESTED_IN } from '../services/labels.js';
import Field from './Field.jsx';
import WhatsAppButton from './WhatsAppButton.jsx';

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const MOBILE = /^[+0-9 ()-]{10,20}$/;

export function validateContact(form, { emailRequired = false } = {}) {
  const errors = {};
  if (!form.fullName.trim()) errors.fullName = 'Please enter your full name.';
  if (!form.mobile.trim()) errors.mobile = 'Please enter your mobile number.';
  else if (!MOBILE.test(form.mobile.trim()) || form.mobile.replace(/\D/g, '').length < 10) errors.mobile = 'Please enter a valid mobile number.';
  if (emailRequired && !form.email.trim()) errors.email = 'Please enter your email address.';
  else if (form.email.trim() && !EMAIL.test(form.email.trim())) errors.email = 'Please enter a valid email address.';
  return errors;
}

/**
 * Contact form (type CONTACT) or a project's enquiry form (type PROJECT, with projectId).
 * Every submission is stored in the database and appears in Admin > Enquiries.
 */
export default function EnquiryForm({ type = 'CONTACT', projectId, projectName, compact, whatsappMessage }) {
  const empty = { fullName: '', email: '', mobile: '', interestedIn: '', projectLocation: '', message: '', website: '' };
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ busy: false, error: '', done: false });

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }));
  };

  async function submit(e) {
    e.preventDefault();
    const found = validateContact(form, { emailRequired: type === 'CONTACT' });
    if (type === 'CONTACT' && !form.interestedIn) found.interestedIn = 'Please choose what you are interested in.';
    if (Object.keys(found).length) {
      setErrors(found);
      return;
    }
    setStatus({ busy: true, error: '', done: false });
    try {
      await publicApi.enquire({ ...form, type, projectId: projectId || null, interestedIn: form.interestedIn || projectName || null });
      setStatus({ busy: false, error: '', done: true });
      setForm(empty);
    } catch (err) {
      setErrors(fieldErrors(err));
      setStatus({ busy: false, error: errorMessage(err), done: false });
    }
  }

  if (status.done) {
    return (
      <div className="form-success-panel" role="status">
        <TbCircleCheck aria-hidden="true" />
        <h3>Thank you! Your enquiry has been sent.</h3>
        <p>Our team will call you back shortly. For a faster reply, message us on WhatsApp.</p>
        <div className="form-success-actions">
          <WhatsAppButton message={whatsappMessage} />
          <button type="button" className="btn btn-ghost" onClick={() => setStatus({ busy: false, error: '', done: false })}>
            Send another enquiry
          </button>
        </div>
      </div>
    );
  }

  return (
    <form className={`enquiry-form ${compact ? 'is-compact' : ''}`} onSubmit={submit} noValidate>
      {/* Honeypot: hidden from people, often filled in by spam bots. */}
      <div className="hp-field" aria-hidden="true">
        <label>
          Website <input tabIndex={-1} autoComplete="off" value={form.website} onChange={set('website')} />
        </label>
      </div>
      <div className="form-grid">
        <Field label="Full Name" required icon={TbUser} value={form.fullName} onChange={set('fullName')} error={errors.fullName} autoComplete="name" maxLength={120} />
        <Field label="Mobile Number" required icon={TbPhone} type="tel" inputMode="tel" value={form.mobile} onChange={set('mobile')} error={errors.mobile} autoComplete="tel" maxLength={20} />
        <Field
          label="Email Address"
          required={type === 'CONTACT'}
          icon={TbMail}
          type="email"
          value={form.email}
          onChange={set('email')}
          error={errors.email}
          autoComplete="email"
          maxLength={160}
          className={compact ? 'span-2' : ''}
        />
        {type === 'CONTACT' && (
          <Field label="Interested In" required as="select" value={form.interestedIn} onChange={set('interestedIn')} error={errors.interestedIn}>
            <option value="">Select a service</option>
            {INTERESTED_IN.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </Field>
        )}
        {type === 'CONTACT' && (
          <Field
            label="Project Location"
            icon={TbMapPin}
            value={form.projectLocation}
            onChange={set('projectLocation')}
            error={errors.projectLocation}
            placeholder="e.g. Satara, Karad, Wai"
            maxLength={150}
            className="span-2"
          />
        )}
        <Field
          label="Message"
          as="textarea"
          icon={TbMessage2}
          rows={compact ? 3 : 5}
          value={form.message}
          onChange={set('message')}
          error={errors.message}
          maxLength={3000}
          placeholder={projectName ? `I would like to know more about ${projectName}…` : 'Tell us about your plot, plans and timeline…'}
          className="span-2"
        />
      </div>
      {status.error && (
        <p className="form-error" role="alert">
          {status.error}
        </p>
      )}
      <button type="submit" className="btn btn-primary btn-block" disabled={status.busy}>
        {status.busy ? <span className="spinner spinner-inline" aria-hidden="true" /> : <TbSend aria-hidden="true" />}
        {status.busy ? 'Sending…' : 'Send Enquiry'}
      </button>
    </form>
  );
}
