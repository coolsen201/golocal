-- update-seller-schema.sql
-- Run this in Supabase SQL Editor to support the new seller verification flow.

-- 1. Create registration status enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE seller_status AS ENUM ('none', 'pending', 'approved', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Add extra fields to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS mobile_number TEXT,
ADD COLUMN IF NOT EXISTS business_type TEXT,
ADD COLUMN IF NOT EXISTS business_address TEXT,
ADD COLUMN IF NOT EXISTS pan_number TEXT,
ADD COLUMN IF NOT EXISTS gstin TEXT,
ADD COLUMN IF NOT EXISTS bank_name TEXT,
ADD COLUMN IF NOT EXISTS account_number TEXT,
ADD COLUMN IF NOT EXISTS ifsc_code TEXT,
ADD COLUMN IF NOT EXISTS approval_status seller_status DEFAULT 'none',
ADD COLUMN IF NOT EXISTS identity_doc_url TEXT,
ADD COLUMN IF NOT EXISTS business_doc_url TEXT,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- 3. Update existing profiles
-- If they are already a seller, they might need to go through the 'none' -> 'pending' flow.
UPDATE profiles 
SET approval_status = 'none' 
WHERE role = 'seller' AND approval_status IS NULL;

-- 4. Additional indexes for admin dashboard performance
CREATE INDEX IF NOT EXISTS idx_profiles_approval_status ON profiles(approval_status);
