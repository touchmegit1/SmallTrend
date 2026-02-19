-- Sample audit log data for testing the Audit Log Page
-- This creates realistic audit log entries with various actions, results, and metadata

-- Insert sample audit logs
INSERT INTO audit_logs (user_id, action, entity_name, entity_id, changes, created_at, result, ip_address, trace_id, source, details) VALUES
-- Login attempts
(1, 'LOGIN', 'User', 1, '{"method": "password"}', NOW() - INTERVAL 1 HOUR, 'OK', '192.168.1.100', 'trace-001', 'WEB', 'Successful login'),
(2, 'LOGIN', 'User', 2, '{"method": "password"}', NOW() - INTERVAL 2 HOUR, 'FAIL', '192.168.1.101', 'trace-002', 'WEB', 'Invalid password'),
(3, 'LOGIN', 'User', 3, '{"method": "password"}', NOW() - INTERVAL 3 HOUR, 'OK', '10.0.0.50', 'trace-003', 'MOBILE', 'Successful login from mobile'),

-- Profile updates
(1, 'UPDATE_PROFILE', 'User', 1, '{"field": "email", "old": "old@example.com", "new": "new@example.com"}', NOW() - INTERVAL 30 MINUTE, 'OK', '192.168.1.100', 'trace-004', 'WEB', 'Email updated'),
(2, 'UPDATE_PROFILE', 'User', 2, '{"field": "phone", "old": "+1234567890", "new": "+0987654321"}', NOW() - INTERVAL 45 MINUTE, 'OK', '192.168.1.101', 'trace-005', 'WEB', 'Phone number updated'),

-- Role changes
(1, 'GRANT_ROLE', 'Role', 2, '{"role": "MANAGER", "user": 3}', NOW() - INTERVAL 1 DAY, 'OK', '192.168.1.100', 'trace-006', 'WEB', 'Granted MANAGER role to user 3'),
(1, 'REVOKE_ROLE', 'Role', 1, '{"role": "ADMIN", "user": 5}', NOW() - INTERVAL 2 DAY, 'DENIED', '192.168.1.100', 'trace-007', 'WEB', 'Insufficient permissions'),

-- Delete operations
(1, 'DELETE', 'Product', 123, '{"name": "Old Product", "sku": "PROD-123"}', NOW() - INTERVAL 5 HOUR, 'OK', '192.168.1.100', 'trace-008', 'WEB', 'Product deleted'),
(2, 'DELETE', 'Customer', 456, '{"name": "Test Customer"}', NOW() - INTERVAL 6 HOUR, 'FAIL', '192.168.1.101', 'trace-009', 'WEB', 'Customer has active orders'),

-- Create operations
(1, 'CREATE', 'Product', 124, '{"name": "New Product", "sku": "PROD-124", "price": 99.99}', NOW() - INTERVAL 15 MINUTE, 'OK', '192.168.1.100', 'trace-010', 'WEB', 'New product created'),
(2, 'CREATE', 'Customer', 457, '{"name": "John Doe", "email": "john@example.com"}', NOW() - INTERVAL 20 MINUTE, 'OK', '192.168.1.101', 'trace-011', 'WEB', 'New customer created'),

-- Update operations
(1, 'UPDATE', 'Product', 124, '{"field": "price", "old": 99.99, "new": 89.99}', NOW() - INTERVAL 10 MINUTE, 'OK', '192.168.1.100', 'trace-012', 'WEB', 'Product price updated'),
(3, 'UPDATE', 'Inventory', 50, '{"field": "quantity", "old": 100, "new": 95}', NOW() - INTERVAL 25 MINUTE, 'OK', '10.0.0.50', 'trace-013', 'MOBILE', 'Inventory adjusted'),

-- Logout
(1, 'LOGOUT', 'User', 1, '{}', NOW() - INTERVAL 5 MINUTE, 'OK', '192.168.1.100', 'trace-014', 'WEB', 'User logged out'),
(2, 'LOGOUT', 'User', 2, '{}', NOW() - INTERVAL 8 MINUTE, 'OK', '192.168.1.101', 'trace-015', 'WEB', 'User logged out'),

-- Failed access attempts
(NULL, 'LOGIN', 'User', NULL, '{"username": "hacker"}', NOW() - INTERVAL 4 HOUR, 'DENIED', '203.0.113.45', 'trace-016', 'WEB', 'Blocked suspicious IP'),
(NULL, 'LOGIN', 'User', NULL, '{"username": "admin"}', NOW() - INTERVAL 5 HOUR, 'FAIL', '203.0.113.46', 'trace-017', 'WEB', 'Brute force attempt'),

-- System operations
(1, 'UPDATE', 'SystemConfig', 1, '{"setting": "max_login_attempts", "old": 3, "new": 5}', NOW() - INTERVAL 3 DAY, 'OK', '192.168.1.100', 'trace-018', 'WEB', 'System configuration updated'),
(1, 'CREATE', 'Report', 10, '{"type": "sales", "period": "monthly"}', NOW() - INTERVAL 1 HOUR, 'OK', '192.168.1.100', 'trace-019', 'WEB', 'Monthly sales report generated'),

-- API operations
(2, 'CREATE', 'Order', 1001, '{"total": 299.99, "items": 3}', NOW() - INTERVAL 35 MINUTE, 'OK', '10.0.0.100', 'trace-020', 'API', 'Order created via API');
