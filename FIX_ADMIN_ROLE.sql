-- CHECK AND FIX ADMIN ROLE
-- Run this in Supabase SQL Editor

-- 1. Check the current profile for the user
SELECT * FROM public.profiles 
WHERE id = (SELECT id FROM auth.users WHERE email = 'coolsen2010@yahoo.com');

-- 2. If the role is NOT 'admin', fix it explicitly
UPDATE public.profiles
SET role = 'admin'::public.user_role,
    approval_status = 'approved'::public.seller_status -- Ensure they are approved
WHERE id = (SELECT id FROM auth.users WHERE email = 'coolsen2010@yahoo.com');

-- 3. Verify the fix
SELECT * FROM public.profiles 
WHERE id = (SELECT id FROM auth.users WHERE email = 'coolsen2010@yahoo.com');
