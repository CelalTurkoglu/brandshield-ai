CREATE TABLE IF NOT EXISTS brandshield_users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  open_id VARCHAR(191) NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(320) NOT NULL,
  password_hash VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_brandshield_users_open_id (open_id),
  KEY idx_brandshield_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE brandshield_users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255) NULL;
ALTER TABLE brandshield_users ADD UNIQUE KEY uq_brandshield_users_email (email);

CREATE TABLE IF NOT EXISTS brandshield_businesses (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  owner_open_id VARCHAR(191) NOT NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(191) NOT NULL,
  maps_url TEXT NULL,
  sikayetvar_url TEXT NULL,
  instagram_url TEXT NULL,
  website_url TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_brandshield_business_owner_slug (owner_open_id, slug),
  KEY idx_brandshield_business_owner (owner_open_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS brandshield_reviews (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  business_id BIGINT UNSIGNED NOT NULL,
  external_id VARCHAR(191) NOT NULL,
  author VARCHAR(255) NOT NULL,
  rating TINYINT UNSIGNED NOT NULL,
  review_text TEXT NOT NULL,
  review_date VARCHAR(255) NOT NULL,
  source VARCHAR(64) NOT NULL,
  sentiment VARCHAR(32) NULL,
  category VARCHAR(32) NULL,
  topics JSON NULL,
  imported_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_brandshield_review_external (business_id, external_id),
  KEY idx_brandshield_review_business_date (business_id, imported_at),
  CONSTRAINT fk_brandshield_review_business FOREIGN KEY (business_id) REFERENCES brandshield_businesses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
