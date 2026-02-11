-- V6: Consolidate User JWT Authentication Schema
-- Merge old schema with new JWT requirements

-- Remove old duplicate users table if exists and create consolidated version
DROP TABLE IF EXISTS users CASCADE;

-- Create consolidated users table with JWT authentication support
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(255),
    address TEXT,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    role_id INT,
    
    INDEX idx_users_email (email),
    INDEX idx_users_status (status),
    INDEX idx_users_active (active),
    
    CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- Update user_credentials to match new structure  
DROP TABLE IF EXISTS user_credentials CASCADE;

CREATE TABLE IF NOT EXISTS user_credentials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    
    INDEX idx_user_credentials_username (username),
    INDEX idx_user_credentials_user_id (user_id),
    
    CONSTRAINT fk_user_credentials_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Ensure audit_logs table exists for new entities
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    action VARCHAR(255) NOT NULL,
    entity_name VARCHAR(255),
    entity_id VARCHAR(255),
    details TEXT,
    actor_user_id INT,
    performed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_audit_logs_entity (entity_name, entity_id),
    INDEX idx_audit_logs_performed_at (performed_at),
    
    CONSTRAINT fk_audit_logs_actor FOREIGN KEY (actor_user_id) REFERENCES users(id)
);

-- Ensure supplier_contracts table exists
CREATE TABLE IF NOT EXISTS supplier_contracts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    contract_number VARCHAR(255) UNIQUE NOT NULL,
    supplier_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    contract_value DECIMAL(15,2),
    currency VARCHAR(10) DEFAULT 'VND',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status ENUM('DRAFT', 'ACTIVE', 'EXPIRED', 'TERMINATED', 'SUSPENDED') DEFAULT 'DRAFT',
    terms_and_conditions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_supplier_contracts_supplier (supplier_id),
    INDEX idx_supplier_contracts_status (status),
    INDEX idx_supplier_contracts_dates (start_date, end_date),
    
    CONSTRAINT fk_supplier_contracts_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
);

-- Ensure payroll_records table exists
CREATE TABLE IF NOT EXISTS payroll_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    period_month INT NOT NULL,
    period_year INT NOT NULL,
    base_salary DECIMAL(15,2) NOT NULL DEFAULT 0,
    overtime_hours DECIMAL(5,2) DEFAULT 0,
    overtime_rate DECIMAL(15,2) DEFAULT 0,
    overtime_pay DECIMAL(15,2) DEFAULT 0,
    bonus DECIMAL(15,2) DEFAULT 0,
    allowances DECIMAL(15,2) DEFAULT 0,
    gross_pay DECIMAL(15,2) NOT NULL DEFAULT 0,
    tax_deduction DECIMAL(15,2) DEFAULT 0,
    insurance_deduction DECIMAL(15,2) DEFAULT 0,
    other_deductions DECIMAL(15,2) DEFAULT 0,
    total_deductions DECIMAL(15,2) DEFAULT 0,
    net_pay DECIMAL(15,2) NOT NULL DEFAULT 0,
    status ENUM('DRAFT', 'APPROVED', 'PAID', 'CANCELLED') DEFAULT 'DRAFT',
    processed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY uk_payroll_user_period (user_id, period_month, period_year),
    INDEX idx_payroll_records_period (period_month, period_year),
    INDEX idx_payroll_records_status (status),
    
    CONSTRAINT fk_payroll_records_user FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Ensure salary_configs table exists
CREATE TABLE IF NOT EXISTS salary_configs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    base_salary DECIMAL(15,2) NOT NULL DEFAULT 0,
    hourly_rate DECIMAL(10,2),
    overtime_multiplier DECIMAL(3,2) DEFAULT 1.5,
    currency VARCHAR(10) DEFAULT 'VND',
    effective_from DATE NOT NULL,
    effective_to DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_salary_configs_user (user_id),
    INDEX idx_salary_configs_effective (effective_from, effective_to),
    INDEX idx_salary_configs_active (is_active),
    
    CONSTRAINT fk_salary_configs_user FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Insert default roles if not exist
INSERT IGNORE INTO roles (id, name, description) VALUES 
(1, 'ROLE_ADMIN', 'System Administrator'),
(2, 'ROLE_MANAGER', 'Manager'),
(3, 'ROLE_CASHIER', 'Cashier'),
(4, 'ROLE_USER', 'Regular User');

-- Insert default admin user for testing
INSERT IGNORE INTO users (id, full_name, email, phone, status, active, role_id) VALUES 
(1, 'System Admin', 'admin@smalltrend.com', '0123456789', 'ACTIVE', true, 1);

-- Insert admin credentials (password: admin123)
INSERT IGNORE INTO user_credentials (user_id, username, password_hash) VALUES 
(1, 'admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.');