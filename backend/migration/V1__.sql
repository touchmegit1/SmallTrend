CREATE TABLE attendance
(
    id             BIGINT AUTO_INCREMENT NOT NULL,
    user_id        BIGINT                NOT NULL,
    shift_id       BIGINT                NULL,
    check_in_time  datetime              NULL,
    check_out_time datetime              NULL,
    note           VARCHAR(255)          NULL,
    CONSTRAINT pk_attendance PRIMARY KEY (id)
);

CREATE TABLE audit_logs
(
    id           BIGINT AUTO_INCREMENT NOT NULL,
    action       VARCHAR(255)          NOT NULL,
    entity_name  VARCHAR(255)          NULL,
    entity_id    VARCHAR(255)          NULL,
    details      VARCHAR(1000)         NULL,
    performed_by VARCHAR(255)          NULL,
    performed_at datetime              NULL,
    CONSTRAINT pk_audit_logs PRIMARY KEY (id)
);

CREATE TABLE brands
(
    id            BIGINT AUTO_INCREMENT NOT NULL,
    name          VARCHAR(255)          NOT NULL,
    `description` VARCHAR(255)          NULL,
    logo_url      VARCHAR(255)          NULL,
    created_at    datetime              NULL,
    CONSTRAINT pk_brands PRIMARY KEY (id)
);

CREATE TABLE categories
(
    id            BIGINT AUTO_INCREMENT NOT NULL,
    name          VARCHAR(255)          NOT NULL,
    `description` VARCHAR(255)          NULL,
    created_at    datetime              NULL,
    CONSTRAINT pk_categories PRIMARY KEY (id)
);

CREATE TABLE customers
(
    id             BIGINT AUTO_INCREMENT NOT NULL,
    name           VARCHAR(255)          NOT NULL,
    phone          VARCHAR(255)          NULL,
    email          VARCHAR(255)          NULL,
    address        VARCHAR(255)          NULL,
    loyalty_points INT                   NULL,
    created_at     datetime              NULL,
    CONSTRAINT pk_customers PRIMARY KEY (id)
);

CREATE TABLE inventory_stock
(
    id         BIGINT AUTO_INCREMENT NOT NULL,
    variant_id BIGINT                NOT NULL,
    bin_id     BIGINT                NULL,
    batch_id   BIGINT                NULL,
    quantity   INT                   NOT NULL,
    CONSTRAINT pk_inventory_stock PRIMARY KEY (id)
);

CREATE TABLE locations
(
    id   BIGINT AUTO_INCREMENT NOT NULL,
    name VARCHAR(255)          NOT NULL,
    type VARCHAR(255)          NULL,
    CONSTRAINT pk_locations PRIMARY KEY (id)
);

CREATE TABLE loyalty_history
(
    id            BIGINT AUTO_INCREMENT NOT NULL,
    customer_id   BIGINT                NOT NULL,
    order_id      BIGINT                NULL,
    points_earned INT                   NULL,
    points_used   INT                   NULL,
    created_at    datetime              NULL,
    CONSTRAINT pk_loyalty_history PRIMARY KEY (id)
);

CREATE TABLE order_items
(
    id          BIGINT AUTO_INCREMENT NOT NULL,
    order_id    BIGINT                NOT NULL,
    product_id  BIGINT                NOT NULL,
    quantity    INT                   NOT NULL,
    unit_price  DECIMAL               NULL,
    total_price DECIMAL               NULL,
    CONSTRAINT pk_order_items PRIMARY KEY (id)
);

CREATE TABLE permissions
(
    id            BIGINT AUTO_INCREMENT NOT NULL,
    name          VARCHAR(100)          NOT NULL,
    `description` VARCHAR(255)          NULL,
    CONSTRAINT pk_permissions PRIMARY KEY (id)
);

CREATE TABLE price_history
(
    id         BIGINT AUTO_INCREMENT NOT NULL,
    variant_id BIGINT                NOT NULL,
    old_price  DECIMAL               NULL,
    new_price  DECIMAL               NULL,
    changed_by BIGINT                NULL,
    applied_at datetime              NULL,
    CONSTRAINT pk_price_history PRIMARY KEY (id)
);

CREATE TABLE product_batches
(
    id            BIGINT AUTO_INCREMENT NOT NULL,
    batch_code    VARCHAR(255)          NOT NULL,
    product_id    BIGINT                NOT NULL,
    quantity      INT                   NOT NULL,
    expiry_date   date                  NULL,
    received_date date                  NULL,
    created_at    datetime              NULL,
    CONSTRAINT pk_product_batches PRIMARY KEY (id)
);

CREATE TABLE products
(
    id              BIGINT AUTO_INCREMENT NOT NULL,
    sku             VARCHAR(255)          NOT NULL,
    name            VARCHAR(255)          NOT NULL,
    `description`   VARCHAR(255)          NULL,
    purchase_price  DECIMAL               NULL,
    retail_price    DECIMAL               NULL,
    wholesale_price DECIMAL               NULL,
    stock_quantity  INT                   NOT NULL,
    unit            VARCHAR(255)          NULL,
    image_url       VARCHAR(255)          NULL,
    is_active       BIT(1)                NULL,
    category_id     BIGINT                NULL,
    brand_id        BIGINT                NULL,
    created_at      datetime              NULL,
    updated_at      datetime              NULL,
    CONSTRAINT pk_products PRIMARY KEY (id)
);

CREATE TABLE products_variants
(
    id         BIGINT AUTO_INCREMENT NOT NULL,
    product_id BIGINT                NOT NULL,
    sku        VARCHAR(255)          NOT NULL,
    barcode    VARCHAR(255)          NULL,
    sell_price DECIMAL               NULL,
    cost_price DECIMAL               NULL,
    is_active  BIT(1)                NULL,
    size       VARCHAR(255)          NULL,
    color      VARCHAR(255)          NULL,
    CONSTRAINT pk_products_variants PRIMARY KEY (id)
);

CREATE TABLE promotion_conditions
(
    id               BIGINT AUTO_INCREMENT NOT NULL,
    promotion_id     BIGINT                NOT NULL,
    min_order_value  DECIMAL               NULL,
    discount_percent DOUBLE                NULL,
    CONSTRAINT pk_promotion_conditions PRIMARY KEY (id)
);

CREATE TABLE promotions
(
    id               BIGINT AUTO_INCREMENT NOT NULL,
    name             VARCHAR(255)          NOT NULL,
    `description`    VARCHAR(255)          NULL,
    start_date       date                  NULL,
    end_date         date                  NULL,
    discount_percent DOUBLE                NULL,
    discount_amount  DECIMAL               NULL,
    is_active        BIT(1)                NULL,
    created_at       datetime              NULL,
    CONSTRAINT pk_promotions PRIMARY KEY (id)
);

CREATE TABLE purchase_order_items
(
    id                BIGINT AUTO_INCREMENT NOT NULL,
    purchase_order_id BIGINT                NOT NULL,
    product_id        BIGINT                NOT NULL,
    quantity          INT                   NOT NULL,
    unit_cost         DECIMAL               NULL,
    total_cost        DECIMAL               NULL,
    CONSTRAINT pk_purchase_order_items PRIMARY KEY (id)
);

CREATE TABLE purchase_orders
(
    id           BIGINT AUTO_INCREMENT NOT NULL,
    po_number    VARCHAR(255)          NOT NULL,
    supplier_id  BIGINT                NULL,
    creator_id   BIGINT                NULL,
    total_amount DECIMAL               NULL,
    status       VARCHAR(255)          NULL,
    created_at   datetime              NULL,
    CONSTRAINT pk_purchase_orders PRIMARY KEY (id)
);

CREATE TABLE reports
(
    id          BIGINT AUTO_INCREMENT NOT NULL,
    type        VARCHAR(255)          NOT NULL,
    report_date date                  NULL,
    data        TEXT                  NULL,
    created_by  BIGINT                NULL,
    CONSTRAINT pk_reports PRIMARY KEY (id)
);

CREATE TABLE role_permissions
(
    id            BIGINT AUTO_INCREMENT NOT NULL,
    role_id       BIGINT                NOT NULL,
    permission_id BIGINT                NOT NULL,
    CONSTRAINT pk_role_permissions PRIMARY KEY (id)
);

CREATE TABLE roles
(
    id            BIGINT AUTO_INCREMENT NOT NULL,
    name          VARCHAR(50)           NOT NULL,
    `description` VARCHAR(255)          NULL,
    CONSTRAINT pk_roles PRIMARY KEY (id)
);

CREATE TABLE salary_configs
(
    id          BIGINT AUTO_INCREMENT NOT NULL,
    role_id     BIGINT                NULL,
    base_salary DECIMAL               NULL,
    hourly_rate DECIMAL               NULL,
    CONSTRAINT pk_salary_configs PRIMARY KEY (id)
);

CREATE TABLE salary_payouts
(
    id           BIGINT AUTO_INCREMENT NOT NULL,
    user_id      BIGINT                NOT NULL,
    config_id    BIGINT                NULL,
    month        INT                   NOT NULL,
    year         INT                   NOT NULL,
    total_payout DECIMAL               NULL,
    payment_date date                  NULL,
    CONSTRAINT pk_salary_payouts PRIMARY KEY (id)
);

CREATE TABLE sales_orders
(
    id              BIGINT AUTO_INCREMENT NOT NULL,
    order_number    VARCHAR(255)          NOT NULL,
    customer_id     BIGINT                NULL,
    user_id         BIGINT                NULL,
    total_amount    DECIMAL               NULL,
    discount_amount DECIMAL               NULL,
    final_amount    DECIMAL               NULL,
    payment_method  VARCHAR(255)          NULL,
    status          VARCHAR(255)          NULL,
    created_at      datetime              NULL,
    CONSTRAINT pk_sales_orders PRIMARY KEY (id)
);

CREATE TABLE shelves_bins
(
    id          BIGINT AUTO_INCREMENT NOT NULL,
    location_id BIGINT                NOT NULL,
    bin_code    VARCHAR(255)          NOT NULL,
    CONSTRAINT pk_shelves_bins PRIMARY KEY (id)
);

CREATE TABLE shift_assignments
(
    id            BIGINT AUTO_INCREMENT NOT NULL,
    user_id       BIGINT                NOT NULL,
    shift_id      BIGINT                NOT NULL,
    assigned_date date                  NULL,
    status        VARCHAR(255)          NULL,
    CONSTRAINT pk_shift_assignments PRIMARY KEY (id)
);

CREATE TABLE shifts
(
    id            BIGINT AUTO_INCREMENT NOT NULL,
    name          VARCHAR(255)          NOT NULL,
    start_time    time                  NULL,
    end_time      time                  NULL,
    `description` VARCHAR(255)          NULL,
    CONSTRAINT pk_shifts PRIMARY KEY (id)
);

CREATE TABLE stock_movements
(
    id          BIGINT AUTO_INCREMENT NOT NULL,
    variant_id  BIGINT                NOT NULL,
    from_bin_id BIGINT                NULL,
    to_bin_id   BIGINT                NULL,
    quantity    INT                   NOT NULL,
    type        VARCHAR(255)          NULL,
    created_at  datetime              NULL,
    CONSTRAINT pk_stock_movements PRIMARY KEY (id)
);

CREATE TABLE suppliers
(
    id             BIGINT AUTO_INCREMENT NOT NULL,
    name           VARCHAR(255)          NOT NULL,
    contact_person VARCHAR(255)          NULL,
    phone          VARCHAR(255)          NULL,
    email          VARCHAR(255)          NULL,
    address        VARCHAR(255)          NULL,
    created_at     datetime              NULL,
    CONSTRAINT pk_suppliers PRIMARY KEY (id)
);

CREATE TABLE tax_rates
(
    id        BIGINT AUTO_INCREMENT NOT NULL,
    name      VARCHAR(255)          NOT NULL,
    rate      DOUBLE                NOT NULL,
    is_active BIT(1)                NULL,
    CONSTRAINT pk_tax_rates PRIMARY KEY (id)
);

CREATE TABLE user_credentials
(
    id            BIGINT AUTO_INCREMENT NOT NULL,
    user_id       BIGINT                NOT NULL,
    username      VARCHAR(255)          NOT NULL,
    password_hash VARCHAR(255)          NOT NULL,
    CONSTRAINT pk_user_credentials PRIMARY KEY (id)
);

CREATE TABLE user_roles
(
    role_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    CONSTRAINT pk_user_roles PRIMARY KEY (role_id, user_id)
);

CREATE TABLE users
(
    id         BIGINT AUTO_INCREMENT NOT NULL,
    username   VARCHAR(50)           NOT NULL,
    email      VARCHAR(100)          NOT NULL,
    password   VARCHAR(255)          NOT NULL,
    active     BIT(1)                NOT NULL,
    created_at datetime              NOT NULL,
    updated_at datetime              NULL,
    CONSTRAINT pk_users PRIMARY KEY (id)
);

ALTER TABLE brands
    ADD CONSTRAINT uc_brands_name UNIQUE (name);

ALTER TABLE categories
    ADD CONSTRAINT uc_categories_name UNIQUE (name);

ALTER TABLE customers
    ADD CONSTRAINT uc_customers_phone UNIQUE (phone);

ALTER TABLE role_permissions
    ADD CONSTRAINT uc_e8ecd47e0540a13a477a6fe0e UNIQUE (role_id, permission_id);

ALTER TABLE locations
    ADD CONSTRAINT uc_locations_name UNIQUE (name);

ALTER TABLE permissions
    ADD CONSTRAINT uc_permissions_name UNIQUE (name);

ALTER TABLE products
    ADD CONSTRAINT uc_products_sku UNIQUE (sku);

ALTER TABLE products_variants
    ADD CONSTRAINT uc_products_variants_sku UNIQUE (sku);

ALTER TABLE purchase_orders
    ADD CONSTRAINT uc_purchase_orders_ponumber UNIQUE (po_number);

ALTER TABLE roles
    ADD CONSTRAINT uc_roles_name UNIQUE (name);

ALTER TABLE salary_configs
    ADD CONSTRAINT uc_salary_configs_role UNIQUE (role_id);

ALTER TABLE sales_orders
    ADD CONSTRAINT uc_sales_orders_ordernumber UNIQUE (order_number);

ALTER TABLE user_credentials
    ADD CONSTRAINT uc_user_credentials_user UNIQUE (user_id);

ALTER TABLE user_credentials
    ADD CONSTRAINT uc_user_credentials_username UNIQUE (username);

ALTER TABLE users
    ADD CONSTRAINT uc_users_email UNIQUE (email);

ALTER TABLE users
    ADD CONSTRAINT uc_users_username UNIQUE (username);

ALTER TABLE attendance
    ADD CONSTRAINT FK_ATTENDANCE_ON_SHIFT FOREIGN KEY (shift_id) REFERENCES shifts (id);

ALTER TABLE attendance
    ADD CONSTRAINT FK_ATTENDANCE_ON_USER FOREIGN KEY (user_id) REFERENCES users (id);

ALTER TABLE inventory_stock
    ADD CONSTRAINT FK_INVENTORY_STOCK_ON_BATCH FOREIGN KEY (batch_id) REFERENCES product_batches (id);

ALTER TABLE inventory_stock
    ADD CONSTRAINT FK_INVENTORY_STOCK_ON_BIN FOREIGN KEY (bin_id) REFERENCES shelves_bins (id);

ALTER TABLE inventory_stock
    ADD CONSTRAINT FK_INVENTORY_STOCK_ON_VARIANT FOREIGN KEY (variant_id) REFERENCES products_variants (id);

ALTER TABLE loyalty_history
    ADD CONSTRAINT FK_LOYALTY_HISTORY_ON_CUSTOMER FOREIGN KEY (customer_id) REFERENCES customers (id);

ALTER TABLE loyalty_history
    ADD CONSTRAINT FK_LOYALTY_HISTORY_ON_ORDER FOREIGN KEY (order_id) REFERENCES sales_orders (id);

ALTER TABLE order_items
    ADD CONSTRAINT FK_ORDER_ITEMS_ON_ORDER FOREIGN KEY (order_id) REFERENCES sales_orders (id);

ALTER TABLE order_items
    ADD CONSTRAINT FK_ORDER_ITEMS_ON_PRODUCT FOREIGN KEY (product_id) REFERENCES products (id);

ALTER TABLE price_history
    ADD CONSTRAINT FK_PRICE_HISTORY_ON_CHANGED_BY FOREIGN KEY (changed_by) REFERENCES users (id);

ALTER TABLE price_history
    ADD CONSTRAINT FK_PRICE_HISTORY_ON_VARIANT FOREIGN KEY (variant_id) REFERENCES products_variants (id);

ALTER TABLE products
    ADD CONSTRAINT FK_PRODUCTS_ON_BRAND FOREIGN KEY (brand_id) REFERENCES brands (id);

ALTER TABLE products
    ADD CONSTRAINT FK_PRODUCTS_ON_CATEGORY FOREIGN KEY (category_id) REFERENCES categories (id);

ALTER TABLE products_variants
    ADD CONSTRAINT FK_PRODUCTS_VARIANTS_ON_PRODUCT FOREIGN KEY (product_id) REFERENCES products (id);

ALTER TABLE product_batches
    ADD CONSTRAINT FK_PRODUCT_BATCHES_ON_PRODUCT FOREIGN KEY (product_id) REFERENCES products (id);

ALTER TABLE promotion_conditions
    ADD CONSTRAINT FK_PROMOTION_CONDITIONS_ON_PROMOTION FOREIGN KEY (promotion_id) REFERENCES promotions (id);

ALTER TABLE purchase_orders
    ADD CONSTRAINT FK_PURCHASE_ORDERS_ON_CREATOR FOREIGN KEY (creator_id) REFERENCES users (id);

ALTER TABLE purchase_orders
    ADD CONSTRAINT FK_PURCHASE_ORDERS_ON_SUPPLIER FOREIGN KEY (supplier_id) REFERENCES suppliers (id);

ALTER TABLE purchase_order_items
    ADD CONSTRAINT FK_PURCHASE_ORDER_ITEMS_ON_PRODUCT FOREIGN KEY (product_id) REFERENCES products (id);

ALTER TABLE purchase_order_items
    ADD CONSTRAINT FK_PURCHASE_ORDER_ITEMS_ON_PURCHASE_ORDER FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders (id);

ALTER TABLE reports
    ADD CONSTRAINT FK_REPORTS_ON_CREATED_BY FOREIGN KEY (created_by) REFERENCES users (id);

ALTER TABLE role_permissions
    ADD CONSTRAINT FK_ROLE_PERMISSIONS_ON_PERMISSION FOREIGN KEY (permission_id) REFERENCES permissions (id);

ALTER TABLE role_permissions
    ADD CONSTRAINT FK_ROLE_PERMISSIONS_ON_ROLE FOREIGN KEY (role_id) REFERENCES roles (id);

ALTER TABLE salary_configs
    ADD CONSTRAINT FK_SALARY_CONFIGS_ON_ROLE FOREIGN KEY (role_id) REFERENCES roles (id);

ALTER TABLE salary_payouts
    ADD CONSTRAINT FK_SALARY_PAYOUTS_ON_CONFIG FOREIGN KEY (config_id) REFERENCES salary_configs (id);

ALTER TABLE salary_payouts
    ADD CONSTRAINT FK_SALARY_PAYOUTS_ON_USER FOREIGN KEY (user_id) REFERENCES users (id);

ALTER TABLE sales_orders
    ADD CONSTRAINT FK_SALES_ORDERS_ON_CUSTOMER FOREIGN KEY (customer_id) REFERENCES customers (id);

ALTER TABLE sales_orders
    ADD CONSTRAINT FK_SALES_ORDERS_ON_USER FOREIGN KEY (user_id) REFERENCES users (id);

ALTER TABLE shelves_bins
    ADD CONSTRAINT FK_SHELVES_BINS_ON_LOCATION FOREIGN KEY (location_id) REFERENCES locations (id);

ALTER TABLE shift_assignments
    ADD CONSTRAINT FK_SHIFT_ASSIGNMENTS_ON_SHIFT FOREIGN KEY (shift_id) REFERENCES shifts (id);

ALTER TABLE shift_assignments
    ADD CONSTRAINT FK_SHIFT_ASSIGNMENTS_ON_USER FOREIGN KEY (user_id) REFERENCES users (id);

ALTER TABLE stock_movements
    ADD CONSTRAINT FK_STOCK_MOVEMENTS_ON_FROM_BIN FOREIGN KEY (from_bin_id) REFERENCES shelves_bins (id);

ALTER TABLE stock_movements
    ADD CONSTRAINT FK_STOCK_MOVEMENTS_ON_TO_BIN FOREIGN KEY (to_bin_id) REFERENCES shelves_bins (id);

ALTER TABLE stock_movements
    ADD CONSTRAINT FK_STOCK_MOVEMENTS_ON_VARIANT FOREIGN KEY (variant_id) REFERENCES products_variants (id);

ALTER TABLE user_credentials
    ADD CONSTRAINT FK_USER_CREDENTIALS_ON_USER FOREIGN KEY (user_id) REFERENCES users (id);

ALTER TABLE user_roles
    ADD CONSTRAINT fk_userol_on_roles FOREIGN KEY (role_id) REFERENCES roles (id);

ALTER TABLE user_roles
    ADD CONSTRAINT fk_userol_on_users FOREIGN KEY (user_id) REFERENCES users (id);