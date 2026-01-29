-- =============================================================================
-- V4__cleanup_and_reset.sql  
-- Reset AUTO_INCREMENT counters to avoid conflicts with sample data
-- =============================================================================

-- Reset AUTO_INCREMENT for all tables to start from next available ID
ALTER TABLE brands AUTO_INCREMENT = 6;
ALTER TABLE categories AUTO_INCREMENT = 6;
ALTER TABLE suppliers AUTO_INCREMENT = 6;
ALTER TABLE roles AUTO_INCREMENT = 6;
ALTER TABLE permissions AUTO_INCREMENT = 10;
ALTER TABLE locations AUTO_INCREMENT = 6;
ALTER TABLE shelf_bins AUTO_INCREMENT = 6;
ALTER TABLE tax_rates AUTO_INCREMENT = 6;
ALTER TABLE shifts AUTO_INCREMENT = 6;

-- Sample data tables
ALTER TABLE users AUTO_INCREMENT = 6;
ALTER TABLE user_credentials AUTO_INCREMENT = 6;
ALTER TABLE customers AUTO_INCREMENT = 6;
ALTER TABLE products AUTO_INCREMENT = 6;
ALTER TABLE product_variants AUTO_INCREMENT = 6;
ALTER TABLE product_batches AUTO_INCREMENT = 6;
ALTER TABLE inventory_stock AUTO_INCREMENT = 6;
ALTER TABLE purchase_orders AUTO_INCREMENT = 6;
ALTER TABLE purchase_order_items AUTO_INCREMENT = 6;
ALTER TABLE sales_orders AUTO_INCREMENT = 6;
ALTER TABLE sales_order_items AUTO_INCREMENT = 6;
ALTER TABLE loyalty_history AUTO_INCREMENT = 6;
ALTER TABLE price_history AUTO_INCREMENT = 6;
ALTER TABLE shift_assignments AUTO_INCREMENT = 6;
ALTER TABLE attendance AUTO_INCREMENT = 6;
ALTER TABLE salary_config AUTO_INCREMENT = 6;
ALTER TABLE salary_payout AUTO_INCREMENT = 6;
ALTER TABLE stock_movements AUTO_INCREMENT = 6;
ALTER TABLE reports AUTO_INCREMENT = 6;
ALTER TABLE audit_logs AUTO_INCREMENT = 6;