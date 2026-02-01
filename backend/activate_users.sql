-- Update all users to active status
UPDATE users SET status = 'ACTIVE' WHERE status IN ('active', 'inactive', 'INACTIVE');

-- Check result
SELECT id, full_name, email, status FROM users ORDER BY id;
