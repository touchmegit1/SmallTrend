-- Insert Admin User directly
-- Password is BCrypt hash of "password"

-- Insert admin user
INSERT IGNORE INTO users (username, full_name, email, phone, address, status, created_at, updated_at) 
VALUES ('admin', 'System Administrator', 'admin@smalltrend.com', '0901234567', 'HCM City', 'active', NOW(), NOW());

-- Get user id (assuming it's 1)
INSERT IGNORE INTO user_credentials (user_id, password_hash) 
VALUES (1, '$2a$10$N.zmdr7EdSLiPpbvOYBf4e4g8ZCPX0LiPeQ3pVLjnOWUxiHPVfgOW');

-- Assign admin role
INSERT IGNORE INTO user_roles (user_id, role_id) 
VALUES (1, 1);

-- Insert a few more sample users
INSERT IGNORE INTO users (username, full_name, email, phone, address, status, created_at, updated_at) 
VALUES 
('manager1', 'Nguyen Van Manager', 'manager@smalltrend.com', '0902345678', 'HCM City', 'active', NOW(), NOW()),
('cashier1', 'Tran Thi Cashier', 'cashier@smalltrend.com', '0903456789', 'HCM City', 'active', NOW(), NOW());

-- Passwords for all: "password"
INSERT IGNORE INTO user_credentials (user_id, password_hash) 
VALUES 
(2, '$2a$10$N.zmdr7EdSLiPpbvOYBf4e4g8ZCPX0LiPeQ3pVLjnOWUxiHPVfgOW'),
(3, '$2a$10$N.zmdr7EdSLiPpbvOYBf4e4g8ZCPX0LiPeQ3pVLjnOWUxiHPVfgOW');

-- Assign roles
INSERT IGNORE INTO user_roles (user_id, role_id) 
VALUES 
(2, 2),
(3, 3);
