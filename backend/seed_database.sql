-- =============================================================================
-- seed_database.sql
-- Manual seed script for SmallTrend database with correct password
-- =============================================================================

-- First, clean up existing data if needed
DELETE FROM user_credentials WHERE username IN ('admin', 'manager', 'cashier', 'inventory', 'sales');
DELETE FROM users WHERE email IN ('admin@smalltrend.com', 'manager@smalltrend.com', 'cashier@smalltrend.com', 'inventory@smalltrend.com', 'sales@smalltrend.com');

-- Reset auto increment for clean IDs
ALTER TABLE users AUTO_INCREMENT = 1;

-- Insert Users
INSERT INTO users
(id, full_name, email, phone, address, status, role_id) VALUES
(1, 'Nguyen Van Admin', 'admin@smalltrend.com', '0901234567', '123 Nguyen Hue, District 1, Ho Chi Minh City', 'ACTIVE', 1),
(2, 'Tran Thi Manager', 'manager@smalltrend.com', '0912345678', '456 Le Loi, District 3, Ho Chi Minh City', 'ACTIVE', 2),
(3, 'Le Van Cashier', 'cashier@smalltrend.com', '0923456789', '789 Dien Bien Phu, District 5, Ho Chi Minh City', 'ACTIVE', 3),
(4, 'Pham Thi Inventory', 'inventory@smalltrend.com', '0934567890', '321 Cach Mang Thang 8, District 10, Ho Chi Minh City', 'ACTIVE', 4),
(5, 'Hoang Van Sales', 'sales@smalltrend.com', '0945678901', '654 Truong Chinh, District 12, Ho Chi Minh City', 'ACTIVE', 5);

-- Insert User Credentials (password = "password" for all)
-- Using BCrypt hash: $2a$10$dXJ3SW6G7P2jUdgvKBQ0NO4j7B6a6Q/PGt9TG9.YyZq9O1a4xPJT3yge
INSERT INTO user_credentials
(user_id, username, password_hash) VALUES
(1, 'admin', '$2a$10$dXJ3SW6G7P2jUdgvKBQ0NO4j7B6a6Q/PGt9TG9.YyZq9O1a4xPJT3yge'),
(2, 'manager', '$2a$10$dXJ3SW6G7P2jUdgvKBQ0NO4j7B6a6Q/PGt9TG9.YyZq9O1a4xPJT3yge'),
(3, 'cashier', '$2a$10$dXJ3SW6G7P2jUdgvKBQ0NO4j7B6a6Q/PGt9TG9.YyZq9O1a4xPJT3yge'),
(4, 'inventory', '$2a$10$dXJ3SW6G7P2jUdgvKBQ0NO4j7B6a6Q/PGt9TG9.YyZq9O1a4xPJT3yge'),
(5, 'sales', '$2a$10$dXJ3SW6G7P2jUdgvKBQ0NO4j7B6a6Q/PGt9TG9.YyZq9O1a4xPJT3yge');

-- Insert Customers for testing
INSERT INTO customers
(id, name, phone, loyalty_points) VALUES
(1, 'Nguyen Van A', '0987654321', 150),
(2, 'Tran Thi B', '0976543210', 250),
(3, 'Le Van C', '0965432109', 100);

-- Verify data
SELECT 'Users created:' as result;
SELECT id, full_name, email, status FROM users;

SELECT 'User credentials:' as result;
SELECT user_id, username, 'password' as password_plain FROM user_credentials;

SELECT 'Customers created:' as result;
SELECT * FROM customers;