-- fix-database-schema.sql
-- Run this script to Ensure ALL Schema requirements are met

-- 1. Create Types if they don't exist
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

-- 2. Ensure Profiles Table Exists
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Add Columns Safely (Idempotent)
DO $$ BEGIN
    ALTER TABLE public.profiles ADD COLUMN role user_role DEFAULT 'buyer'::user_role;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE public.profiles ADD COLUMN approval_status seller_status DEFAULT 'none'::seller_status;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- KYC Columns
DO $$ BEGIN
    ALTER TABLE public.profiles ADD COLUMN residential_address TEXT;
EXCEPTION WHEN duplicate_column THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE public.profiles ADD COLUMN is_individual BOOLEAN DEFAULT FALSE;
EXCEPTION WHEN duplicate_column THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE public.profiles ADD COLUMN nature_of_business TEXT;
EXCEPTION WHEN duplicate_column THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE public.profiles ADD COLUMN aadhaar_card_url TEXT;
EXCEPTION WHEN duplicate_column THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE public.profiles ADD COLUMN selfie_url TEXT;
EXCEPTION WHEN duplicate_column THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE public.profiles ADD COLUMN shop_photo_url TEXT;
EXCEPTION WHEN duplicate_column THEN null; END $$;

-- 4. Re-Define Trigger with Safety Checks
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    new_role user_role;
    raw_role text;
BEGIN
    -- Extract role safely from metadata
    raw_role := NEW.raw_user_meta_data->>'role';

    -- Validate and cast role
    CASE raw_role
        WHEN 'seller' THEN new_role := 'seller'::user_role;
        WHEN 'admin' THEN new_role := 'buyer'::user_role; -- No auto-admin
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
    ON CONFLICT (id) 
    DO UPDATE SET
        full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
        role = EXCLUDED.role,
        updated_at = NOW();
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
        -- Return NEW to allow signup even if profile creation fails (logs will show why)
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Ensure Trigger is Bound
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
