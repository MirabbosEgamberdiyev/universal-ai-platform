-- V4: Publication Timezone and Media Library Support

-- 1. Add timezone tracking to publication_jobs for daylight saving & regional scheduling
ALTER TABLE publication_jobs ADD COLUMN IF NOT EXISTS source_timezone VARCHAR(50) DEFAULT 'UTC';

-- 2. Allow standalone media assets in media library (not tied to content initially)
ALTER TABLE content_assets ALTER COLUMN content_id DROP NOT NULL;

-- 3. Add original filename and file URL for media library
ALTER TABLE content_assets ADD COLUMN IF NOT EXISTS original_filename VARCHAR(255);
ALTER TABLE content_assets ADD COLUMN IF NOT EXISTS file_url TEXT;
ALTER TABLE content_assets ADD COLUMN IF NOT EXISTS tags TEXT;

-- 4. Indexes for fast retrieval
CREATE INDEX IF NOT EXISTS idx_content_assets_org ON content_assets(organization_id);
CREATE INDEX IF NOT EXISTS idx_content_assets_type ON content_assets(asset_type);
CREATE INDEX IF NOT EXISTS idx_publication_jobs_tz ON publication_jobs(source_timezone);
