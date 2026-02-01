-- Disable safe update mode
SET SQL_SAFE_UPDATES = 0;

-- Fix status case from ACTIVE/INACTIVE to active/inactive
UPDATE users SET status = 'active' WHERE status = 'ACTIVE';
UPDATE users SET status = 'inactive' WHERE status = 'INACTIVE';
UPDATE users SET status = 'pending' WHERE status = 'PENDING';

-- Re-enable safe update mode
SET SQL_SAFE_UPDATES = 1;

-- Verify the result
SELECT id, full_name, email, status FROM users ORDER BY id;
