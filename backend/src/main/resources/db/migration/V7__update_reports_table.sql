-- Update reports table to support async report generation
ALTER TABLE reports ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'PENDING';
ALTER TABLE reports ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP NULL;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS file_path VARCHAR(500) NULL;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS report_name VARCHAR(255) NULL;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS format VARCHAR(20) DEFAULT 'PDF';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created_by ON reports(created_by);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at);
