-- Migration to add token management columns to user_credentials table
-- Version: V2
-- Description: Add access token, refresh token, and session tracking fields

ALTER TABLE user_credentials 
ADD COLUMN access_token VARCHAR
(500),
ADD COLUMN refresh_token VARCHAR
(500),
ADD COLUMN token_issued_at TIMESTAMP,
ADD COLUMN token_expires_at TIMESTAMP,
ADD COLUMN refresh_token_expires_at TIMESTAMP,
ADD COLUMN last_login TIMESTAMP,
ADD COLUMN last_ip_address VARCHAR
(45),
ADD COLUMN device_info VARCHAR
(255),
ADD COLUMN is_active BOOLEAN DEFAULT TRUE;

-- Create indexes for better query performance
CREATE INDEX idx_user_credentials_access_token ON user_credentials(access_token);
CREATE INDEX idx_user_credentials_refresh_token ON user_credentials(refresh_token);
CREATE INDEX idx_user_credentials_username ON user_credentials(username);
CREATE INDEX idx_user_credentials_is_active ON user_credentials(is_active);
