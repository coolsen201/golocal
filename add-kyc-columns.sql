-- Migration: Add KYC Document Columns to Profiles
-- This ensures we can store and retrieve seller documents for admin approval

DO $$ 
BEGIN 
    -- 1. aadhaar_card_url
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='aadhaar_card_url') THEN
        ALTER TABLE profiles ADD COLUMN aadhaar_card_url TEXT;
    END IF;

    -- 2. selfie_url
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='selfie_url') THEN
        ALTER TABLE profiles ADD COLUMN selfie_url TEXT;
    END IF;

    -- 3. shop_photo_url
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='shop_photo_url') THEN
        ALTER TABLE profiles ADD COLUMN shop_photo_url TEXT;
    END IF;

END $$;
