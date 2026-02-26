ALTER TABLE products
  ADD COLUMN is_active TINYINT(1) DEFAULT 1,
  ADD COLUMN created_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
  ADD COLUMN updated_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6);

UPDATE products
SET is_active = 1,
    created_at = NOW(6),
    updated_at = NOW(6)
WHERE is_active IS NULL
   OR created_at IS NULL
   OR updated_at IS NULL;
