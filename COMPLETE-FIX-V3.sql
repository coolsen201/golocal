-- COMPLETE FIX for Seller Registration & Profile Creation
-- Run this in Supabase SQL Editor

-- 1. Create a robust handle_new_user function that SAFELY handles roles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_role_value public.user_role;
    user_approval_status TEXT;
BEGIN
    -- Determine role from metadata, strictly validating against allowed values
    user_role_value := CASE 
        WHEN NEW.raw_user_meta_data->>'role' = 'seller' THEN 'seller'::public.user_role
        WHEN NEW.raw_user_meta_data->>'role' = 'admin' THEN 'admin'::public.user_role
        ELSE 'buyer'::public.user_role
    END;

    -- Determine approval status (sellers start as 'pending')
    user_approval_status := CASE
        WHEN user_role_value = 'seller' THEN 'pending'
        WHEN user_role_value = 'admin' THEN 'approved' -- Admins auto-approved for now, or use 'pending' if preferred
        ELSE 'approved' -- Buyers are auto-approved
    END;

    INSERT INTO public.profiles (id, full_name, role, approval_status, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        user_role_value,
        user_approval_status,
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
        role = EXCLUDED.role,
        approval_status = EXCLUDED.approval_status,
        updated_at = NOW();

    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Ensure the trigger is properly attached
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. (Optional) Retroactively fix the specific broken user if possible
-- Note: We can't insert into profiles easily if we don't have the ID, but the user can re-register or admin can fix.
-- This script primarily fixes FUTURE registrations.
