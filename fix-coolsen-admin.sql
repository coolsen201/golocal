-- Check and Fix Admin Role for coolsen2010@yahoo.com

-- Step 1: Check current role
SELECT p.id, p.full_name, p.role, u.email 
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'coolsen2010@yahoo.com';

-- Step 2: Update to admin (run this if role is not 'admin')
UPDATE public.profiles 
SET role = 'admin' 
WHERE id = (
    SELECT id 
    FROM auth.users 
    WHERE email = 'coolsen2010@yahoo.com'
);

-- Step 3: Verify it worked
SELECT p.id, p.full_name, p.role, u.email 
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'coolsen2010@yahoo.com';

-- Expected result: role should show 'admin'
