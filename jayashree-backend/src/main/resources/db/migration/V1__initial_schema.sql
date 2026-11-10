-- Jayashree Construction & Developers: initial schema (MySQL 8).
-- Applied automatically by Flyway on startup. Never edit a released migration: add V2__..., V3__... instead.

CREATE TABLE admin_user (
    id             BIGINT       NOT NULL AUTO_INCREMENT,
    username       VARCHAR(60)  NOT NULL,
    email          VARCHAR(160) NOT NULL,
    password_hash  VARCHAR(100) NOT NULL,
    display_name   VARCHAR(120) NOT NULL,
    role           VARCHAR(20)  NOT NULL DEFAULT 'ADMIN',
    active         BOOLEAN      NOT NULL DEFAULT TRUE,
    -- Bumped on password change; tokens carrying an older value stop working.
    token_version  INT          NOT NULL DEFAULT 0,
    last_login_at  DATETIME(6)  NULL,
    created_at     DATETIME(6)  NOT NULL,
    updated_at     DATETIME(6)  NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_admin_username (username),
    UNIQUE KEY uk_admin_email (email)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE project (
    id                 BIGINT        NOT NULL AUTO_INCREMENT,
    slug               VARCHAR(180)  NOT NULL,
    name               VARCHAR(150)  NOT NULL,
    category           VARCHAR(20)   NOT NULL,
    short_description  VARCHAR(300)  NOT NULL,
    description        TEXT          NULL,
    location           VARCHAR(150)  NOT NULL,
    maps_url           VARCHAR(1000) NULL,
    status             VARCHAR(20)   NOT NULL,
    start_date         DATE          NULL,
    completion_date    DATE          NULL,
    features           TEXT          NULL,     -- JSON array of strings
    featured           BOOLEAN       NOT NULL DEFAULT FALSE,
    published          BOOLEAN       NOT NULL DEFAULT FALSE,
    sort_order         INT           NOT NULL DEFAULT 0,
    sample             BOOLEAN       NOT NULL DEFAULT FALSE,
    deleted_at         DATETIME(6)   NULL,     -- soft delete
    created_at         DATETIME(6)   NOT NULL,
    updated_at         DATETIME(6)   NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_project_slug (slug),
    KEY idx_project_public (deleted_at, published, created_at),
    KEY idx_project_status (status),
    KEY idx_project_category (category),
    KEY idx_project_featured (featured)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE project_image (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    project_id  BIGINT       NOT NULL,
    url         VARCHAR(500) NOT NULL,
    thumb_url   VARCHAR(500) NOT NULL,
    caption     VARCHAR(200) NULL,
    width       INT          NULL,
    height      INT          NULL,
    cover       BOOLEAN      NOT NULL DEFAULT FALSE,
    sort_order  INT          NOT NULL DEFAULT 0,
    created_at  DATETIME(6)  NOT NULL,
    updated_at  DATETIME(6)  NOT NULL,
    PRIMARY KEY (id),
    KEY idx_project_image_project (project_id, sort_order),
    CONSTRAINT fk_project_image_project FOREIGN KEY (project_id) REFERENCES project (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE gallery_image (
    id           BIGINT       NOT NULL AUTO_INCREMENT,
    title        VARCHAR(150) NOT NULL,
    description  VARCHAR(500) NULL,
    category     VARCHAR(20)  NOT NULL,
    url          VARCHAR(500) NOT NULL,
    thumb_url    VARCHAR(500) NOT NULL,
    width        INT          NULL,
    height       INT          NULL,
    featured     BOOLEAN      NOT NULL DEFAULT FALSE,
    published    BOOLEAN      NOT NULL DEFAULT TRUE,
    sort_order   INT          NOT NULL DEFAULT 0,
    sample       BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at   DATETIME(6)  NOT NULL,
    updated_at   DATETIME(6)  NOT NULL,
    PRIMARY KEY (id),
    KEY idx_gallery_public (published, category, created_at),
    KEY idx_gallery_featured (featured)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE service_offering (
    id                 BIGINT       NOT NULL AUTO_INCREMENT,
    slug               VARCHAR(160) NOT NULL,
    title              VARCHAR(120) NOT NULL,
    short_description  VARCHAR(300) NOT NULL,
    description        TEXT         NULL,
    icon               VARCHAR(40)  NOT NULL DEFAULT 'home',
    image_url          VARCHAR(500) NULL,
    features           TEXT         NULL,     -- JSON array of strings
    sort_order         INT          NOT NULL DEFAULT 0,
    published          BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at         DATETIME(6)  NOT NULL,
    updated_at         DATETIME(6)  NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_service_slug (slug),
    KEY idx_service_order (published, sort_order)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE review (
    id              BIGINT        NOT NULL AUTO_INCREMENT,
    customer_name   VARCHAR(120)  NOT NULL,
    customer_phone  VARCHAR(20)   NULL,     -- only from website submissions, never shown publicly
    photo_url       VARCHAR(500)  NULL,
    rating          TINYINT       NOT NULL,
    content         VARCHAR(2000) NOT NULL,
    project_id      BIGINT        NULL,
    project_name    VARCHAR(150)  NULL,
    review_date     DATE          NOT NULL,
    status          VARCHAR(20)   NOT NULL DEFAULT 'PENDING',
    source          VARCHAR(20)   NOT NULL DEFAULT 'ADMIN',
    featured        BOOLEAN       NOT NULL DEFAULT FALSE,
    visible         BOOLEAN       NOT NULL DEFAULT TRUE,
    sort_order      INT           NOT NULL DEFAULT 0,  -- order in the homepage testimonial slider
    sample          BOOLEAN       NOT NULL DEFAULT FALSE,
    created_at      DATETIME(6)   NOT NULL,
    updated_at      DATETIME(6)   NOT NULL,
    PRIMARY KEY (id),
    KEY idx_review_public (status, visible, review_date),
    KEY idx_review_featured (featured, sort_order),
    CONSTRAINT chk_review_rating CHECK (rating BETWEEN 1 AND 5),
    CONSTRAINT fk_review_project FOREIGN KEY (project_id) REFERENCES project (id) ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE enquiry (
    id                 BIGINT        NOT NULL AUTO_INCREMENT,
    type               VARCHAR(20)   NOT NULL,   -- CONTACT, QUOTE, PROJECT
    full_name          VARCHAR(120)  NOT NULL,
    email              VARCHAR(160)  NULL,
    mobile             VARCHAR(20)   NOT NULL,
    interested_in      VARCHAR(120)  NULL,
    project_location   VARCHAR(150)  NULL,
    construction_type  VARCHAR(60)   NULL,
    plot_area          VARCHAR(60)   NULL,
    budget             VARCHAR(60)   NULL,
    message            VARCHAR(3000) NULL,
    project_id         BIGINT        NULL,
    project_name       VARCHAR(150)  NULL,
    status             VARCHAR(20)   NOT NULL DEFAULT 'NEW',
    admin_notes        TEXT          NULL,
    created_at         DATETIME(6)   NOT NULL,
    updated_at         DATETIME(6)   NOT NULL,
    PRIMARY KEY (id),
    KEY idx_enquiry_status (status, created_at),
    KEY idx_enquiry_created (created_at),
    KEY idx_enquiry_mobile (mobile),
    KEY idx_enquiry_name (full_name)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Editable website text, contact details, social links and SEO, as key/value pairs grouped by "section".
-- Keys that have never been edited fall back to the defaults in ContentDefaults.java.
CREATE TABLE site_content (
    content_key    VARCHAR(100) NOT NULL,
    section        VARCHAR(30)  NOT NULL,
    content_value  TEXT         NULL,
    updated_at     DATETIME(6)  NOT NULL,
    PRIMARY KEY (content_key),
    KEY idx_site_content_section (section)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
