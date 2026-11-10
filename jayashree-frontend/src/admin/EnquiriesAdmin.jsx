import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { TbBrandWhatsapp, TbPhone, TbSearch, TbTrash } from 'react-icons/tb';
import Field from '../components/Field.jsx';
import { EmptyState, ErrorState, Spinner } from '../components/States.jsx';
import { useFetch } from '../hooks/useFetch.js';
import { useToast } from '../hooks/useToast.jsx';
import { adminApi, errorMessage } from '../services/api.js';
import { telLink, whatsappLink } from '../services/contact.js';
import { ENQUIRY_STATUS, ENQUIRY_TYPES, formatDateTime } from '../services/labels.js';
import { Badge, Modal, PageHeader, Pagination, useConfirm } from './ui.jsx';

const TONE = { NEW: 'orange', CONTACTED: 'blue', FOLLOW_UP: 'purple', CONVERTED: 'green', CLOSED: 'neutral' };

function customerWhatsapp(e) {
  const topic = e.projectName || e.interestedIn || e.constructionType || 'your enquiry';
  return whatsappLink(e.mobile, `Hello ${e.fullName}, this is Jayashree Construction & Developers regarding your enquiry about ${topic}.`);
}

function EnquiryModal({ enquiry, onClose, onSaved, onDelete }) {
  const [form, setForm] = useState({ status: enquiry.status, adminNotes: enquiry.adminNotes || '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const rows = [
    ['Type', ENQUIRY_TYPES[enquiry.type]],
    ['Received', formatDateTime(enquiry.createdAt)],
    ['Mobile', enquiry.mobile],
    ['Email', enquiry.email],
    ['Interested in', enquiry.interestedIn],
    ['Project', enquiry.projectName],
    ['Construction type', enquiry.constructionType],
    ['Plot area', enquiry.plotArea],
    ['Location', enquiry.projectLocation],
    ['Budget', enquiry.budget],
  ].filter(([, v]) => v);

  async function save() {
    setBusy(true);
    try {
      const { data } = await adminApi.put(`/admin/enquiries/${enquiry.id}`, form);
      onSaved(data);
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  const wa = customerWhatsapp(enquiry);
  return (
    <Modal
      title={enquiry.fullName}
      onClose={onClose}
      size="lg"
      footer={
        <>
          <button type="button" className="btn btn-ghost btn-danger-text" onClick={() => onDelete(enquiry)}>
            <TbTrash aria-hidden="true" /> Delete
          </button>
          <span className="spacer" />
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Close
          </button>
          <button type="button" className="btn btn-primary" onClick={save} disabled={busy}>
            {busy ? 'Saving…' : 'Save'}
          </button>
        </>
      }
    >
      <div className="enquiry-actions">
        <a className="btn btn-outline btn-sm" href={telLink(enquiry.mobile)}>
          <TbPhone aria-hidden="true" /> Call {enquiry.mobile}
        </a>
        {wa && (
          <a className="btn btn-whatsapp btn-sm" href={wa} target="_blank" rel="noopener noreferrer">
            <TbBrandWhatsapp aria-hidden="true" /> WhatsApp
          </a>
        )}
        {enquiry.email && (
          <a className="btn btn-ghost btn-sm" href={`mailto:${enquiry.email}`}>
            Email
          </a>
        )}
      </div>
      <dl className="detail-list">
        {rows.map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
      {enquiry.message && (
        <div className="enquiry-message">
          <h3>Message</h3>
          <p className="pre-line">{enquiry.message}</p>
        </div>
      )}
      <div className="form-grid">
        <Field label="Status" as="select" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
          {Object.entries(ENQUIRY_STATUS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </Field>
        <Field
          label="Internal notes"
          as="textarea"
          rows={4}
          value={form.adminNotes}
          onChange={(e) => setForm((f) => ({ ...f, adminNotes: e.target.value }))}
          maxLength={5000}
          hint="Only visible to admins."
          className="span-2"
        />
      </div>
      {error && <p className="form-error">{error}</p>}
    </Modal>
  );
}

export default function EnquiriesAdmin() {
  const toast = useToast();
  const [confirm, confirmDialog] = useConfirm();
  const [params, setParams] = useSearchParams();
  const [filters, setFilters] = useState({ status: '', type: '', q: '', page: 0 });
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(null);

  const { data, loading, error, reload, setData } = useFetch(
    () =>
      adminApi
        .get('/admin/enquiries', {
          params: { status: filters.status || undefined, type: filters.type || undefined, q: filters.q || undefined, page: filters.page, size: 20 },
        })
        .then((r) => r.data),
    [filters],
  );

  useEffect(() => {
    const t = setTimeout(() => setFilters((f) => (f.q === search ? f : { ...f, q: search, page: 0 })), 350);
    return () => clearTimeout(t);
  }, [search]);

  // Opened from the dashboard: /admin/enquiries?open=12
  useEffect(() => {
    const id = params.get('open');
    if (!id) return;
    adminApi
      .get(`/admin/enquiries/${id}`)
      .then((r) => setOpen(r.data))
      .catch(() => {})
      .finally(() => setParams({}, { replace: true }));
  }, [params, setParams]);

  function remove(enquiry) {
    confirm({
      title: 'Delete enquiry?',
      message: `The enquiry from ${enquiry.fullName} will be permanently deleted.`,
      onConfirm: async () => {
        await adminApi.delete(`/admin/enquiries/${enquiry.id}`);
        setOpen(null);
        toast.success('Enquiry deleted.');
        reload();
      },
    });
  }

  return (
    <>
      <PageHeader title="Manage Enquiries" subtitle="Contact, quote and project enquiries from the website." />
      <div className="toolbar">
        <label className="search-box">
          <TbSearch aria-hidden="true" />
          <input type="search" placeholder="Search name or mobile number" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search enquiries" />
        </label>
        <select value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value, page: 0 }))} aria-label="Filter by status">
          <option value="">All statuses</option>
          {Object.entries(ENQUIRY_STATUS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <select value={filters.type} onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value, page: 0 }))} aria-label="Filter by type">
          <option value="">All types</option>
          {Object.entries(ENQUIRY_TYPES).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
      </div>

      {loading && !data && <Spinner />}
      {error && <ErrorState error={error} onRetry={reload} />}
      {data && data.content.length === 0 && <EmptyState title="No enquiries found">When visitors use the contact or quote forms, their enquiries appear here.</EmptyState>}
      {data && data.content.length > 0 && (
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Interested in</th>
                <th>Type</th>
                <th>Status</th>
                <th>Received</th>
                <th>
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {data.content.map((e) => (
                <tr key={e.id} className={e.status === 'NEW' ? 'is-new' : ''}>
                  <td data-label="Customer">
                    <button type="button" className="link-button" onClick={() => setOpen(e)}>
                      <strong>{e.fullName}</strong>
                    </button>
                    <span className="cell-sub">{e.mobile}</span>
                  </td>
                  <td data-label="Interested in">{e.projectName || e.interestedIn || e.constructionType || '—'}</td>
                  <td data-label="Type">{ENQUIRY_TYPES[e.type]}</td>
                  <td data-label="Status">
                    <Badge tone={TONE[e.status]}>{ENQUIRY_STATUS[e.status]}</Badge>
                  </td>
                  <td data-label="Received">{formatDateTime(e.createdAt)}</td>
                  <td className="cell-actions">
                    <a href={telLink(e.mobile)} className="icon-btn" aria-label={`Call ${e.fullName}`} title="Call">
                      <TbPhone />
                    </a>
                    {customerWhatsapp(e) && (
                      <a href={customerWhatsapp(e)} target="_blank" rel="noopener noreferrer" className="icon-btn icon-btn-wa" aria-label={`WhatsApp ${e.fullName}`} title="WhatsApp">
                        <TbBrandWhatsapp />
                      </a>
                    )}
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => setOpen(e)}>
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {data && <Pagination page={data.page} totalPages={data.totalPages} onPage={(page) => setFilters((f) => ({ ...f, page }))} />}
      {open && (
        <EnquiryModal
          enquiry={open}
          onClose={() => setOpen(null)}
          onDelete={remove}
          onSaved={(updated) => {
            setData((d) => (d ? { ...d, content: d.content.map((x) => (x.id === updated.id ? updated : x)) } : d));
            setOpen(null);
            toast.success('Enquiry updated.');
          }}
        />
      )}
      {confirmDialog}
    </>
  );
}
