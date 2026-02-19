-- Migration to update audit_logs table with additional fields
-- This migration adds new columns for comprehensive audit logging

-- Add new columns if they don't exist
ALTER TABLE audit_logs
    ADD COLUMN IF NOT EXISTS result VARCHAR(20) COMMENT 'Result status: OK, FAIL, DENIED',
    ADD COLUMN IF NOT EXISTS ip_address VARCHAR(45) COMMENT 'IP address of the actor',
    ADD COLUMN IF NOT EXISTS trace_id VARCHAR(100) COMMENT 'Correlation/Trace ID for request tracking',
    ADD COLUMN IF NOT EXISTS source VARCHAR(50) COMMENT 'Source of the action: WEB, API, MOBILE, SYSTEM',
    ADD COLUMN IF NOT EXISTS changes TEXT COMMENT 'Detailed changes in JSON or text format';

-- Rename timestamp column to created_at if it exists
ALTER TABLE audit_logs
    CHANGE COLUMN IF EXISTS timestamp created_at DATETIME COMMENT 'Timestamp when the audit log was created';

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_result ON audit_logs(result);
CREATE INDEX IF NOT EXISTS idx_audit_logs_ip_address ON audit_logs(ip_address);
CREATE INDEX IF NOT EXISTS idx_audit_logs_trace_id ON audit_logs(trace_id);

-- Add composite index for common query patterns
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_action_date ON audit_logs(user_id, action, created_at);
