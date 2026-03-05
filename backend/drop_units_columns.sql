-- Xóa 2 cột default_cost_price và default_sell_price từ bảng units
ALTER TABLE units DROP COLUMN default_cost_price;
ALTER TABLE units DROP COLUMN default_sell_price;
