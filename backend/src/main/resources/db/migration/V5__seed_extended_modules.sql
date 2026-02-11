-- Seed data for extended modules: bulk pricing, combos, tickets, audit logs, AI insights
-- NOTE: This migration inserts only into tables that do not require existing FK rows
-- (BulkPricingRule with global scope, ComboDeal without items, Tickets without user FKs, etc.)
-- Ensure tables exist (first run JPA schema update) before enabling Flyway to run this.

-- Bulk Pricing Rules (global scope, no product/category/brand FK references)
INSERT INTO bulk_pricing_rules (name, min_qty, discount_type, discount_value, start_at, end_at, active, priority)
VALUES ('Buy >=5 get 10% off', 5, 'PERCENT', 10.00, NOW(), DATE_ADD(NOW(), INTERVAL 90 DAY), TRUE, 100);

INSERT INTO bulk_pricing_rules (name, min_qty, discount_type, discount_value, start_at, end_at, active, priority)
VALUES ('Buy >=10 get 25,000 off', 10, 'AMOUNT', 25000.00, NOW(), DATE_ADD(NOW(), INTERVAL 90 DAY), TRUE, 90);

-- Combo Deals (created without items to avoid FK dependencies)
INSERT INTO combo_deals (name, discount_type, discount_value, start_at, end_at, active, priority)
VALUES ('Combo Starter Pack', 'AMOUNT', 20000.00, NOW(), DATE_ADD(NOW(), INTERVAL 60 DAY), TRUE, 100);

INSERT INTO combo_deals (name, discount_type, discount_value, start_at, end_at, active, priority)
VALUES ('Combo Duo', 'PERCENT', 15.00, NOW(), DATE_ADD(NOW(), INTERVAL 60 DAY), TRUE, 95);

-- Tickets (no user FK, generic related entity fields)
INSERT INTO tickets (type, status, title, description, related_entity_type, related_entity_id, created_at, updated_at)
VALUES ('SHIFT_CHANGE', 'OPEN', 'Đổi ca ca tối', 'Yêu cầu đổi ca 19:00-23:00', 'Shift', NULL, NOW(), NOW());

INSERT INTO tickets (type, status, title, description, related_entity_type, related_entity_id, created_at, updated_at)
VALUES ('ISSUE', 'IN_PROGRESS', 'Sự cố máy POS', 'Máy POS số 2 không in hoá đơn', 'Device', NULL, NOW(), NOW());

INSERT INTO tickets (type, status, title, description, related_entity_type, related_entity_id, created_at, updated_at)
VALUES ('AI_SUGGESTION', 'OPEN', 'Gợi ý tối ưu tồn kho', 'AI gợi ý giảm đặt hàng cho SKU X', 'Inventory', NULL, NOW(), NOW());

-- Audit Logs (simple actions referencing ticket ids inserted above)
INSERT INTO audit_logs (entity_type, entity_id, action, details, created_at)
VALUES ('Ticket', 1, 'CREATE', 'Tạo ticket đổi ca', NOW());

INSERT INTO audit_logs (entity_type, entity_id, action, details, created_at)
VALUES ('Ticket', 2, 'UPDATE', 'Chuyển trạng thái IN_PROGRESS', NOW());

-- AI Insights (link to a ticket for demonstration)
INSERT INTO ai_insights (target_entity_type, target_entity_id, category, score, content, created_at)
VALUES ('Ticket', 2, 'Maintenance', 0.85, 'Đề xuất phân công kỹ thuật viên A vì tần suất xử lý nhanh ở thiết bị POS.', NOW());
