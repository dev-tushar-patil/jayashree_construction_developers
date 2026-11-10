import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { TbEdit, TbExternalLink, TbPhoto, TbPlus, TbSearch, TbTrash } from 'react-icons/tb';
import { EmptyState, ErrorState, Spinner } from '../components/States.jsx';
import { useFetch } from '../hooks/useFetch.js';
import { useToast } from '../hooks/useToast.jsx';
import { adminApi, assetUrl, errorMessage } from '../services/api.js';
import { PROJECT_CATEGORIES, PROJECT_STATUS, formatDate } from '../services/labels.js';
import { Badge, PageHeader, Pagination, Toggle, useConfirm } from './ui.jsx';

export default function ProjectsAdmin() {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(params.get('q') || '');
  const filters = {
    q: params.get('q') || '',
    status: params.get('status') || '',
    category: params.get('category') || '',
    published: params.get('published') || '',
    page: Number(params.get('page') || 0),
  };
  const toast = useToast();
  const [confirm, confirmDialog] = useConfirm();

  const { data, loading, error, reload, setData } = useFetch(
    () =>
      adminApi
        .get('/admin/projects', {
          params: {
            q: filters.q || undefined,
            status: filters.status || undefined,
            category: filters.category || undefined,
            published: filters.published || undefined,
            page: filters.page,
            size: 15,
          },
        })
        .then((r) => r.data),
    [params.toString()],
  );

  // Debounced search box
  useEffect(() => {
    const t = setTimeout(() => {
      if (search !== filters.q) update({ q: search });
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  function update(changes) {
    const next = { ...filters, page: 0, ...changes };
    const clean = Object.fromEntries(Object.entries(next).filter(([, v]) => v !== '' && v !== 0 && v != null));
    setParams(clean, { replace: true });
  }

  async function setFlag(project, key, value) {
    try {
      const { data: updated } = await adminApi.patch(`/admin/projects/${project.id}`, { [key]: value });
      setData((d) => ({ ...d, content: d.content.map((p) => (p.id === updated.id ? updated : p)) }));
      toast.success(
        key === 'published' ? (value ? `"${project.name}" is now live on the website.` : `"${project.name}" is hidden from the website.`) : value ? 'Shown on the homepage.' : 'Removed from featured.',
      );
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }

  function remove(project) {
    confirm({
      title: 'Delete project?',
      message: `"${project.name}" will be removed from the website and the admin panel. This cannot be undone from the panel.`,
      onConfirm: async () => {
        await adminApi.delete(`/admin/projects/${project.id}`);
        toast.success('Project deleted.');
        reload();
      },
    });
  }

  return (
    <>
      <PageHeader title="Manage Projects" subtitle="Published projects appear on the website's Projects page straight away.">
        <Link to="/admin/projects/new" className="btn btn-primary">
          <TbPlus aria-hidden="true" /> Add New Project
        </Link>
      </PageHeader>

      <div className="toolbar">
        <label className="search-box">
          <TbSearch aria-hidden="true" />
          <input type="search" placeholder="Search name or location" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search projects" />
        </label>
        <select value={filters.status} onChange={(e) => update({ status: e.target.value })} aria-label="Filter by status">
          <option value="">All statuses</option>
          {Object.entries(PROJECT_STATUS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <select value={filters.category} onChange={(e) => update({ category: e.target.value })} aria-label="Filter by category">
          <option value="">All categories</option>
          {Object.entries(PROJECT_CATEGORIES).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <select value={filters.published} onChange={(e) => update({ published: e.target.value })} aria-label="Filter by visibility">
          <option value="">Published &amp; drafts</option>
          <option value="true">Published</option>
          <option value="false">Drafts</option>
        </select>
      </div>

      {loading && !data && <Spinner />}
      {error && <ErrorState error={error} onRetry={reload} />}
      {data && data.content.length === 0 && (
        <EmptyState title={filters.q || filters.status || filters.category || filters.published ? 'No projects match these filters' : 'No projects yet'}>
          <Link to="/admin/projects/new" className="btn btn-primary btn-sm">
            Add your first project
          </Link>
        </EmptyState>
      )}
      {data && data.content.length > 0 && (
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Project</th>
                <th>Category</th>
                <th>Status</th>
                <th>Published</th>
                <th>Featured</th>
                <th>Added</th>
                <th>
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {data.content.map((p) => (
                <tr key={p.id}>
                  <td data-label="Project">
                    <div className="cell-project">
                      {p.coverThumbUrl ? (
                        <img src={assetUrl(p.coverThumbUrl)} alt="" />
                      ) : (
                        <span className="thumb-empty">
                          <TbPhoto />
                        </span>
                      )}
                      <div>
                        <Link to={`/admin/projects/${p.id}`}>
                          <strong>{p.name}</strong>
                        </Link>
                        <span>
                          {p.location} · {p.imageCount} photo{p.imageCount === 1 ? '' : 's'}
                          {p.sample && (
                            <>
                              {' '}
                              · <Badge>Sample</Badge>
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td data-label="Category">{PROJECT_CATEGORIES[p.category]}</td>
                  <td data-label="Status">
                    <Badge tone={p.status === 'COMPLETED' ? 'green' : 'orange'}>{PROJECT_STATUS[p.status]}</Badge>
                  </td>
                  <td data-label="Published">
                    <Toggle checked={p.published} onChange={(v) => setFlag(p, 'published', v)} label={<span className="sr-only">Published</span>} />
                  </td>
                  <td data-label="Featured">
                    <Toggle checked={p.featured} onChange={(v) => setFlag(p, 'featured', v)} label={<span className="sr-only">Featured</span>} />
                  </td>
                  <td data-label="Added">{formatDate(p.createdAt)}</td>
                  <td className="cell-actions">
                    {p.published && (
                      <a href={`/projects/${p.slug}`} target="_blank" rel="noopener noreferrer" className="icon-btn" aria-label={`View ${p.name} on the website`}>
                        <TbExternalLink />
                      </a>
                    )}
                    <Link to={`/admin/projects/${p.id}`} className="icon-btn" aria-label={`Edit ${p.name}`}>
                      <TbEdit />
                    </Link>
                    <button type="button" className="icon-btn icon-btn-danger" onClick={() => remove(p)} aria-label={`Delete ${p.name}`}>
                      <TbTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {data && <Pagination page={data.page} totalPages={data.totalPages} onPage={(page) => update({ page })} />}
      {confirmDialog}
    </>
  );
}
