-- Set coolsen2010@yahoo.com as Admin
-- Run this in Supabase SQL Editor

UPDATE public.profiles 
SET role = 'admin' 
WHERE id = (
    SELECT id 
    FROM auth.users 
    WHERE email = 'coolsen2010@yahoo.com'
);

-- Verify the update
SELECT profiles.id, profiles.full_name, users.email, profiles.role 
FROM public.profiles 
JOIN auth.users ON profiles.id = users.id
WHERE users.email = 'coolsen2010@yahoo.com';
