-- =============================================================================
-- V1__create_schema.sql
-- SmallTrend Grocery Store Database Schema
-- =============================================================================

-- Create lookup tables first
CREATE TABLE `brands` (
    `id` integer not null auto_increment,
    `name` varchar(255),
    primary key (`id`)
) ENGINE=InnoDB;

CREATE TABLE `categories` (
    `id` integer not null auto_increment,
    `name` varchar(255),
    primary key (`id`)
) ENGINE=InnoDB;

CREATE TABLE `suppliers` (
    `id` integer not null auto_increment,
    `contact_info` varchar(255),
    `name` varchar(255),
    primary key (`id`)
) ENGINE=InnoDB;

CREATE TABLE `roles` (
    `id` integer not null auto_increment,
    `description` varchar(255),
    `name` varchar(255),
    primary key (`id`)
) ENGINE=InnoDB;

CREATE TABLE `permissions` (
    `id` integer not null auto_increment,
    `description` varchar(255),
    `name` varchar(255),
    primary key (`id`)
) ENGINE=InnoDB;

CREATE TABLE `locations` (
    `id` integer not null auto_increment,
    `name` varchar(255),
    `type` varchar(255),
    primary key (`id`)
) ENGINE=InnoDB;

CREATE TABLE `tax_rates` (
    `id` integer not null auto_increment,
    `is_active` bit not null,
    `rate` decimal(38,2),
    `name` varchar(255),
    primary key (`id`)
) ENGINE=InnoDB;

-- Create main entity tables
CREATE TABLE `users` (
    `base_salary` decimal(10,2),
    `hourly_rate` decimal(10,2),
    `id` integer not null auto_increment,
    `role_id` integer,
    `created_at` datetime(6),
    `updated_at` datetime(6),
    `email` varchar(100),
    `address` varchar(255),
    `full_name` varchar(255),
    `phone` varchar(255),
    `salary_type` varchar(255),
    `status` varchar(255),
    primary key (`id`)
) ENGINE=InnoDB;

-- Continue with other tables...
-- (I'll add the rest in subsequent files to avoid massive single migration)
