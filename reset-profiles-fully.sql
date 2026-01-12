-- reset-profiles-fully.sql
-- WARNING: This will DROP and RECREATE the profiles table.
-- Existing profile data will be LOST. Use only if you are okay with a fresh start.

-- 1. Drop existing objects to ensure a clean slate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TABLE IF EXISTS public.profiles CASCADE; 

-- 2. Ensure Types Exist (Idempotent)
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'seller', 'buyer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE seller_status AS ENUM ('none', 'pending', 'approved', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Re-create Profiles Table with ALL required columns
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    role user_role DEFAULT 'buyer'::user_role,
    approval_status seller_status DEFAULT 'none'::seller_status,
    
    -- KYC / Seller Fields
    mobile_number TEXT,
    residential_address TEXT,
    is_individual BOOLEAN DEFAULT FALSE,
    business_type TEXT,
    nature_of_business TEXT,
    business_address TEXT,
    aadhaar_card_url TEXT,
    selfie_url TEXT,
    shop_photo_url TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable RLS and Basic Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Public profiles are viewable by everyone"
        ON public.profiles FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Users can update own profile"
        ON public.profiles FOR UPDATE USING (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Users can insert own profile"
        ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 5. Re-create the Trigger Function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    new_role user_role;
    raw_role text;
BEGIN
    -- Extract role safely
    raw_role := NEW.raw_user_meta_data->>'role';

    -- Validate and cast role
    CASE raw_role
        WHEN 'seller' THEN new_role := 'seller'::user_role;
        WHEN 'admin' THEN new_role := 'buyer'::user_role; -- No auto-admin from signup
        ELSE new_role := 'buyer'::user_role;
    END CASE;

    INSERT INTO public.profiles (
        id, 
        full_name, 
        avatar_url, 
        role, 
        approval_status
    )
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
        new_role,
        CASE 
            WHEN new_role = 'seller' THEN 'pending'::seller_status 
            ELSE 'none'::seller_status 
        END
    )
    ON CONFLICT (id) DO UPDATE SET
        role = EXCLUDED.role,
        full_name = COALESCE(EXCLUDED.full_name, profiles.full_name);
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Re-bind the Trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. Ensure Storage Buckets (Optional - Permission Sensitive)
-- Commenting out to avoid "must be owner of table objects" error.
-- Ensure you create the 'kyc-documents' bucket in the Supabase Dashboard if it doesn't exist.

/* 
INSERT INTO storage.buckets (id, name, public) 
VALUES ('kyc-documents', 'kyc-documents', true)
ON CONFLICT (id) DO NOTHING;

DO $$ BEGIN
    CREATE POLICY "Any authenticated user can upload KYC docs"
    ON storage.objects FOR INSERT TO authenticated
    WITH CHECK ( bucket_id = 'kyc-documents' );
EXCEPTION WHEN OTHERS THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Users can view their own KYC docs"
    ON storage.objects FOR SELECT TO authenticated
    USING ( bucket_id = 'kyc-documents' );
EXCEPTION WHEN OTHERS THEN null; END $$;
*/
