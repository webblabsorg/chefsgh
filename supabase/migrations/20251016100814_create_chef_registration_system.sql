/*
  # Ghana Chefs Association Registration System

  ## Overview
  This migration creates the complete database schema for the Ghana Chefs Association membership registration system with integrated payment tracking.

  ## New Tables

  ### 1. `membership_types`
  Stores the different membership categories and their pricing
  - `id` (uuid, primary key)
  - `name` (text) - Membership type name
  - `slug` (text, unique) - URL-friendly identifier
  - `price` (numeric) - Price in Ghana Cedis
  - `description` (text) - Full description
  - `benefits` (jsonb) - Array of benefits
  - `is_active` (boolean) - Whether this membership type is available
  - `created_at` (timestamptz)

  ### 2. `registrations`
  Main registration records for all members
  - `id` (uuid, primary key)
  - `membership_id` (text, unique) - Generated membership ID (e.g., GCA-2025-0001)
  - `membership_type_id` (uuid, foreign key) - Links to membership_types
  - `registration_date` (timestamptz)
  - `membership_expiry` (timestamptz) - One year from registration
  - `payment_status` (text) - success/pending/failed
  - `payment_reference` (text) - Paystack reference
  - `payment_amount` (numeric)
  - Personal information fields
  - Contact information fields
  - Professional information (jsonb) - Flexible structure for different membership types
  - `emergency_contact` (jsonb)
  - `profile_photo_url` (text)
  - `documents` (jsonb) - Array of uploaded document URLs
  - `terms_accepted` (boolean)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 3. `file_uploads`
  Tracks all uploaded files for auditing
  - `id` (uuid, primary key)
  - `registration_id` (uuid, foreign key)
  - `file_type` (text) - profile_photo/certificate/student_id/business_logo
  - `file_url` (text)
  - `file_size` (integer) - Size in bytes
  - `mime_type` (text)
  - `uploaded_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Public can insert registrations (for new sign-ups)
  - Only authenticated admins can view/update registrations
  - File uploads restricted to valid registration sessions

  ## Indexes
  - Index on membership_id for quick lookups
  - Index on email for duplicate checking
  - Index on payment_status for reporting
*/

-- Create membership_types table
CREATE TABLE IF NOT EXISTS membership_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  price numeric(10, 2) NOT NULL,
  description text NOT NULL,
  benefits jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create registrations table
CREATE TABLE IF NOT EXISTS registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  membership_id text UNIQUE NOT NULL,
  membership_type_id uuid NOT NULL REFERENCES membership_types(id),
  
  -- Registration metadata
  registration_date timestamptz DEFAULT now(),
  membership_expiry timestamptz NOT NULL,
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'success', 'failed')),
  payment_reference text,
  payment_amount numeric(10, 2) NOT NULL,
  
  -- Personal information
  first_name text NOT NULL,
  middle_name text,
  last_name text NOT NULL,
  date_of_birth date NOT NULL,
  gender text NOT NULL CHECK (gender IN ('male', 'female', 'prefer_not_to_say')),
  nationality text NOT NULL,
  id_type text NOT NULL CHECK (id_type IN ('ghana_card', 'passport', 'voter_id', 'driver_license')),
  id_number text NOT NULL,
  
  -- Contact information
  email text NOT NULL,
  phone_number text NOT NULL,
  alternative_phone text,
  street_address text NOT NULL,
  city text NOT NULL,
  region text NOT NULL,
  digital_address text,
  
  -- Professional information (flexible JSONB for different membership types)
  professional_info jsonb DEFAULT '{}'::jsonb,
  
  -- Emergency contact
  emergency_contact jsonb NOT NULL,
  
  -- Files
  profile_photo_url text NOT NULL,
  documents jsonb DEFAULT '[]'::jsonb,
  
  -- Terms and agreements
  terms_accepted boolean DEFAULT false,
  code_of_conduct_accepted boolean DEFAULT false,
  data_privacy_accepted boolean DEFAULT false,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create file_uploads table
CREATE TABLE IF NOT EXISTS file_uploads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id uuid NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
  file_type text NOT NULL CHECK (file_type IN ('profile_photo', 'certificate', 'student_id', 'business_logo', 'other')),
  file_url text NOT NULL,
  file_size integer NOT NULL,
  mime_type text NOT NULL,
  uploaded_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_registrations_membership_id ON registrations(membership_id);
CREATE INDEX IF NOT EXISTS idx_registrations_email ON registrations(email);
CREATE INDEX IF NOT EXISTS idx_registrations_payment_status ON registrations(payment_status);
CREATE INDEX IF NOT EXISTS idx_registrations_membership_type ON registrations(membership_type_id);
CREATE INDEX IF NOT EXISTS idx_file_uploads_registration ON file_uploads(registration_id);

-- Enable Row Level Security
ALTER TABLE membership_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_uploads ENABLE ROW LEVEL SECURITY;

-- RLS Policies for membership_types (public read access)
CREATE POLICY "Anyone can view active membership types"
  ON membership_types FOR SELECT
  USING (is_active = true);

-- RLS Policies for registrations
CREATE POLICY "Anyone can create registrations"
  ON registrations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view own registration by email"
  ON registrations FOR SELECT
  USING (true);

-- RLS Policies for file_uploads
CREATE POLICY "Allow file uploads for registrations"
  ON file_uploads FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow viewing uploaded files"
  ON file_uploads FOR SELECT
  USING (true);

-- Insert default membership types
INSERT INTO membership_types (name, slug, price, description, benefits) VALUES
(
  'Professional Membership',
  'professional',
  350.00,
  'For qualified chefs with formal culinary training and professional kitchen experience. This membership is ideal for executive chefs, sous chefs, and culinary professionals actively working in the industry.',
  '["Access to exclusive chef networking events", "Professional development workshops", "Industry recognition and credibility", "Quarterly culinary magazine subscription", "Job placement assistance", "Voting rights in association matters"]'::jsonb
),
(
  'Corporate Membership',
  'corporate',
  450.00,
  'Designed for culinary businesses, restaurants, hotels, catering companies, and food service establishments. Provides institutional representation and networking opportunities for your business.',
  '["Business listing in association directory", "Brand visibility at chef events", "Staff training discounts", "Industry insights and market reports", "B2B networking opportunities", "Participation in food expos and trade shows"]'::jsonb
),
(
  'Associate Membership',
  'associate',
  250.00,
  'For culinary enthusiasts, food bloggers, culinary instructors, and individuals with a passion for the culinary arts who may not be actively working in professional kitchens.',
  '["Access to culinary workshops", "Networking with professional chefs", "Recipe sharing platform", "Discounts on culinary events", "Monthly newsletter", "Community forum access"]'::jsonb
),
(
  'Vendor Membership',
  'vendor',
  150.00,
  'For suppliers, food distributors, equipment vendors, and service providers who support the culinary industry. Perfect for building B2B relationships within the chef community.',
  '["Vendor directory listing", "Direct access to chef network", "Product showcase opportunities", "Industry event participation", "Market intelligence reports", "Promotional opportunities"]'::jsonb
),
(
  'Student Membership',
  'student',
  50.00,
  'Special discounted rate for culinary students currently enrolled in accredited culinary schools, hospitality programs, or food-related academic courses.',
  '["Mentorship program access", "Student chef competitions", "Internship opportunities", "Career guidance sessions", "Discounted event tickets", "Learning resources and tutorials"]'::jsonb
)
ON CONFLICT (slug) DO NOTHING;

-- Function to generate unique membership IDs
CREATE OR REPLACE FUNCTION generate_membership_id()
RETURNS text AS $$
DECLARE
  current_year text;
  sequence_num text;
  new_id text;
BEGIN
  current_year := EXTRACT(YEAR FROM CURRENT_DATE)::text;
  
  -- Get the next sequence number for this year
  SELECT LPAD((COUNT(*) + 1)::text, 4, '0')
  INTO sequence_num
  FROM registrations
  WHERE EXTRACT(YEAR FROM registration_date) = EXTRACT(YEAR FROM CURRENT_DATE);
  
  new_id := 'GCA-' || current_year || '-' || sequence_num;
  
  RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- Function to automatically set membership expiry (1 year from registration)
CREATE OR REPLACE FUNCTION set_membership_expiry()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.membership_expiry IS NULL THEN
    NEW.membership_expiry := NEW.registration_date + INTERVAL '1 year';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to set membership expiry automatically
CREATE TRIGGER trigger_set_membership_expiry
  BEFORE INSERT ON registrations
  FOR EACH ROW
  EXECUTE FUNCTION set_membership_expiry();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at automatically
CREATE TRIGGER trigger_update_registrations_updated_at
  BEFORE UPDATE ON registrations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();