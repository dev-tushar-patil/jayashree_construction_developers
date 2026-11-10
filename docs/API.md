# REST API

Base URL: `/api`. All bodies are JSON unless marked *multipart*. Errors always look like:

```json
{ "status": 400, "message": "Please correct the highlighted fields.", "fieldErrors": { "mobile": "Please enter a valid mobile number." } }
```

Paged endpoints accept `page` (from 0) and `size`, and return
`{ "content": [...], "page": 0, "size": 12, "totalElements": 31, "totalPages": 3 }`.

Admin endpoints (`/api/admin/**`, `/api/auth/me`) need `Authorization: Bearer <token>` from the login call, and the token's
`ADMIN` role. Login, enquiry and review submissions are rate limited per IP (`RATE_LIMIT_PER_MINUTE`, default 15).

## Authentication

| Method | Path | Body / notes |
|---|---|---|
| POST | `/api/auth/login` | `{ "login": "admin or email", "password": "..." }` → `{ token, expiresAt, admin }` |
| POST | `/api/auth/logout` | 204. Tokens are stateless; the client discards its token. |
| GET | `/api/auth/me` | Current admin profile |
| PUT | `/api/admin/account/password` | `{ currentPassword, newPassword }` (10+ chars). Revokes all other tokens; returns a fresh `{ token, ... }`. |

## Public (read-only, except the two forms)

| Method | Path | Notes |
|---|---|---|
| GET | `/api/content` | Every website text, contact detail, social link and SEO field as `{ key: value }` |
| GET | `/api/projects` | Published projects. Filters: `category` (RESIDENTIAL, BUNGALOW, VILLA, COMMERCIAL, OTHER), `status` (ONGOING, COMPLETED). Paged. |
| GET | `/api/projects/featured?limit=6` | Homepage list: featured projects first, then the newest published |
| GET | `/api/projects/{slug}` | Published project with all images and features |
| GET | `/api/services` | Visible services in admin order |
| GET | `/api/services/{slug}` | One service |
| GET | `/api/gallery` | Visible photos. Filter: `category` (EXTERIOR, INTERIOR, BUNGALOW, RESIDENTIAL, ONGOING, COMPLETED). Paged. |
| GET | `/api/reviews` | Approved, visible reviews, newest first. Paged. |
| GET | `/api/reviews/featured` | Homepage testimonials |
| GET | `/api/reviews/summary` | `{ count, average }` of approved reviews |
| POST | `/api/reviews` | `{ customerName, customerPhone?, rating 1-5, content, projectName? }` → stored as PENDING |
| POST | `/api/enquiries` | `{ type: CONTACT\|QUOTE\|PROJECT, fullName, mobile, email?, interestedIn?, projectLocation?, constructionType?, plotArea?, budget?, message?, projectId? }` |

Both forms accept a hidden `website` field; if it is filled in (bots do), the request looks successful but nothing is stored.

## Admin: projects

| Method | Path | Notes |
|---|---|---|
| GET | `/api/admin/projects` | Filters: `q` (name/location), `status`, `category`, `published`. Paged. |
| GET | `/api/admin/projects/options` | `[{ id, name }]` for dropdowns |
| GET | `/api/admin/projects/{id}` | Full project, including drafts |
| POST | `/api/admin/projects` | `{ name, category, shortDescription, description, location, mapsUrl, status, startDate, completionDate, features[], featured, published }` |
| PUT | `/api/admin/projects/{id}` | Same body |
| PATCH | `/api/admin/projects/{id}` | `{ published?, featured? }` quick toggles |
| DELETE | `/api/admin/projects/{id}` | Soft delete (hidden everywhere; slug freed) |
| POST | `/api/admin/projects/{id}/images` | *multipart* `files` (1–10 per request). JPG/PNG/WebP, checked by content. The first image of a project becomes the main image. |
| DELETE | `/api/admin/projects/{id}/images/{imageId}` | Deletes the image and its files |
| PUT | `/api/admin/projects/{id}/images/{imageId}/cover` | Sets the main (thumbnail) image |
| PUT | `/api/admin/projects/{id}/images/{imageId}` | `{ caption }` |
| PUT | `/api/admin/projects/{id}/images/order` | `{ ids: [...] }` |

## Admin: gallery, services, reviews, enquiries

| Method | Path | Notes |
|---|---|---|
| GET | `/api/admin/gallery` | Filters: `q`, `category`, `published`. Paged. |
| POST | `/api/admin/gallery` | *multipart* `files` (1–10), `category`, `titles` (one per file, optional), `description`, `published`, `featured` |
| PUT | `/api/admin/gallery/{id}` | `{ title, description, category, featured, published, sortOrder }` |
| DELETE | `/api/admin/gallery/{id}` | |
| GET | `/api/admin/services` | All services including hidden |
| POST / PUT | `/api/admin/services`, `/api/admin/services/{id}` | `{ title, shortDescription, description, icon, imageUrl, features[], published }` |
| PUT | `/api/admin/services/order` | `{ ids: [...] }` |
| DELETE | `/api/admin/services/{id}` | |
| GET | `/api/admin/reviews` | Filters: `status` (PENDING, APPROVED, REJECTED), `q`. Paged. |
| POST / PUT | `/api/admin/reviews`, `/api/admin/reviews/{id}` | `{ customerName, photoUrl, rating, content, projectId?, projectName?, reviewDate, status, featured, visible }` |
| PATCH | `/api/admin/reviews/{id}` | `{ status?, featured?, visible? }` approve / reject / feature / hide |
| DELETE | `/api/admin/reviews/{id}` | |
| GET | `/api/admin/testimonials` | Featured reviews in slider order |
| PUT | `/api/admin/testimonials/order` | `{ ids: [...] }` |
| GET | `/api/admin/enquiries` | Filters: `status` (NEW, CONTACTED, FOLLOW_UP, CONVERTED, CLOSED), `type`, `q` (name or mobile). Paged. |
| GET / PUT / DELETE | `/api/admin/enquiries/{id}` | PUT body: `{ status, adminNotes }` |

## Admin: content, dashboard, uploads

| Method | Path | Notes |
|---|---|---|
| GET | `/api/admin/content` | Same map as the public endpoint |
| PUT | `/api/admin/content` | Partial `{ key: value }`; unknown keys and invalid URLs/emails/phones are refused with `fieldErrors` |
| GET | `/api/admin/dashboard` | Counts, recent enquiries/projects/reviews, remaining sample content |
| DELETE | `/api/admin/sample-content` | Permanently removes the seeded demo projects, photos and reviews |
| POST | `/api/admin/uploads` | *multipart* `file` → `{ url }` for service images, customer photos and page images |

## Content keys

Defined, with their defaults, in `jayashree-backend/src/main/java/com/jayashree/service/ContentDefaults.java`.
Sections: `company.*`, `home.*`, `stats.*`, `about.*`, `contact.*`, `social.*`, `footer.*`, `seo.*`.
Keys ending in `Json` hold a JSON array of `{ "title", "text" }`. In titles, `*word*` is shown as the orange italic accent.
