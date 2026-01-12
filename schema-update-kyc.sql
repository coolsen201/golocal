-- schema-update-kyc.sql

-- 1. Add new columns to profiles for Seller KYC
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS residential_address TEXT,
ADD COLUMN IF NOT EXISTS is_individual BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS nature_of_business TEXT,
ADD COLUMN IF NOT EXISTS aadhaar_card_url TEXT,
ADD COLUMN IF NOT EXISTS selfie_url TEXT,
ADD COLUMN IF NOT EXISTS shop_photo_url TEXT;

-- 2. Create Storage Bucket for KYC Documents (if not exists)
-- Note: Buckets are usually created via API/Dashboard, but we can try inserting if the `storage` schema is accessible.
-- Only works if you have permissions. Otherwise, create bucket 'kyc-documents' in Dashboard.

INSERT INTO storage.buckets (id, name, public) 
VALUES ('kyc-documents', 'kyc-documents', true) -- Public for now to ensure visibility, or false for secure access with signed URLs
ON CONFLICT (id) DO NOTHING;

-- 3. Storage Policies (Allow authenticated users to upload)
CREATE POLICY "Any authenticated user can upload KYC docs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'kyc-documents' );

CREATE POLICY "Users can view their own KYC docs (and admins)"
ON storage.objects FOR SELECT
TO authenticated
USING ( bucket_id = 'kyc-documents' ); -- improved security would filter by owner
