-- FORCE FIX: Create Profiles for ALL Users who are missing them
-- This script finds every user in auth.users that doesn't have a profile
-- and creates a "pending seller" profile for them.

DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT u.id, u.email 
        FROM auth.users u
        LEFT JOIN public.profiles p ON u.id = p.id
        WHERE p.id IS NULL -- Only missing profiles
    LOOP
        RAISE NOTICE 'Creating missing profile for: %', r.email;
        
        INSERT INTO public.profiles (id, full_name, role, approval_status)
        VALUES (
            r.id, 
            split_part(r.email, '@', 1), -- Use part of email as name
            'seller',  -- Default everyone to seller for testing
            'pending'  -- Pending approval
        );
    END LOOP;
END $$;
