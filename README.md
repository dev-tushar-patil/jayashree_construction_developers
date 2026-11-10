# Jayashree Construction & Developers: website and admin panel

A full-stack website for Jayashree Construction & Developers, Satara. Visitors see the public site. The owner runs
everything from a secure admin panel at `/admin/login`: projects with multiple photos, the gallery, services, reviews,
enquiries, and all page text, contact details and social links. The pages render whatever the API returns, so changing
content never needs a code change.

| Part | Technology |
|---|---|
| Website and admin panel | React 18, React Router, Axios, React Icons, Vite; hand-written CSS (see *Design*) |
| API | Java 21, Spring Boot 3.5 (Web, Data JPA / Hibernate, Validation, Security), JWT (Spring OAuth2 resource server, HS256), BCrypt |
| Database | MySQL 8, schema managed by Flyway |
| Images | Validated, EXIF-corrected, resized and thumbnailed on upload; stored through a pluggable `StorageService` (local disk by default) |

## Run it on this PC

Double-click **`start-local.cmd`**. The first run:

1. creates a private MySQL 8 database in `%USERPROFILE%\.jayashree\mysql-data` on port **3309**;
2. writes `jayashree-backend\.env` with a random JWT secret and a random admin password, and **prints the admin login**;
3. builds and starts the API on **8070** and the website on **5170**, then opens http://localhost:5170.

Admin panel: http://localhost:5170/admin/login. Sign in with `admin` (or the email) and the password from `.env`.
Change it at once from **Change Password**. `stop-local.cmd` stops everything cleanly.

The scripts reuse the JDK 21, Maven and MySQL 8 in `%USERPROFILE%\.expense-tracker-tools`, as the Kalagram and HomeVision
projects do. They never touch the old MySQL 5.5 service on port 3306 or the other projects' ports.

### Manual setup (any machine)

Requirements: JDK 21, Maven 3.9+, Node 20+, MySQL 8.

```bash
# 1. API
cd jayashree-backend
cp .env.example .env        # fill in DB_PASSWORD, JWT_SECRET (32+ chars), ADMIN_EMAIL, ADMIN_PASSWORD
mvn spring-boot:run         # http://localhost:8070 ; Flyway creates the tables on first start

# 2. Website (second terminal)
cd jayashree-frontend
npm install
npm run dev                 # http://localhost:5170 ; /api and /uploads are forwarded to the API
```

Tests: `mvn test` (backend). Production build of the website: `npm run build` (output in `jayashree-frontend/dist`).

## Project structure

```
jayashree-construction/
├─ jayashree-backend/                     Spring Boot API
│  ├─ src/main/java/com/jayashree/
│  │  ├─ controller/    REST endpoints (public + /api/admin)
│  │  ├─ service/       business logic, ImageService, ContentDefaults, storage/
│  │  ├─ repository/    Spring Data JPA repositories
│  │  ├─ entity/        JPA entities (Project, ProjectImage, GalleryImage, ServiceOffering, Review, Enquiry, SiteContent, AdminUser)
│  │  ├─ dto/           request/response records with validation
│  │  ├─ security/      SecurityConfig (JWT + roles + CORS), TokenVersionValidator, RateLimitFilter
│  │  ├─ config/        AppProperties, WebConfig (/uploads), DataSeeder
│  │  └─ exception/     ApiException, GlobalExceptionHandler
│  ├─ src/main/resources/application.yml
│  ├─ src/main/resources/db/migration/V1__initial_schema.sql   SQL schema (Flyway)
│  └─ .env.example
├─ jayashree-frontend/                    React website + admin panel
│  ├─ public/images/   logo (unaltered), favicon, temporary photos
│  └─ src/
│     ├─ components/   header, footer, cards, slider, lightbox, forms…
│     ├─ pages/        Home, About, Projects, ProjectDetails, Services, ServiceDetails, Gallery, Reviews, Contact, Quote
│     ├─ admin/        login, layout, dashboard and every management screen (loaded only on /admin)
│     ├─ layouts/  routes/  hooks/  services/  styles/
├─ docs/API.md        endpoint reference
├─ start-local.cmd / stop-local.cmd
```

## How the dynamic parts work

- **Projects.** *Manage Projects → Add New Project*: fill in the form, pick any number of photos (previewed, removable,
  with a star to choose the main image) and press **Save Project**. The browser saves the project, then compresses the
  photos and uploads them in batches of four with a progress bar. The server checks each file, fixes its rotation,
  resizes it, makes a thumbnail and attaches it. A published project appears at once on `/projects` and its own page
  `/projects/<name>`. If marked Featured, it also appears on the homepage. The homepage fills any remaining places with
  the newest published projects, so new work shows up even when it isn't featured.
- **Gallery.** Upload many photos at once with a category, optional per-photo titles, visibility and a featured flag.
  Edit, hide or delete them later.
- **Reviews and testimonials.** Visitors can leave a review on `/reviews`. It is stored as *Pending* and appears only after
  approval. Testimonials are approved reviews marked *Featured*, kept in one table so the same words are never stored
  twice. *Manage Testimonials* sets their order in the homepage slider.
- **Enquiries.** The contact form, the quote form and project enquiry forms all save to the database. *Manage Enquiries*
  can search by name or mobile number, change the status (New → Contacted → Follow-up → Converted → Closed), add
  internal notes, and call or WhatsApp the customer in one tap.
- **Website content.** Every heading, paragraph, statistic (including "60+ Sites Across Satara"), vision/mission, core
  value, contact detail, WhatsApp number, map location, social link, footer text and SEO field is editable. In titles,
  `*word*` gives the orange italic accent from the design.
- **WhatsApp.** Every button opens `https://wa.me/<91number>?text=<URL-encoded message>`, with a project- or
  service-specific message where it makes sense. After a quote request, a button sends the submitted details on WhatsApp.

## Configuration

All backend settings are environment variables (or `jayashree-backend/.env`), listed with defaults in
[`.env.example`](jayashree-backend/.env.example). Nothing secret is in the frontend: every `VITE_` variable is public.

| Variable | Purpose |
|---|---|
| `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` | MySQL connection |
| `JWT_SECRET` | 32+ character signing key. Changing it signs every admin out. |
| `ADMIN_USERNAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` | First admin, created only when no admin exists |
| `CORS_ALLOWED_ORIGINS` | Website origin(s) allowed to call the API |
| `SEED_SAMPLE_DATA` | `true` adds demo projects/photos/reviews once, on first start. They are flagged and removable in one click. |
| `UPLOAD_DIR`, `UPLOAD_PUBLIC_BASE_URL` | Where uploads are stored and served from |
| `UPLOAD_MAX_FILE_SIZE`, `UPLOAD_MAX_REQUEST_SIZE` | Upload limits (15 MB per file, 80 MB per request) |
| `IMAGE_MAX_DIMENSION`, `IMAGE_THUMBNAIL_SIZE`, `IMAGE_JPEG_QUALITY` | Image optimisation (2000 px, 800 px, 0.84) |
| `RATE_LIMIT_PER_MINUTE` | Per-IP limit on login and public form submissions |

## Image storage

Uploads are handled by `ImageService` and stored through the `StorageService` interface. The included
`LocalStorageService` writes to `UPLOAD_DIR/yyyy/MM/<random>.jpg` and the API serves them at `/uploads/...` with long-lived
caching. Only the URL is kept in MySQL, so moving to cloud storage (Amazon S3, Cloudinary, Azure Blob…) means adding
one class that implements `save`/`delete`, annotated `@ConditionalOnProperty(name = "jayashree.storage.type", havingValue = "s3")`,
and setting `STORAGE_TYPE=s3` and `UPLOAD_PUBLIC_BASE_URL` to the bucket or CDN address. No cloud adapter is included,
because none has been chosen yet. **Back up the upload folder** together with the database.

What happens to an uploaded photo:

1. The browser shrinks it to at most 2400 px and re-encodes it as JPEG (an 8 MB phone photo becomes about 400 KB).
2. The server decides the type from the file's first bytes, not its name. HTML or SVG renamed `.jpg` is refused. It also
   refuses images over 60 megapixels.
3. JPEG and PNG are rotated upright from EXIF, resized to 2000 px, saved as JPEG, and get an 800 px thumbnail. Re-encoding
   also drops EXIF data such as GPS location. WebP is kept as uploaded, because the JDK cannot decode it.
4. Lists and grids load the thumbnail with lazy loading. The lightbox and banners load the full image.

## Security

- Admin APIs require a JWT carrying the `ADMIN` role (`hasRole("ADMIN")`). Public APIs are read-only apart from the
  enquiry and review forms, and every other write under `/api` is denied by default.
- Passwords are hashed with BCrypt (cost 12). Login takes the same time for unknown accounts, so it doesn't reveal which
  accounts exist.
- Changing the password increments a token version, which immediately invalidates all older tokens (other devices).
- The token is kept in `sessionStorage`, so it is gone when the tab closes. No credentials appear anywhere in the frontend.
- Login and form submissions are rate limited per IP. The forms also have a hidden honeypot field against bots.
- Bean Validation on every request body. JPA/JPQL parameters only (no string-built SQL). One global error handler, so
  stack traces never reach clients.
- Uploads are limited by type (magic bytes), size, pixel count and number per request, and stored under random names.
- CORS is restricted to `CORS_ALLOWED_ORIGINS`.

## Deploying to production

A typical single-server setup (for example Ubuntu with nginx):

1. **Database**: MySQL 8 with a dedicated user: `CREATE DATABASE jayashree CHARACTER SET utf8mb4; CREATE USER 'jayashree'@'localhost' IDENTIFIED BY '…'; GRANT ALL ON jayashree.* TO 'jayashree'@'localhost';`
2. **API**: `mvn -DskipTests package`, copy `target/jayashree-backend-1.0.0.jar` to the server, set the environment
   variables (as a systemd `EnvironmentFile`), with `SEED_SAMPLE_DATA=false`, `CORS_ALLOWED_ORIGINS=https://yourdomain`
   and `FORWARD_HEADERS=framework`. Run it with `java -Xmx512m -jar jayashree-backend-1.0.0.jar` as a systemd service.
3. **Website**: `npm run build` and copy `dist/` to e.g. `/var/www/jayashree`.
4. **nginx** (HTTPS via Let's Encrypt / certbot):

```nginx
server {
    server_name jayashreeconstruction.com;
    root /var/www/jayashree;
    client_max_body_size 80m;

    location /api/     { proxy_pass http://127.0.0.1:8070; proxy_set_header Host $host;
                         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; proxy_set_header X-Forwarded-Proto $scheme; }
    location /uploads/ { proxy_pass http://127.0.0.1:8070; }
    location /assets/  { expires 1y; add_header Cache-Control "public, immutable"; }
    location /         { try_files $uri /index.html; }   # React routes
}
```

With the site and API on one domain, leave `VITE_API_ORIGIN` empty. Back up the MySQL database and the `uploads` folder daily.

## Before going live

- [ ] **Remove the sample content** (Dashboard → *Remove sample content*) once real projects, photos and reviews are in.
      The demo reviews are invented examples and must not be shown to customers as real.
- [ ] **Check phone number 2.** The brief gave `97626288187`, which has 11 digits; an Indian mobile has 10. It is entered
      as given; correct it in *Contact Information*. WhatsApp currently uses `7558298818`.
- [ ] Add the **email address** and exact **office address / map location** in *Contact Information*.
- [ ] Add **social media links** (icons appear only for links that are filled in).
- [ ] Replace the **temporary photos**. They were cut from the design mockups, so they are low resolution. Upload real
      project photos, and change the page images in *Website Content*.
- [ ] Confirm the **company name spelling**: the official logo reads "JAYASHRI", the website text says "Jayashree".
      The text is editable in *Website Content → Company*. The logo is shown exactly as supplied.
- [ ] Review the default copy (story, vision, mission, values, service descriptions).
- [ ] Production settings: `SEED_SAMPLE_DATA=false`, a new `JWT_SECRET`, HTTPS, backups.

## Design

The layout follows the supplied mockups (About, Projects, Services, Gallery, Contact). The palette is cream and sand
backgrounds, navy serif headings (Libre Caslon Text) with orange italic accents, Inter for body text, rounded cards,
arched image frames and warm sunset call-to-action bands. Buttons and small orange text use a deeper orange (`#C2521A`)
than the brand orange (`#E66A1F`): white text on `#E66A1F` has 3.2:1 contrast, below the 4.5:1 accessibility minimum.
The brand orange is still used for accents, icons and large headings. The brief allowed Bootstrap 5 or Tailwind; plain
CSS with design tokens (`src/styles/base.css`) was used instead. It matches the mockups more closely and adds no
framework weight to the page.
