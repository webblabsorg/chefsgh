-- ============================================
-- Ghana Chef Association - Database Schema
-- Compatible with Neon Postgres
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- DROP TABLES (if exists) - Use with caution
-- ============================================
-- Uncomment to reset database
-- DROP TABLE IF EXISTS registration_documents CASCADE;
-- DROP TABLE IF EXISTS email_notifications CASCADE;
-- DROP TABLE IF EXISTS audit_logs CASCADE;
-- DROP TABLE IF EXISTS registrations CASCADE;
-- DROP TABLE IF EXISTS payments CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;
-- DROP TABLE IF EXISTS membership_types CASCADE;
-- DROP TABLE IF EXISTS admin_users CASCADE;
-- DROP TYPE IF EXISTS gender_type CASCADE;
-- DROP TYPE IF EXISTS id_type CASCADE;
-- DROP TYPE IF EXISTS payment_gateway CASCADE;
-- DROP TYPE IF EXISTS payment_status CASCADE;
-- DROP TYPE IF EXISTS registration_payment_status CASCADE;
-- DROP TYPE IF EXISTS membership_status CASCADE;
-- DROP TYPE IF EXISTS document_type CASCADE;
-- DROP TYPE IF EXISTS admin_role CASCADE;
-- DROP TYPE IF EXISTS email_status CASCADE;
-- DROP TYPE IF EXISTS audit_action CASCADE;

-- ============================================
-- CREATE ENUM TYPES
-- ============================================
CREATE TYPE gender_type AS ENUM ('male', 'female', 'prefer_not_to_say');
CREATE TYPE id_type AS ENUM ('ghana_card', 'passport', 'voter_id', 'driver_license');
CREATE TYPE payment_gateway AS ENUM ('paystack', 'manual');
CREATE TYPE payment_status AS ENUM ('pending', 'success', 'failed', 'abandoned', 'reversed');
CREATE TYPE registration_payment_status AS ENUM ('pending', 'success', 'failed', 'refunded');
CREATE TYPE membership_status AS ENUM ('active', 'inactive', 'suspended', 'expired');
CREATE TYPE document_type AS ENUM ('profile_photo', 'certificate', 'student_id', 'business_license', 'other');
CREATE TYPE admin_role AS ENUM ('super_admin', 'admin', 'staff', 'viewer');
CREATE TYPE email_status AS ENUM ('pending', 'sent', 'failed');
CREATE TYPE audit_action AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'PAYMENT', 'EXPORT', 'IMPORT');

-- ============================================
-- TABLE: users
-- Stores core personal data for applicants/members
-- ============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone_number VARCHAR(20) NOT NULL,
    alternative_phone VARCHAR(20),
    date_of_birth DATE NOT NULL,
    gender gender_type NOT NULL,
    nationality VARCHAR(100) NOT NULL DEFAULT 'Ghanaian',
    id_type id_type NOT NULL,
    id_number VARCHAR(50) NOT NULL,
    street_address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    region VARCHAR(100) NOT NULL,
    digital_address VARCHAR(50),
    professional_info JSONB,
    emergency_contact JSONB NOT NULL,
    profile_photo_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone_number);
CREATE INDEX idx_users_search ON users USING GIN(to_tsvector('english', first_name || ' ' || last_name || ' ' || email));

-- ============================================
-- TABLE: membership_types
-- Stores different membership categories
-- ============================================
CREATE TABLE membership_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    benefits JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_membership_types_slug ON membership_types(slug);
CREATE INDEX idx_membership_types_active ON membership_types(is_active);

-- ============================================
-- TABLE: payments
-- Tracks all payment transactions (Paystack and manual)
-- ============================================
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference VARCHAR(100) NOT NULL UNIQUE,
    gateway payment_gateway DEFAULT 'paystack',
    status payment_status NOT NULL DEFAULT 'pending',
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'GHS',
    channel VARCHAR(100),
    paid_at TIMESTAMP NULL,
    metadata JSONB,
    customer_email VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payments_reference ON payments(reference);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_paid_at ON payments(paid_at);

-- ============================================
-- TABLE: registrations
-- Main registration records linking users to memberships
-- ============================================
CREATE TABLE registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    membership_id VARCHAR(20) UNIQUE NOT NULL,
    user_id UUID NOT NULL,
    membership_type_id UUID NOT NULL,
    payment_id UUID,
    payment_reference VARCHAR(100) UNIQUE NOT NULL,
    payment_status registration_payment_status DEFAULT 'pending',
    payment_amount DECIMAL(10, 2) NOT NULL,
    payment_date TIMESTAMP NULL,
    
    -- Terms and Agreements
    terms_accepted BOOLEAN DEFAULT FALSE,
    code_of_conduct_accepted BOOLEAN DEFAULT FALSE,
    data_privacy_accepted BOOLEAN DEFAULT FALSE,
    
    -- Membership Status
    membership_status membership_status DEFAULT 'active',
    membership_expiry DATE NOT NULL,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_registrations_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_registrations_membership_type FOREIGN KEY (membership_type_id) REFERENCES membership_types(id) ON DELETE RESTRICT,
    CONSTRAINT fk_registrations_payment FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE SET NULL
);

CREATE INDEX idx_registrations_membership_id ON registrations(membership_id);
CREATE INDEX idx_registrations_payment_reference ON registrations(payment_reference);
CREATE INDEX idx_registrations_status ON registrations(membership_status);
CREATE INDEX idx_registrations_expiry ON registrations(membership_expiry);
CREATE INDEX idx_registrations_created_at ON registrations(created_at);
CREATE INDEX idx_registrations_search ON registrations USING GIN(to_tsvector('english', membership_id));

-- ============================================
-- TABLE: registration_documents
-- Stores uploaded documents separately
-- ============================================
CREATE TABLE registration_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id UUID NOT NULL,
    document_type document_type NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_documents_registration FOREIGN KEY (registration_id) REFERENCES registrations(id) ON DELETE CASCADE
);

CREATE INDEX idx_documents_registration_id ON registration_documents(registration_id);
CREATE INDEX idx_documents_type ON registration_documents(document_type);

-- ============================================
-- TABLE: admin_users
-- Stores admin/staff user accounts
-- ============================================
CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(200) NOT NULL,
    role admin_role DEFAULT 'staff',
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_admin_users_username ON admin_users(username);
CREATE INDEX idx_admin_users_email ON admin_users(email);
CREATE INDEX idx_admin_users_role ON admin_users(role);
CREATE INDEX idx_admin_users_active ON admin_users(is_active);

-- ============================================
-- TABLE: email_notifications
-- Logs all email notifications sent
-- ============================================
CREATE TABLE email_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id UUID,
    recipient_email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    status email_status DEFAULT 'pending',
    sent_at TIMESTAMP NULL,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_email_registration FOREIGN KEY (registration_id) REFERENCES registrations(id) ON DELETE SET NULL
);

CREATE INDEX idx_email_registration_id ON email_notifications(registration_id);
CREATE INDEX idx_email_status ON email_notifications(status);
CREATE INDEX idx_email_created_at ON email_notifications(created_at);

-- ============================================
-- TABLE: audit_logs
-- Tracks all system activities and changes
-- ============================================
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id UUID,
    action audit_action NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    details JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_audit_admin FOREIGN KEY (admin_user_id) REFERENCES admin_users(id) ON DELETE SET NULL
);

CREATE INDEX idx_audit_admin_user_id ON audit_logs(admin_user_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_entity_type ON audit_logs(entity_type);
CREATE INDEX idx_audit_created_at ON audit_logs(created_at);

-- ============================================
-- TRIGGERS FOR updated_at COLUMNS
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_membership_types_updated_at BEFORE UPDATE ON membership_types
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_registrations_updated_at BEFORE UPDATE ON registrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNCTION: Generate Membership ID
-- ============================================
CREATE OR REPLACE FUNCTION generate_membership_id()
RETURNS TEXT AS $$
DECLARE
    new_id TEXT;
    year TEXT;
    sequence_num INTEGER;
BEGIN
    year := TO_CHAR(CURRENT_DATE, 'YYYY');
    
    -- Get the next sequence number for this year
    SELECT COALESCE(MAX(CAST(SUBSTRING(membership_id FROM 10) AS INTEGER)), 0) + 1
    INTO sequence_num
    FROM registrations
    WHERE membership_id LIKE 'GCA-' || year || '-%';
    
    -- Format: GCA-YYYY-NNNN
    new_id := 'GCA-' || year || '-' || LPAD(sequence_num::TEXT, 4, '0');
    
    RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCTION: Get Active Members Count
-- ============================================
CREATE OR REPLACE FUNCTION get_active_members_count()
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM registrations
        WHERE membership_status = 'active'
        AND membership_expiry >= CURRENT_DATE
    );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- VIEWS
-- ============================================

-- Active members summary
CREATE OR REPLACE VIEW v_active_members AS
SELECT 
    r.id,
    r.membership_id,
    u.first_name,
    u.last_name,
    u.email,
    u.phone_number,
    mt.name AS membership_type,
    r.membership_expiry,
    r.payment_amount,
    r.created_at AS registration_date
FROM registrations r
JOIN users u ON r.user_id = u.id
JOIN membership_types mt ON r.membership_type_id = mt.id
WHERE r.membership_status = 'active'
AND r.membership_expiry >= CURRENT_DATE;

-- Revenue summary by membership type
CREATE OR REPLACE VIEW v_revenue_summary AS
SELECT 
    mt.name AS membership_type,
    COUNT(r.id) AS total_registrations,
    SUM(r.payment_amount) AS total_revenue,
    AVG(r.payment_amount) AS average_amount
FROM registrations r
JOIN membership_types mt ON r.membership_type_id = mt.id
WHERE r.payment_status = 'success'
GROUP BY mt.id, mt.name
ORDER BY total_revenue DESC;

-- Expiring memberships (within 30 days)
CREATE OR REPLACE VIEW v_expiring_memberships AS
SELECT 
    r.id,
    r.membership_id,
    u.first_name,
    u.last_name,
    u.email,
    u.phone_number,
    mt.name AS membership_type,
    r.membership_expiry,
    (r.membership_expiry - CURRENT_DATE) AS days_until_expiry
FROM registrations r
JOIN users u ON r.user_id = u.id
JOIN membership_types mt ON r.membership_type_id = mt.id
WHERE r.membership_status = 'active'
AND r.membership_expiry BETWEEN CURRENT_DATE AND (CURRENT_DATE + INTERVAL '30 days')
ORDER BY r.membership_expiry ASC;

-- ============================================
-- SEED DATA: Membership Types
-- ============================================
INSERT INTO membership_types (id, name, slug, price, description, benefits, is_active) VALUES
(gen_random_uuid(), 'Professional Membership', 'professional', 350.00, 
 'For qualified chefs and culinary professionals',
 '["Access to exclusive culinary events", "Professional networking opportunities", "Skill development workshops", "Industry recognition and certification", "Access to job opportunities"]'::jsonb,
 TRUE),

(gen_random_uuid(), 'Corporate Membership', 'corporate', 450.00,
 'For restaurants, hotels, and culinary businesses',
 '["Business networking opportunities", "Brand visibility at events", "Staff training and development programs", "Industry insights and market trends", "Partnership opportunities"]'::jsonb,
 TRUE),

(gen_random_uuid(), 'Associate Membership', 'associate', 250.00,
 'For culinary enthusiasts and food lovers',
 '["Access to culinary events and workshops", "Networking with professionals", "Newsletter and industry updates", "Discounted rates for events", "Community engagement"]'::jsonb,
 TRUE),

(gen_random_uuid(), 'Vendor Membership', 'vendor', 150.00,
 'For suppliers and service providers to the culinary industry',
 '["Business directory listing", "Access to industry network", "Promotion at events", "Partnership opportunities", "Market insights"]'::jsonb,
 TRUE),

(gen_random_uuid(), 'Student Membership', 'student', 50.00,
 'For culinary students and trainees',
 '["Mentorship programs", "Educational workshops", "Internship opportunities", "Career guidance", "Student networking events"]'::jsonb,
 TRUE);

-- ============================================
-- SEED DATA: Sample Admin User
-- Note: Change password after first login!
-- Default password: admin123 (hashed with bcrypt)
-- ============================================
-- Uncomment to create default admin
-- INSERT INTO admin_users (username, email, password_hash, full_name, role, is_active) VALUES
-- ('admin', 'admin@chefsghana.com', '$2a$10$8Z9qP.kYqZpY5H6qmQXZOe6hJQFp0pXVZ2k7xY5zGZRqYH0QX0X0.', 'Administrator', 'super_admin', TRUE);

-- ============================================
-- GRANT PERMISSIONS (if using specific user)
-- ============================================
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_db_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_db_user;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO your_db_user;

-- ============================================
-- COMPLETION MESSAGE
-- ============================================
SELECT 'Ghana Chef Association Database Schema Created Successfully!' AS message;
SELECT 'Membership Types Seeded: ' || COUNT(*)::TEXT AS membership_types FROM membership_types;
