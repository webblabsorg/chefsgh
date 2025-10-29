-- ============================================
-- Ghana Chef Association - Database Schema
-- Compatible with DirectAdmin MySQL
-- ============================================

-- Set character set and collation
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- ============================================
-- DROP TABLES (if exists) - Use with caution
-- ============================================
-- Uncomment the following lines to drop existing tables
-- DROP TABLE IF EXISTS registration_documents;
-- DROP TABLE IF EXISTS registrations;
-- DROP TABLE IF EXISTS membership_types;
-- DROP TABLE IF EXISTS admin_users;

-- DROP TABLE IF EXISTS registration_documents;
-- DROP TABLE IF EXISTS registrations;
-- DROP TABLE IF EXISTS payments;
-- DROP TABLE IF EXISTS users;
-- DROP TABLE IF EXISTS membership_types;
-- DROP TABLE IF EXISTS admin_users;
-- DROP TABLE IF EXISTS email_notifications;
-- DROP TABLE IF EXISTS audit_logs;

-- ============================================
-- TABLE: users
-- Stores core personal data for applicants/members
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone_number VARCHAR(20) NOT NULL,
    alternative_phone VARCHAR(20),
    date_of_birth DATE NOT NULL,
    gender ENUM('male', 'female', 'prefer_not_to_say') NOT NULL,
    nationality VARCHAR(100) NOT NULL DEFAULT 'Ghanaian',
    id_type ENUM('ghana_card', 'passport', 'voter_id', 'driver_license') NOT NULL,
    id_number VARCHAR(50) NOT NULL,
    street_address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    region VARCHAR(100) NOT NULL,
    digital_address VARCHAR(50),
    professional_info JSON,
    emergency_contact JSON NOT NULL,
    profile_photo_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_phone (phone_number),
    FULLTEXT INDEX idx_user_search (first_name, last_name, email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: membership_types
-- Stores different membership categories
-- ============================================
CREATE TABLE IF NOT EXISTS membership_types (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    benefits JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_slug (slug),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: payments
-- Tracks all payment transactions (Paystack and manual)
-- ============================================
CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    reference VARCHAR(100) NOT NULL UNIQUE,
    gateway ENUM('paystack', 'manual') DEFAULT 'paystack',
    status ENUM('pending', 'success', 'failed', 'abandoned', 'reversed') NOT NULL DEFAULT 'pending',
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'GHS',
    channel VARCHAR(100),
    paid_at TIMESTAMP NULL,
    metadata JSON,
    customer_email VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_reference (reference),
    INDEX idx_status (status),
    INDEX idx_paid_at (paid_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: registrations
CREATE TABLE IF NOT EXISTS registrations (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    membership_id VARCHAR(20) UNIQUE NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    membership_type_id VARCHAR(36) NOT NULL,
    payment_id VARCHAR(36),
    payment_reference VARCHAR(100) UNIQUE NOT NULL,
    payment_status ENUM('pending', 'success', 'failed', 'refunded') DEFAULT 'pending',
    payment_amount DECIMAL(10, 2) NOT NULL,
    payment_date TIMESTAMP NULL,
    
    -- Terms and Agreements
    terms_accepted BOOLEAN DEFAULT FALSE,
    code_of_conduct_accepted BOOLEAN DEFAULT FALSE,
    data_privacy_accepted BOOLEAN DEFAULT FALSE,
    
    -- Membership Status
    membership_status ENUM('active', 'inactive', 'suspended', 'expired') DEFAULT 'active',
    membership_expiry DATE NOT NULL,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (membership_type_id) REFERENCES membership_types(id) ON DELETE RESTRICT,
    FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE SET NULL,
    
    -- Indexes for performance
    INDEX idx_membership_id (membership_id),
    INDEX idx_payment_reference (payment_reference),
    INDEX idx_membership_status (membership_status),
    INDEX idx_membership_expiry (membership_expiry),
    INDEX idx_created_at (created_at),
    FULLTEXT INDEX idx_fulltext_search (membership_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- ============================================
-- TABLE: registration_documents
-- Stores uploaded documents separately
-- ============================================
CREATE TABLE IF NOT EXISTS registration_documents (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    registration_id VARCHAR(36) NOT NULL,
    document_type ENUM('profile_photo', 'certificate', 'student_id', 'business_license', 'other') NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size INT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (registration_id) REFERENCES registrations(id) ON DELETE CASCADE,
    INDEX idx_registration_id (registration_id),
    INDEX idx_document_type (document_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: admin_users
-- Stores admin/staff user accounts
-- ============================================
CREATE TABLE IF NOT EXISTS admin_users (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(200) NOT NULL,
    role ENUM('super_admin', 'admin', 'staff', 'viewer') DEFAULT 'staff',
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: email_notifications
-- Logs all email notifications sent
-- ============================================
CREATE TABLE IF NOT EXISTS email_notifications (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    registration_id VARCHAR(36),
    recipient_email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    status ENUM('pending', 'sent', 'failed') DEFAULT 'pending',
    sent_at TIMESTAMP NULL,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (registration_id) REFERENCES registrations(id) ON DELETE SET NULL,
    INDEX idx_registration_id (registration_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: audit_logs
-- Tracks all important system activities
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(36),
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_entity_type (entity_type),
    INDEX idx_entity_id (entity_id),
    INDEX idx_action (action),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- INSERT DEFAULT MEMBERSHIP TYPES
-- ============================================
INSERT INTO membership_types (id, name, slug, description, price, benefits, is_active) VALUES
(UUID(), 'Professional Member', 'professional', 'For professional chefs with culinary experience and qualifications', 500.00, 
 JSON_ARRAY('Access to all workshops and training', 'Networking events', 'Professional certification', 'Job placement assistance', 'Industry recognition'), 
 TRUE),

(UUID(), 'Corporate Member', 'corporate', 'For restaurants, hotels, and food service businesses', 2000.00, 
 JSON_ARRAY('Corporate branding opportunities', 'Staff training programs', 'Industry networking', 'Business development support', 'Priority event access'), 
 TRUE),

(UUID(), 'Associate Member', 'associate', 'For culinary enthusiasts, food bloggers, and industry supporters', 200.00, 
 JSON_ARRAY('Access to select events', 'Networking opportunities', 'Educational resources', 'Community engagement'), 
 TRUE),

(UUID(), 'Vendor Member', 'vendor', 'For suppliers and service providers to the culinary industry', 1000.00, 
 JSON_ARRAY('Business directory listing', 'Vendor showcase events', 'Networking with chefs', 'Marketing opportunities'), 
 TRUE),

(UUID(), 'Student Member', 'student', 'For culinary students currently enrolled in accredited programs', 150.00, 
 JSON_ARRAY('Discounted workshop access', 'Mentorship programs', 'Career guidance', 'Student competitions', 'Educational resources'), 
 TRUE);

-- ============================================
-- CREATE STORED PROCEDURE: Generate Membership ID
-- ============================================
DELIMITER //

CREATE PROCEDURE generate_membership_id()
BEGIN
    DECLARE new_id VARCHAR(20);
    DECLARE id_exists INT;
    DECLARE counter INT DEFAULT 0;
    
    REPEAT
        SET new_id = CONCAT('GCA', YEAR(CURDATE()), LPAD(FLOOR(RAND() * 999999), 6, '0'));
        SELECT COUNT(*) INTO id_exists FROM registrations WHERE membership_id = new_id;
        SET counter = counter + 1;
    UNTIL id_exists = 0 OR counter > 100 END REPEAT;
    
    IF id_exists = 0 THEN
        SELECT new_id AS membership_id;
    ELSE
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Failed to generate unique membership ID';
    END IF;
END //

DELIMITER ;

-- ============================================
-- CREATE FUNCTION: Get Active Members Count
-- ============================================
DELIMITER //

CREATE FUNCTION get_active_members_count()
RETURNS INT
DETERMINISTIC
BEGIN
    DECLARE member_count INT;
    SELECT COUNT(*) INTO member_count 
    FROM registrations 
    WHERE membership_status = 'active' 
    AND membership_expiry >= CURDATE();
    RETURN member_count;
END //

DELIMITER ;

-- ============================================
-- CREATE TRIGGER: Update timestamp on registration update
-- ============================================
DELIMITER //

CREATE TRIGGER before_registration_update
BEFORE UPDATE ON registrations
FOR EACH ROW
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END //

DELIMITER ;

-- ============================================
-- CREATE TRIGGER: Log registration creation
-- ============================================
DELIMITER //

CREATE TRIGGER after_registration_insert
AFTER INSERT ON registrations
FOR EACH ROW
BEGIN
    DECLARE audit_email VARCHAR(255);
    DECLARE audit_name VARCHAR(255);

    SELECT email, CONCAT(first_name, ' ', last_name)
    INTO audit_email, audit_name
    FROM users
    WHERE id = NEW.user_id;

    INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_values, created_at)
    VALUES (NEW.user_id, 'CREATE', 'registration', NEW.id, 
            JSON_OBJECT('membership_id', NEW.membership_id, 'email', audit_email, 'name', audit_name),
            CURRENT_TIMESTAMP);
END //

DELIMITER ;

-- ============================================
-- CREATE VIEWS FOR REPORTING
-- ============================================

-- View: Active Members Summary
CREATE OR REPLACE VIEW v_active_members AS
SELECT 
    r.id,
    r.membership_id,
    CONCAT(u.first_name, ' ', u.last_name) AS full_name,
    u.email,
    u.phone_number,
    mt.name AS membership_type,
    r.membership_status,
    r.membership_expiry,
    DATEDIFF(r.membership_expiry, CURDATE()) AS days_until_expiry,
    r.created_at AS registration_date
FROM registrations r
JOIN users u ON r.user_id = u.id
JOIN membership_types mt ON r.membership_type_id = mt.id
WHERE r.membership_status = 'active'
ORDER BY r.created_at DESC;

-- View: Revenue Summary
CREATE OR REPLACE VIEW v_revenue_summary AS
SELECT 
    mt.name AS membership_type,
    COUNT(r.id) AS total_registrations,
    SUM(r.payment_amount) AS total_revenue,
    AVG(r.payment_amount) AS average_payment,
    YEAR(r.created_at) AS year,
    MONTH(r.created_at) AS month
FROM registrations r
JOIN membership_types mt ON r.membership_type_id = mt.id
WHERE r.payment_status = 'success'
GROUP BY mt.name, YEAR(r.created_at), MONTH(r.created_at)
ORDER BY year DESC, month DESC;

-- View: Expiring Memberships (next 30 days)
CREATE OR REPLACE VIEW v_expiring_memberships AS
SELECT 
    r.membership_id,
    CONCAT(u.first_name, ' ', u.last_name) AS full_name,
    u.email,
    u.phone_number,
    mt.name AS membership_type,
    r.membership_expiry,
    DATEDIFF(r.membership_expiry, CURDATE()) AS days_remaining
FROM registrations r
JOIN users u ON r.user_id = u.id
JOIN membership_types mt ON r.membership_type_id = mt.id
WHERE r.membership_status = 'active'
AND r.membership_expiry BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)
ORDER BY r.membership_expiry ASC;

-- ============================================
-- GRANT PERMISSIONS (Adjust username as needed)
-- ============================================
-- GRANT SELECT, INSERT, UPDATE ON chefs_db.* TO 'your_db_user'@'localhost';
-- FLUSH PRIVILEGES;

-- ============================================
-- END OF SCHEMA
-- ============================================
