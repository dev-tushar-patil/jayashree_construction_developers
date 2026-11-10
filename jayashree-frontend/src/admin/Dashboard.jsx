import { Link } from 'react-router-dom';
import { TbBuildingEstate, TbCircleCheck, TbCrane, TbMessages, TbPhoto, TbPlus, TbStar } from 'react-icons/tb';
import { ErrorState, Spinner } from '../components/States.jsx';
import { useFetch } from '../hooks/useFetch.js';
import { useToast } from '../hooks/useToast.jsx';
import { adminApi, assetUrl } from '../services/api.js';
import { ENQUIRY_STATUS, ENQUIRY_TYPES, PROJECT_STATUS, REVIEW_STATUS, formatDate, formatDateTime } from '../services/labels.js';
import { Badge, PageHeader, useConfirm } from './ui.jsx';

const STATUS_TONE = { NEW: 'orange', CONTACTED: 'blue', FOLLOW_UP: 'purple', CONVERTED: 'green', CLOSED: 'neutral' };

export default function Dashboard() {
  const { data, loading, error, reload } = useFetch(() => adminApi.get('/admin/dashboard').then((r) => r.data), []);
  const toast = useToast();
  const [confirm, confirmDialog] = useConfirm();

  if (loading && !data) return <Spinner />;
  if (error) return <ErrorState error={error} onRetry={reload} />;

  const cards = [
    { label: 'Total Projects', value: data.totalProjects, Icon: TbBuildingEstate, to: '/admin/projects' },
    { label: 'Ongoing Projects', value: data.ongoingProjects, Icon: TbCrane, to: '/admin/projects?status=ONGOING' },
    { label: 'Completed Projects', value: data.completedProjects, Icon: TbCircleCheck, to: '/admin/projects?status=COMPLETED' },
    { label: 'Gallery Images', value: data.galleryImages, Icon: TbPhoto, to: '/admin/gallery' },
    { label: 'Total Enquiries', value: data.totalEnquiries, Icon: TbMessages, to: '/admin/enquiries', note: data.newEnquiries ? `${data.newEnquiries} new` : null },
    { label: 'Total Reviews', value: data.totalReviews, Icon: TbStar, to: '/admin/reviews', note: data.pendingReviews ? `${data.pendingReviews} awaiting approval` : null },
  ];
  const sample = data.sampleContent;
  const hasSample = sample.projects + sample.galleryImages + sample.reviews > 0;

  function removeSample() {
    confirm({
      title: 'Remove sample content?',
      message: `This permanently deletes the ${sample.projects} sample projects, ${sample.galleryImages} sample gallery photos and ${sample.reviews} sample reviews added for the demo. Your own content is not touched.`,
      confirmLabel: 'Remove sample content',
      onConfirm: async () => {
        await adminApi.delete('/admin/sample-content');
        toast.success('Sample content removed.');
        reload();
      },
    });
  }

  return (
    <>
      <PageHeader title="Dashboard" subtitle="An overview of your website.">
        <Link to="/admin/projects/new" className="btn btn-primary">
          <TbPlus aria-hidden="true" /> Add New Project
        </Link>
      </PageHeader>

      {hasSample && (
        <div className="notice notice-warning">
          <div>
            <strong>Demo content is still on the website.</strong> {sample.projects} projects, {sample.galleryImages} gallery photos and {sample.reviews} reviews were added as
            examples. Remove them before going live, once your own content is in.
          </div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={removeSample}>
            Remove sample content
          </button>
        </div>
      )}

      <div className="stat-cards">
        {cards.map(({ label, value, Icon, to, note }) => (
          <Link key={label} to={to} className="stat-card">
            <span className="stat-card-icon">
              <Icon aria-hidden="true" />
            </span>
            <div>
              <strong>{value}</strong>
              <span>{label}</span>
              {note && <em>{note}</em>}
            </div>
          </Link>
        ))}
      </div>

      <div className="dash-grid">
        <section className="panel">
          <header className="panel-header">
            <h2>Recent Enquiries</h2>
            <Link to="/admin/enquiries" className="text-link">
              View all
            </Link>
          </header>
          {data.recentEnquiries.length === 0 ? (
            <p className="panel-empty">No enquiries yet. Contact and quote forms on the website will appear here.</p>
          ) : (
            <ul className="panel-list">
              {data.recentEnquiries.map((e) => (
                <li key={e.id}>
                  <Link to={`/admin/enquiries?open=${e.id}`}>
                    <div>
                      <strong>{e.fullName}</strong>
                      <span>
                        {ENQUIRY_TYPES[e.type]} · {e.interestedIn || e.constructionType || '—'} · {e.mobile}
                      </span>
                    </div>
                    <div className="panel-meta">
                      <Badge tone={STATUS_TONE[e.status]}>{ENQUIRY_STATUS[e.status]}</Badge>
                      <time>{formatDateTime(e.createdAt)}</time>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="panel">
          <header className="panel-header">
            <h2>Recently Added Projects</h2>
            <Link to="/admin/projects" className="text-link">
              View all
            </Link>
          </header>
          {data.recentProjects.length === 0 ? (
            <p className="panel-empty">
              No projects yet. <Link to="/admin/projects/new">Add your first project</Link>.
            </p>
          ) : (
            <ul className="panel-list">
              {data.recentProjects.map((p) => (
                <li key={p.id}>
                  <Link to={`/admin/projects/${p.id}`}>
                    {p.coverThumbUrl ? <img src={assetUrl(p.coverThumbUrl)} alt="" className="panel-thumb" /> : <span className="panel-thumb" />}
                    <div>
                      <strong>{p.name}</strong>
                      <span>
                        {p.location} · {p.imageCount} photos
                      </span>
                    </div>
                    <div className="panel-meta">
                      <Badge tone={p.status === 'COMPLETED' ? 'green' : 'orange'}>{PROJECT_STATUS[p.status]}</Badge>
                      {!p.published && <Badge>Draft</Badge>}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="panel">
          <header className="panel-header">
            <h2>Latest Reviews</h2>
            <Link to="/admin/reviews" className="text-link">
              View all
            </Link>
          </header>
          {data.latestReviews.length === 0 ? (
            <p className="panel-empty">No reviews yet.</p>
          ) : (
            <ul className="panel-list">
              {data.latestReviews.map((r) => (
                <li key={r.id}>
                  <Link to={`/admin/reviews?status=${r.status}`}>
                    <div>
                      <strong>
                        {r.customerName} · {'★'.repeat(r.rating)}
                      </strong>
                      <span className="clamp-1">{r.content}</span>
                    </div>
                    <div className="panel-meta">
                      <Badge tone={r.status === 'APPROVED' ? 'green' : r.status === 'PENDING' ? 'orange' : 'neutral'}>{REVIEW_STATUS[r.status]}</Badge>
                      <time>{formatDate(r.reviewDate)}</time>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
      {confirmDialog}
    </>
  );
}
