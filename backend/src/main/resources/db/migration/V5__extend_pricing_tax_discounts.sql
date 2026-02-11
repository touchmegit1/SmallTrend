-- V5: Extend pricing, tax, coupons, and promotions schema
-- This migration is additive and avoids breaking existing structures.

-- 1) Tax model: classes, zones, rules; link to products/variants; line tax breakdown
CREATE TABLE IF NOT EXISTS tax_classes (
    id           BIGINT AUTO_INCREMENT NOT NULL,
    code         VARCHAR(100)          NOT NULL,
    name         VARCHAR(255)          NOT NULL,
    description  VARCHAR(255)          NULL,
    CONSTRAINT pk_tax_classes PRIMARY KEY (id)
);

ALTER TABLE tax_classes
    ADD CONSTRAINT uc_tax_classes_code UNIQUE (code);

CREATE TABLE IF NOT EXISTS tax_zones (
    id               BIGINT AUTO_INCREMENT NOT NULL,
    name             VARCHAR(255)          NOT NULL,
    country_code     VARCHAR(2)            NULL,
    state_region     VARCHAR(100)          NULL,
    city             VARCHAR(100)          NULL,
    postal_code_from VARCHAR(20)           NULL,
    postal_code_to   VARCHAR(20)           NULL,
    is_active        BIT(1)                NULL,
    CONSTRAINT pk_tax_zones PRIMARY KEY (id)
);

-- Reuse existing tax_rates as rate definitions; add rules that map class + zone + rate
CREATE TABLE IF NOT EXISTS tax_rules (
    id            BIGINT AUTO_INCREMENT NOT NULL,
    zone_id       BIGINT                NOT NULL,
    class_id      BIGINT                NOT NULL,
    tax_rate_id   BIGINT                NOT NULL,
    priority      INT                   NULL,
    compound      BIT(1)                NULL,
    start_date    date                  NULL,
    end_date      date                  NULL,
    is_active     BIT(1)                NULL,
    CONSTRAINT pk_tax_rules PRIMARY KEY (id)
);

ALTER TABLE tax_rules
    ADD CONSTRAINT FK_TAX_RULES_ON_ZONE FOREIGN KEY (zone_id) REFERENCES tax_zones (id);

ALTER TABLE tax_rules
    ADD CONSTRAINT FK_TAX_RULES_ON_CLASS FOREIGN KEY (class_id) REFERENCES tax_classes (id);

ALTER TABLE tax_rules
    ADD CONSTRAINT FK_TAX_RULES_ON_RATE FOREIGN KEY (tax_rate_id) REFERENCES tax_rates (id);

-- Link products and variants to tax classes (nullable for backward compatibility)
ALTER TABLE products
    ADD tax_class_id BIGINT NULL;

ALTER TABLE products
    ADD CONSTRAINT FK_PRODUCTS_ON_TAX_CLASS FOREIGN KEY (tax_class_id) REFERENCES tax_classes (id);

ALTER TABLE products_variants 
    ADD tax_class_id BIGINT NULL;

ALTER TABLE products_variants
    ADD CONSTRAINT FK_PRODUCTS_VARIANTS_ON_TAX_CLASS FOREIGN KEY (tax_class_id) REFERENCES tax_classes (id);

-- Store tax breakdown at line level (snapshot name, rate, and computed amount)
CREATE TABLE IF NOT EXISTS order_item_taxes (
    id             BIGINT AUTO_INCREMENT NOT NULL,
    order_item_id  BIGINT                NOT NULL,
    tax_name       VARCHAR(255)          NOT NULL,
    tax_rate       DOUBLE                NOT NULL,
    tax_amount     DECIMAL               NULL,
    CONSTRAINT pk_order_item_taxes PRIMARY KEY (id)
);

ALTER TABLE order_item_taxes
    ADD CONSTRAINT FK_ORDER_ITEM_TAXES_ON_ITEM FOREIGN KEY (order_item_id) REFERENCES order_items (id);

-- 2) Coupons and discount tracking
CREATE TABLE IF NOT EXISTS coupons (
    id                      BIGINT AUTO_INCREMENT NOT NULL,
    code                    VARCHAR(100)          NOT NULL,
    type                    VARCHAR(50)           NOT NULL, -- PERCENT, FIXED, BXGY, FREE_SHIP
    value                   DECIMAL               NULL,     -- percent or amount depending on type
    max_uses                INT                   NULL,
    max_uses_per_customer   INT                   NULL,
    min_order_value         DECIMAL               NULL,
    start_date              date                  NULL,
    end_date                date                  NULL,
    is_active               BIT(1)                NULL,
    stackable               BIT(1)                NULL,
    applies_to              VARCHAR(20)           NULL,     -- ORDER or ITEM
    auto_apply              BIT(1)                NULL,
    created_at              datetime              NULL,
    CONSTRAINT pk_coupons PRIMARY KEY (id)
);

ALTER TABLE coupons
    ADD CONSTRAINT uc_coupons_code UNIQUE (code);

-- Coupon scopes (link coupons to product/category/brand/customer)
CREATE TABLE IF NOT EXISTS coupon_products (
    id         BIGINT AUTO_INCREMENT NOT NULL,
    coupon_id  BIGINT                NOT NULL,
    product_id BIGINT                NOT NULL,
    CONSTRAINT pk_coupon_products PRIMARY KEY (id)
);

ALTER TABLE coupon_products
    ADD CONSTRAINT FK_COUPON_PRODUCTS_ON_COUPON FOREIGN KEY (coupon_id) REFERENCES coupons (id);

ALTER TABLE coupon_products
    ADD CONSTRAINT FK_COUPON_PRODUCTS_ON_PRODUCT FOREIGN KEY (product_id) REFERENCES products (id);

CREATE TABLE IF NOT EXISTS coupon_categories (
    id           BIGINT AUTO_INCREMENT NOT NULL,
    coupon_id    BIGINT                NOT NULL,
    category_id  BIGINT                NOT NULL,
    CONSTRAINT pk_coupon_categories PRIMARY KEY (id)
);

ALTER TABLE coupon_categories
    ADD CONSTRAINT FK_COUPON_CATEGORIES_ON_COUPON FOREIGN KEY (coupon_id) REFERENCES coupons (id);

ALTER TABLE coupon_categories
    ADD CONSTRAINT FK_COUPON_CATEGORIES_ON_CATEGORY FOREIGN KEY (category_id) REFERENCES categories (id);

CREATE TABLE IF NOT EXISTS coupon_brands (
    id         BIGINT AUTO_INCREMENT NOT NULL,
    coupon_id  BIGINT                NOT NULL,
    brand_id   BIGINT                NOT NULL,
    CONSTRAINT pk_coupon_brands PRIMARY KEY (id)
);

ALTER TABLE coupon_brands
    ADD CONSTRAINT FK_COUPON_BRANDS_ON_COUPON FOREIGN KEY (coupon_id) REFERENCES coupons (id);

ALTER TABLE coupon_brands
    ADD CONSTRAINT FK_COUPON_BRANDS_ON_BRAND FOREIGN KEY (brand_id) REFERENCES brands (id);

CREATE TABLE IF NOT EXISTS coupon_customers (
    id           BIGINT AUTO_INCREMENT NOT NULL,
    coupon_id    BIGINT                NOT NULL,
    customer_id  BIGINT                NOT NULL,
    CONSTRAINT pk_coupon_customers PRIMARY KEY (id)
);

ALTER TABLE coupon_customers
    ADD CONSTRAINT FK_COUPON_CUSTOMERS_ON_COUPON FOREIGN KEY (coupon_id) REFERENCES coupons (id);

ALTER TABLE coupon_customers
    ADD CONSTRAINT FK_COUPON_CUSTOMERS_ON_CUSTOMER FOREIGN KEY (customer_id) REFERENCES customers (id);

-- Coupon redemption log
CREATE TABLE IF NOT EXISTS coupon_redemptions (
    id           BIGINT AUTO_INCREMENT NOT NULL,
    coupon_id    BIGINT                NOT NULL,
    order_id     BIGINT                NOT NULL,
    customer_id  BIGINT                NULL,
    redeemed_at  datetime              NULL,
    amount       DECIMAL               NULL,
    CONSTRAINT pk_coupon_redemptions PRIMARY KEY (id)
);

ALTER TABLE coupon_redemptions
    ADD CONSTRAINT FK_COUPON_REDEMPTIONS_ON_COUPON FOREIGN KEY (coupon_id) REFERENCES coupons (id);

ALTER TABLE coupon_redemptions
    ADD CONSTRAINT FK_COUPON_REDEMPTIONS_ON_ORDER FOREIGN KEY (order_id) REFERENCES sales_orders (id);

ALTER TABLE coupon_redemptions
    ADD CONSTRAINT FK_COUPON_REDEMPTIONS_ON_CUSTOMER FOREIGN KEY (customer_id) REFERENCES customers (id);

-- Detailed discount tracking at order and item level (for coupons/promotions)
CREATE TABLE IF NOT EXISTS order_discounts (
    id           BIGINT AUTO_INCREMENT NOT NULL,
    order_id     BIGINT                NOT NULL,
    source_type  VARCHAR(50)           NULL,   -- COUPON, PROMOTION, MANUAL
    source_id    BIGINT                NULL,   -- coupons.id or promotions.id, nullable for MANUAL
    description  VARCHAR(255)          NULL,
    amount       DECIMAL               NOT NULL,
    CONSTRAINT pk_order_discounts PRIMARY KEY (id)
);

ALTER TABLE order_discounts
    ADD CONSTRAINT FK_ORDER_DISCOUNTS_ON_ORDER FOREIGN KEY (order_id) REFERENCES sales_orders (id);

CREATE TABLE IF NOT EXISTS order_item_discounts (
    id            BIGINT AUTO_INCREMENT NOT NULL,
    order_item_id BIGINT                NOT NULL,
    source_type   VARCHAR(50)           NULL,
    source_id     BIGINT                NULL,
    description   VARCHAR(255)          NULL,
    amount        DECIMAL               NOT NULL,
    CONSTRAINT pk_order_item_discounts PRIMARY KEY (id)
);

ALTER TABLE order_item_discounts
    ADD CONSTRAINT FK_ORDER_ITEM_DISCOUNTS_ON_ITEM FOREIGN KEY (order_item_id) REFERENCES order_items (id);

-- 3) Sales / Catalog price rules (automatic promotions on catalog)
CREATE TABLE IF NOT EXISTS catalog_price_rules (
    id              BIGINT AUTO_INCREMENT NOT NULL,
    name            VARCHAR(255)          NOT NULL,
    description     VARCHAR(255)          NULL,
    discount_type   VARCHAR(20)           NOT NULL, -- PERCENT, FIXED, SET_PRICE
    discount_value  DECIMAL               NOT NULL,
    start_date      date                  NULL,
    end_date        date                  NULL,
    priority        INT                   NULL,
    apply_to_sale_items BIT(1)            NULL,
    stop_further_rules  BIT(1)            NULL,
    is_active       BIT(1)                NULL,
    created_at      datetime              NULL,
    CONSTRAINT pk_catalog_price_rules PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS catalog_rule_products (
    id       BIGINT AUTO_INCREMENT NOT NULL,
    rule_id  BIGINT                NOT NULL,
    product_id BIGINT              NOT NULL,
    CONSTRAINT pk_catalog_rule_products PRIMARY KEY (id)
);

ALTER TABLE catalog_rule_products
    ADD CONSTRAINT FK_CATALOG_RULE_PRODUCTS_ON_RULE FOREIGN KEY (rule_id) REFERENCES catalog_price_rules (id);

ALTER TABLE catalog_rule_products
    ADD CONSTRAINT FK_CATALOG_RULE_PRODUCTS_ON_PRODUCT FOREIGN KEY (product_id) REFERENCES products (id);

CREATE TABLE IF NOT EXISTS catalog_rule_categories (
    id         BIGINT AUTO_INCREMENT NOT NULL,
    rule_id    BIGINT                NOT NULL,
    category_id BIGINT               NOT NULL,
    CONSTRAINT pk_catalog_rule_categories PRIMARY KEY (id)
);

ALTER TABLE catalog_rule_categories
    ADD CONSTRAINT FK_CATALOG_RULE_CATEGORIES_ON_RULE FOREIGN KEY (rule_id) REFERENCES catalog_price_rules (id);

ALTER TABLE catalog_rule_categories
    ADD CONSTRAINT FK_CATALOG_RULE_CATEGORIES_ON_CATEGORY FOREIGN KEY (category_id) REFERENCES categories (id);

CREATE TABLE IF NOT EXISTS catalog_rule_brands (
    id       BIGINT AUTO_INCREMENT NOT NULL,
    rule_id  BIGINT                NOT NULL,
    brand_id BIGINT                NOT NULL,
    CONSTRAINT pk_catalog_rule_brands PRIMARY KEY (id)
);

ALTER TABLE catalog_rule_brands
    ADD CONSTRAINT FK_CATALOG_RULE_BRANDS_ON_RULE FOREIGN KEY (rule_id) REFERENCES catalog_price_rules (id);

ALTER TABLE catalog_rule_brands
    ADD CONSTRAINT FK_CATALOG_RULE_BRANDS_ON_BRAND FOREIGN KEY (brand_id) REFERENCES brands (id);

-- 4) Enhance orders: store subtotal/tax/shipping and coupon snapshot
ALTER TABLE sales_orders
    ADD subtotal_amount DECIMAL NULL;

ALTER TABLE sales_orders
    ADD tax_amount DECIMAL NULL;

ALTER TABLE sales_orders
    ADD shipping_amount DECIMAL NULL;

ALTER TABLE sales_orders
    ADD coupon_code VARCHAR(100) NULL;

ALTER TABLE sales_orders
    ADD coupon_discount DECIMAL NULL;

-- 5) Optional: link order_items to variants (nullable, to avoid breaking current flows)
ALTER TABLE order_items
    ADD product_variant_id BIGINT NULL;

ALTER TABLE order_items
    ADD CONSTRAINT FK_ORDER_ITEMS_ON_PRODUCT_VARIANT FOREIGN KEY (product_variant_id) REFERENCES products_variants (id);
