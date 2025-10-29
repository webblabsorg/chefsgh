/*
  # Create Storage Bucket for Registration Files

  ## Overview
  Creates a public storage bucket for storing registration files including profile photos,
  certificates, student IDs, and business logos.

  ## Storage Setup
  - Create 'registration-files' bucket
  - Set bucket to public for easy access
  - Add storage policies for uploads

  ## Security
  - Allow public read access to uploaded files
  - Allow authenticated uploads during registration
*/

-- Create the storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('registration-files', 'registration-files', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to upload files (for registration)
CREATE POLICY "Allow public uploads"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'registration-files');

-- Allow anyone to view uploaded files
CREATE POLICY "Allow public access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'registration-files');

-- Allow updating file metadata
CREATE POLICY "Allow file updates"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'registration-files')
  WITH CHECK (bucket_id = 'registration-files');
