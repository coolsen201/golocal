-- FINAL ROBUST FIX
-- Use this to fix the "NULL" profile issue completely.

-- 1. Ensure the user_role ENUM exists. 
-- We prefer 'buyer'/'seller'/'admin'. If it doesn't exist, create it.
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE public.user_role AS ENUM ('admin', 'seller', 'buyer');
    END IF;
END $$;

-- 2. Redefine the trigger function with extra safety
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
DECLARE
    meta_role text;
    final_role public.user_role;
    final_status text;
BEGIN
    -- Extract role from metadata safely
    meta_role := NEW.raw_user_meta_data->>'role';

    -- Logic to determine role and status
    IF meta_role = 'seller' THEN
        final_role := 'seller'::public.user_role;
        final_status := 'pending';
    ELSIF meta_role = 'admin' THEN
        final_role := 'admin'::public.user_role;
        final_status := 'approved';
    ELSE
        final_role := 'buyer'::public.user_role;
        final_status := 'approved';
    END IF;

    -- Insert profile
    INSERT INTO public.profiles (id, full_name, role, approval_status, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
        final_role,
        final_status,
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        approval_status = EXCLUDED.approval_status,
        updated_at = NOW();

    RETURN NEW;
EXCEPTION 
    WHEN OTHERS THEN
        -- If something crashes (like Enum mismatch), create a fallback BUYER profile
        -- so the user isn't broken.
        RAISE WARNING 'Trigger failed for user %. Error: %', NEW.id, SQLERRM;
        
        INSERT INTO public.profiles (id, full_name, role, approval_status)
        VALUES (
            NEW.id, 
            COALESCE(NEW.raw_user_meta_data->>'full_name', 'Fallback User'),
             'buyer', 
             'approved'
        )
        ON CONFLICT (id) DO NOTHING;
        
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Re-attach the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. RETROACTIVE FIX: Find users who have NO profile and insert one for them
-- This fixes the "vaselac134" and "logirih962" issues immediately.
INSERT INTO public.profiles (id, full_name, role, approval_status)
SELECT 
    id, 
    COALESCE(raw_user_meta_data->>'full_name', 'Restored User'),
    CASE 
        WHEN raw_user_meta_data->>'role' = 'seller' THEN 'seller'::public.user_role 
        WHEN raw_user_meta_data->>'role' = 'admin' THEN 'admin'::public.user_role 
        ELSE 'buyer'::public.user_role 
    END,
    CASE 
        WHEN raw_user_meta_data->>'role' = 'seller' THEN 'pending' 
        ELSE 'approved' 
    END
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles);
