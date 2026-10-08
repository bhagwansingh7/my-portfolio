-- Runs automatically the first time the MySQL container starts with an empty volume.
-- (The database itself is created by the MYSQL_DATABASE environment variable.)
SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS admin_users (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  email         VARCHAR(190) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('admin') NOT NULL DEFAULT 'admin',
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_admin_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Single-row table (id is always 1) holding the editable "About" content.
CREATE TABLE IF NOT EXISTS portfolio (
  id              TINYINT UNSIGNED NOT NULL DEFAULT 1,
  name            VARCHAR(120) NOT NULL,
  headline        VARCHAR(240) NOT NULL,
  intro           VARCHAR(600) NULL,
  bio             TEXT NULL,
  profile_image   VARCHAR(500) NULL,
  resume_url      VARCHAR(500) NULL,
  public_email    VARCHAR(190) NULL,
  location        VARCHAR(120) NULL,
  developer_focus TEXT NULL,
  current_focus   VARCHAR(500) NULL,
  education       JSON NULL,
  achievements    JSON NULL,
  updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT chk_portfolio_single_row CHECK (id = 1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS settings (
  setting_key   VARCHAR(80) NOT NULL,
  setting_value VARCHAR(500) NULL,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS skills (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name          VARCHAR(80) NOT NULL,
  category      VARCHAR(80) NOT NULL,
  icon          VARCHAR(60) NOT NULL DEFAULT 'Code2',
  level         TINYINT UNSIGNED NULL,
  display_order INT NOT NULL DEFAULT 0,
  enabled       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_skills_order (enabled, display_order),
  KEY idx_skills_category (category),
  CONSTRAINT chk_skills_level CHECK (level IS NULL OR level BETWEEN 0 AND 100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS projects (
  id                    INT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug                  VARCHAR(120) NOT NULL,
  name                  VARCHAR(120) NOT NULL,
  short_description     VARCHAR(300) NOT NULL,
  description           TEXT NULL,
  problem               TEXT NULL,
  solution              TEXT NULL,
  architecture          TEXT NULL,
  challenges            TEXT NULL,
  engineering_decisions TEXT NULL,
  cover_image           VARCHAR(500) NULL,
  github_url            VARCHAR(500) NULL,
  live_url              VARCHAR(500) NULL,
  featured              BOOLEAN NOT NULL DEFAULT FALSE,
  display_order         INT NOT NULL DEFAULT 0,
  year                  SMALLINT UNSIGNED NULL,
  features              JSON NULL,
  highlights            JSON NULL,
  created_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_projects_slug (slug),
  KEY idx_projects_order (display_order),
  KEY idx_projects_featured (featured)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS project_technologies (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  project_id INT UNSIGNED NOT NULL,
  name       VARCHAR(60) NOT NULL,
  position   SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY idx_project_tech_project (project_id, position),
  CONSTRAINT fk_project_tech_project FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS project_images (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  project_id INT UNSIGNED NOT NULL,
  url        VARCHAR(500) NOT NULL,
  caption    VARCHAR(200) NULL,
  position   SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_project_images_project (project_id, position),
  CONSTRAINT fk_project_images_project FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS contact_messages (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(190) NOT NULL,
  subject    VARCHAR(160) NOT NULL,
  message    TEXT NOT NULL,
  status     ENUM('unread','read','archived') NOT NULL DEFAULT 'unread',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_messages_status_created (status, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS social_links (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  platform      VARCHAR(40) NOT NULL,
  label         VARCHAR(80) NOT NULL,
  url           VARCHAR(500) NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  enabled       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_social_order (enabled, display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
