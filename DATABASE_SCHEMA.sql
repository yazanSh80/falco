-- ============================================================================
-- FALCO ELECTREC DATABASE SCHEMA
-- Generated from SQLAlchemy Models Analysis
-- Database: Graduation (MySQL 8.0)
-- ============================================================================

USE Graduation;

-- ============================================================================
-- 1. USERS TABLE - Multi-role user management
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20),
    password_hash VARCHAR(256) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'customer' COMMENT 'Enum: customer, engineer, admin',
    status VARCHAR(20) NOT NULL DEFAULT 'active' COMMENT 'Enum: active, blocked, pending',
    city VARCHAR(100),
    area VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_role_status (role, status),
    INDEX idx_area (area),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 2. ENGINEER_PROFILES TABLE - Extended profile for engineers
-- ============================================================================
CREATE TABLE IF NOT EXISTS engineer_profiles (
    user_id INT PRIMARY KEY,
    specialization VARCHAR(100) NOT NULL,
    years_exp INT DEFAULT 0,
    bio TEXT,
    cv_url VARCHAR(255),
    certificate_url VARCHAR(255),
    rating_avg FLOAT DEFAULT 0.0,
    rating_count INT DEFAULT 0,
    subscription_status VARCHAR(20) DEFAULT 'active' COMMENT 'Enum: active, expired',
    subscription_expiry DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_engineer_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_specialization (specialization),
    INDEX idx_subscription_status (subscription_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 3. FEATURES TABLE - Service category/features
-- ============================================================================
CREATE TABLE IF NOT EXISTS features (
    id VARCHAR(10) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(50),
    description TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_active (active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 4. SERVICES TABLE - Individual services catalog
-- ============================================================================
CREATE TABLE IF NOT EXISTS services (
    id VARCHAR(10) PRIMARY KEY,
    feature_id VARCHAR(10) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    base_price FLOAT NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_service_feature FOREIGN KEY (feature_id) REFERENCES features(id) ON DELETE RESTRICT,
    INDEX idx_feature_id (feature_id),
    INDEX idx_active (active),
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 5. REQUESTS TABLE - Core business entity: Service requests
-- ============================================================================
CREATE TABLE IF NOT EXISTS requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    request_number VARCHAR(20) NOT NULL UNIQUE,
    customer_id INT NOT NULL,
    service_id VARCHAR(10),
    type VARCHAR(10) NOT NULL DEFAULT 'quick' COMMENT 'Enum: quick, late',
    category VARCHAR(100) COMMENT 'Free-form category for quick requests',
    description TEXT NOT NULL,
    location_text VARCHAR(255) NOT NULL,
    location_lat FLOAT,
    location_lng FLOAT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' COMMENT 'Enum: pending, accepted, in_progress, completed, cancelled',
    engineer_id INT,
    price_at_request FLOAT,
    preferred_time DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    accepted_at DATETIME,
    started_at DATETIME,
    completed_at DATETIME,
    cancelled_at DATETIME,
    
    -- SLA tracking
    sla_response_deadline DATETIME,
    sla_completion_deadline DATETIME,
    sla_response_breached BOOLEAN DEFAULT FALSE,
    sla_completion_breached BOOLEAN DEFAULT FALSE,
    
    CONSTRAINT fk_request_customer FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT fk_request_engineer FOREIGN KEY (engineer_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_request_service FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL,
    
    UNIQUE KEY uk_request_number (request_number),
    INDEX idx_status (status),
    INDEX idx_customer_id (customer_id),
    INDEX idx_engineer_id (engineer_id),
    INDEX idx_created_at (created_at),
    INDEX idx_service_id (service_id),
    INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 6. REVIEWS TABLE - Reviews and ratings
-- ============================================================================
CREATE TABLE IF NOT EXISTS reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    request_id INT NOT NULL,
    reviewer_id INT NOT NULL,
    reviewee_id INT NOT NULL,
    rating INT NOT NULL COMMENT '1-5 stars',
    text TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_review_request FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE,
    CONSTRAINT fk_review_reviewer FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_review_reviewee FOREIGN KEY (reviewee_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT check_rating_range CHECK (rating >= 1 AND rating <= 5),
    
    UNIQUE KEY uk_review_per_request_user (request_id, reviewer_id),
    INDEX idx_request_id (request_id),
    INDEX idx_reviewer_id (reviewer_id),
    INDEX idx_reviewee_id (reviewee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 7. TRANSACTIONS TABLE - Financial transactions with commission tracking
-- ============================================================================
CREATE TABLE IF NOT EXISTS transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    request_id INT NOT NULL UNIQUE,
    customer_id INT NOT NULL,
    engineer_id INT NOT NULL,
    gross_amount FLOAT NOT NULL,
    commission_rate FLOAT NOT NULL COMMENT '0.0 or 0.05 (5%)',
    commission_amount FLOAT NOT NULL,
    net_amount FLOAT NOT NULL COMMENT 'gross_amount - commission_amount',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_transaction_request FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE RESTRICT,
    CONSTRAINT fk_transaction_customer FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT fk_transaction_engineer FOREIGN KEY (engineer_id) REFERENCES users(id) ON DELETE RESTRICT,
    
    UNIQUE KEY uk_transaction_per_request (request_id),
    INDEX idx_customer_id (customer_id),
    INDEX idx_engineer_id (engineer_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 8. PORTFOLIO_ITEMS TABLE - Engineer portfolio showcase
-- ============================================================================
CREATE TABLE IF NOT EXISTS portfolio_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    engineer_id INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    location VARCHAR(100),
    image_url VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_portfolio_engineer FOREIGN KEY (engineer_id) REFERENCES engineer_profiles(user_id) ON DELETE CASCADE,
    
    INDEX idx_engineer_id (engineer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 9. BLOCKS TABLE - User blocking relationships (bidirectional)
-- ============================================================================
CREATE TABLE IF NOT EXISTS blocks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    blocker_id INT NOT NULL,
    blocked_id INT NOT NULL,
    reason TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_block_blocker FOREIGN KEY (blocker_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_block_blocked FOREIGN KEY (blocked_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT check_no_self_block CHECK (blocker_id != blocked_id),
    
    UNIQUE KEY uk_block_pair (blocker_id, blocked_id),
    INDEX idx_blocker_id (blocker_id),
    INDEX idx_blocked_id (blocked_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 10. NOTIFICATIONS TABLE - In-app notification system
-- ============================================================================
CREATE TABLE IF NOT EXISTS notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'general' 
        COMMENT 'Enum: request_created, request_accepted, request_completed, request_cancelled, review_received, account_approved, account_rejected, subscription_expiring, general',
    title VARCHAR(100) NOT NULL,
    body TEXT,
    read BOOLEAN DEFAULT FALSE,
    reference_id INT COMMENT 'Related request or review ID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_notification_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_user_id (user_id),
    INDEX idx_read (read),
    INDEX idx_created_at (created_at),
    INDEX idx_user_read_created (user_id, read, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 11. DISPUTES TABLE - Complaint and dispute resolution
-- ============================================================================
CREATE TABLE IF NOT EXISTS disputes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    request_id INT NOT NULL,
    created_by INT NOT NULL,
    against_user_id INT NOT NULL,
    category VARCHAR(50) NOT NULL 
        COMMENT 'Enum: quality, incomplete, overcharge, delay, behavior, damage, other',
    description TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'open' 
        COMMENT 'Enum: open, in_review, resolved, rejected',
    resolved_by INT,
    resolution_action VARCHAR(50) 
        COMMENT 'Enum: no_action, partial_refund, full_refund, warn_engineer, warn_customer, block_engineer, block_customer',
    resolution_notes TEXT,
    refund_amount FLOAT,
    resolved_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_dispute_request FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE,
    CONSTRAINT fk_dispute_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_dispute_against FOREIGN KEY (against_user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_dispute_resolver FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_status (status),
    INDEX idx_request_id (request_id),
    INDEX idx_created_by (created_by),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 12. AREAS TABLE - Service geographic regions
-- ============================================================================
CREATE TABLE IF NOT EXISTS areas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    name_ar VARCHAR(100) COMMENT 'Arabic name',
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY uk_area_name (name),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 13. TOKEN_BLOCKLIST TABLE - Revoked JWT tokens
-- ============================================================================
CREATE TABLE IF NOT EXISTS token_blocklist (
    id INT PRIMARY KEY AUTO_INCREMENT,
    jti VARCHAR(36) NOT NULL UNIQUE COMMENT 'JWT ID claim',
    user_id INT,
    token_type VARCHAR(10) NOT NULL COMMENT 'Enum: access, refresh',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME,
    revoked_by INT,
    reason VARCHAR(255),
    
    CONSTRAINT fk_token_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_token_revoked_by FOREIGN KEY (revoked_by) REFERENCES users(id) ON DELETE SET NULL,
    
    UNIQUE KEY uk_jti (jti),
    INDEX idx_user_id (user_id),
    INDEX idx_token_type (token_type),
    INDEX idx_jti (jti)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 14. ADMIN_ACTION_LOGS TABLE - Audit trail for admin actions
-- ============================================================================
CREATE TABLE IF NOT EXISTS admin_action_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    admin_id INT NOT NULL,
    action_type VARCHAR(50) NOT NULL 
        COMMENT 'Enum: approve_engineer, reject_engineer, block_user, resolve_dispute, etc.',
    target_type VARCHAR(50) COMMENT 'Target entity type: user, dispute, service, etc.',
    target_id INT COMMENT 'ID of the target entity',
    details_json JSON COMMENT 'Additional action-specific details',
    ip_address VARCHAR(50) COMMENT 'Admin source IP address',
    user_agent VARCHAR(255) COMMENT 'Admin browser/client info',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_admin_action_log_user FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE RESTRICT,
    
    INDEX idx_admin_id (admin_id),
    INDEX idx_action_type (action_type),
    INDEX idx_target_id (target_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- VIEWS AND HELPER QUERIES
-- ============================================================================

-- View: Active Requests Summary
CREATE OR REPLACE VIEW v_active_requests AS
SELECT 
    r.id,
    r.request_number,
    u_cust.name AS customer_name,
    u_eng.name AS engineer_name,
    r.type,
    r.status,
    r.created_at,
    r.sla_response_breached,
    r.sla_completion_breached,
    DATEDIFF(r.sla_response_deadline, NOW()) AS hours_to_response_deadline,
    DATEDIFF(r.sla_completion_deadline, NOW()) AS hours_to_completion_deadline
FROM requests r
JOIN users u_cust ON r.customer_id = u_cust.id
LEFT JOIN users u_eng ON r.engineer_id = u_eng.id
WHERE r.status IN ('pending', 'accepted', 'in_progress');

-- View: Engineer Statistics
CREATE OR REPLACE VIEW v_engineer_stats AS
SELECT 
    ep.user_id,
    u.name,
    u.email,
    ep.specialization,
    ep.rating_avg,
    ep.rating_count,
    ep.subscription_status,
    ep.subscription_expiry,
    COUNT(DISTINCT r.id) AS total_requests,
    SUM(CASE WHEN r.status = 'completed' THEN 1 ELSE 0 END) AS completed_requests,
    SUM(CASE WHEN r.status IN ('pending', 'accepted', 'in_progress') THEN 1 ELSE 0 END) AS active_requests,
    COALESCE(SUM(t.net_amount), 0) AS total_earned
FROM engineer_profiles ep
JOIN users u ON ep.user_id = u.id
LEFT JOIN requests r ON ep.user_id = r.engineer_id
LEFT JOIN transactions t ON r.id = t.request_id
GROUP BY ep.user_id, u.name, u.email, ep.specialization;

-- View: Financial Summary by Period
CREATE OR REPLACE VIEW v_financial_summary AS
SELECT 
    DATE(t.created_at) AS transaction_date,
    COUNT(*) AS transaction_count,
    SUM(t.gross_amount) AS gross_revenue,
    SUM(t.commission_amount) AS platform_commission,
    SUM(t.net_amount) AS engineer_payments,
    MONTH(t.created_at) AS month,
    YEAR(t.created_at) AS year
FROM transactions t
GROUP BY DATE(t.created_at), MONTH(t.created_at), YEAR(t.created_at);

-- ============================================================================
-- CONSISTENCY CHECK PROCEDURES
-- ============================================================================

-- Procedure: Verify Database Integrity
DELIMITER //

CREATE PROCEDURE IF NOT EXISTS check_database_integrity()
BEGIN
    DECLARE error_count INT DEFAULT 0;
    
    SELECT 
        COUNT(*) INTO error_count
    FROM requests r
    WHERE (r.status = 'completed' AND r.completed_at IS NULL)
        OR (r.status = 'accepted' AND r.accepted_at IS NULL)
        OR (r.status = 'cancelled' AND r.cancelled_at IS NULL);
    
    SELECT CONCAT('Integrity Check: ', 
        (SELECT COUNT(*) FROM users), ' users, ',
        (SELECT COUNT(*) FROM requests), ' requests, ',
        (SELECT COUNT(*) FROM transactions), ' transactions, ',
        (SELECT COUNT(*) FROM reviews), ' reviews, ',
        'Inconsistencies: ', error_count) AS result;
END //

DELIMITER ;

-- ============================================================================
-- INDEXES SUMMARY
-- ============================================================================
-- Total Indexes Created: 50+
-- Covering:
--   - Primary keys (automatic)
--   - Foreign key lookups
--   - Query filtering (status, role, etc.)
--   - Time-based queries (created_at)
--   - Sorting and aggregation operations

-- ============================================================================
-- DATABASE INITIALIZATION COMPLETE
-- ============================================================================

-- Verify installation
SELECT 'Database Schema Created Successfully' AS Status,
       NOW() AS Created_At,
       (SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA='Graduation') AS Total_Tables;
