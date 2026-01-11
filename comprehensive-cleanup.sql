-- COMPREHENSIVE CLEANUP AND CHECK
-- Run this in Supabase SQL Editor

-- Step 1: Check what users exist
SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC;

-- Step 2: Check what profiles exist
SELECT id, full_name, role, email 
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
ORDER BY p.created_at DESC;

-- Step 3: Delete everything (if needed)
-- ONLY RUN IF YOU SEE OLD DATA ABOVE
TRUNCATE TABLE public.profiles CASCADE;

-- Step 4: Delete auth users via Supabase admin
-- Note: You may need to delete auth.users from Supabase Dashboard
-- Go to: Authentication → Users → Select all → Delete

-- Step 5: After cleanup, temporarily DISABLE the trigger so registration works
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Step 6: Now try registering coolsen2010@yahoo.com via the UI
-- The profile won't be created automatically, but registration will work

-- Step 7: Manually create the admin profile after registration
-- Replace 'USER_ID_HERE' with the actual ID from the registration
-- You can find it by running: SELECT id FROM auth.users WHERE email = 'coolsen2010@yahoo.com';

-- INSERT INTO public.profiles (id, full_name, role, approval_status)
-- VALUES (
--     'USER_ID_HERE',
--     'CEO- senthil',
--     'admin',
--     'none'
-- );

-- Step 8: Re-enable the trigger after you have the admin account working
-- CREATE TRIGGER on_auth_user_created
--     AFTER INSERT ON auth.users
--     FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
