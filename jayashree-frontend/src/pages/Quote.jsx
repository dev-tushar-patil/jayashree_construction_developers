import { useState } from 'react';
import { TbCircleCheck, TbMail, TbMapPin, TbPhone, TbRuler2, TbSend, TbUser } from 'react-icons/tb';
import { validateContact } from '../components/EnquiryForm.jsx';
import Field from '../components/Field.jsx';
import PageHero from '../components/PageHero.jsx';
import SectionHeading from '../components/SectionHeading.jsx';
import WhatsAppButton from '../components/WhatsAppButton.jsx';
import { useContent } from '../hooks/useContent.jsx';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { IS_PREVIEW, errorMessage, fieldErrors, publicApi } from '../services/api.js';
import { BUDGETS, CONSTRUCTION_TYPES } from '../services/labels.js';

const EMPTY = {
  fullName: '',
  mobile: '',
  email: '',
  constructionType: '',
  plotArea: '',
  projectLocation: '',
  budget: '',
  message: '',
  website: '',
};

/** WhatsApp follow-up carrying the details just submitted, so the team sees them in the chat too. */
function quoteMessage(company, q) {
  return [
    `Hello ${company}, I have just requested a quotation on your website.`,
    `Name: ${q.fullName}`,
    `Construction type: ${q.constructionType}`,
    q.plotArea && `Plot area: ${q.plotArea}`,
    q.projectLocation && `Location: ${q.projectLocation}`,
    q.budget && `Budget: ${q.budget}`,
    'Please share more details.',
  ]
    .filter(Boolean)
    .join('\n');
}

export default function Quote() {
  const { get } = useContent();
  usePageMeta('Get a Quote', 'Request a free construction quotation from Jayashri Construction & Developers, Satara.');
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ busy: false, error: '', sent: null });
  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }));
  };

  async function submit(e) {
    e.preventDefault();
    const found = validateContact(form);
    if (!form.constructionType) found.constructionType = 'Please choose the construction type.';
    if (Object.keys(found).length) {
      setErrors(found);
      return;
    }
    setStatus({ busy: true, error: '', sent: null });
    try {
      await publicApi.enquire({ ...form, type: 'QUOTE', interestedIn: form.constructionType });
      setStatus({ busy: false, error: '', sent: form });
      setForm(EMPTY);
    } catch (err) {
      setErrors(fieldErrors(err));
      setStatus({ busy: false, error: errorMessage(err), sent: null });
    }
  }

  return (
    <>
      <PageHero
        eyebrow="Get a Quote"
        title="Tell Us About Your *Dream Home*"
        text="Share a few details about your plot and plans. We'll prepare an estimate and call you back."
        image="/images/hero/services.webp"
      />

      <section className="section" aria-labelledby="quote-heading">
        <div className="container narrow">
          <div className="form-card">
            {status.sent ? (
              <div className="form-success-panel" role="status">
                <TbCircleCheck aria-hidden="true" />
                {IS_PREVIEW ? (
                  <>
                    <h2>Thank you, {status.sent.fullName.split(' ')[0]}! This is a demo preview.</h2>
                    <p>Forms are not saved in the preview yet. Tap below to send your details on WhatsApp so our team receives them.</p>
                  </>
                ) : (
                  <>
                    <h2>Thank you, {status.sent.fullName.split(' ')[0]}! Your quote request has been received.</h2>
                    <p>Our team will review your requirements and contact you shortly. Want a faster reply? Send the details on WhatsApp.</p>
                  </>
                )}
                <div className="form-success-actions">
                  <WhatsAppButton message={quoteMessage(get('company.name'), status.sent)}>Send details on WhatsApp</WhatsAppButton>
                  <button type="button" className="btn btn-ghost" onClick={() => setStatus({ busy: false, error: '', sent: null })}>
                    Request another quote
                  </button>
                </div>
              </div>
            ) : (
              <>
                <SectionHeading eyebrow="Free Quotation" title="Request a *Quote*" id="quote-heading" />
                <form onSubmit={submit} noValidate>
                  <div className="hp-field" aria-hidden="true">
                    <label>
                      Website <input tabIndex={-1} autoComplete="off" value={form.website} onChange={set('website')} />
                    </label>
                  </div>
                  <div className="form-grid">
                    <Field label="Full Name" required icon={TbUser} value={form.fullName} onChange={set('fullName')} error={errors.fullName} autoComplete="name" maxLength={120} />
                    <Field label="Mobile Number" required icon={TbPhone} type="tel" value={form.mobile} onChange={set('mobile')} error={errors.mobile} autoComplete="tel" maxLength={20} />
                    <Field label="Email" icon={TbMail} type="email" value={form.email} onChange={set('email')} error={errors.email} autoComplete="email" maxLength={160} />
                    <Field label="Construction Type" required as="select" value={form.constructionType} onChange={set('constructionType')} error={errors.constructionType}>
                      <option value="">Select type</option>
                      {CONSTRUCTION_TYPES.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </Field>
                    <Field label="Plot Area" icon={TbRuler2} value={form.plotArea} onChange={set('plotArea')} error={errors.plotArea} placeholder="e.g. 2,000 sq. ft." maxLength={60} />
                    <Field label="Preferred Location" icon={TbMapPin} value={form.projectLocation} onChange={set('projectLocation')} error={errors.projectLocation} placeholder="e.g. Satara" maxLength={150} />
                    <Field label="Estimated Budget" as="select" value={form.budget} onChange={set('budget')} error={errors.budget} className="span-2">
                      <option value="">Select a range</option>
                      {BUDGETS.map((b) => (
                        <option key={b}>{b}</option>
                      ))}
                    </Field>
                    <Field
                      label="Description"
                      as="textarea"
                      rows={5}
                      value={form.message}
                      onChange={set('message')}
                      error={errors.message}
                      maxLength={3000}
                      placeholder="Number of floors, rooms, style you like, timeline…"
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
                    {status.busy ? 'Sending…' : 'Request Quote'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
