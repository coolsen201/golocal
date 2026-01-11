-- Make ANY existing user an admin
-- Option 1: Use the test seller account you already have
UPDATE public.profiles 
SET role = 'admin' 
WHERE id = (
    SELECT id 
    FROM auth.users 
    WHERE email = 'toxasoy243@akixpres.com'  -- Your test seller account
);

-- OR Option 2: If you have a different account, replace the email
-- UPDATE public.profiles 
-- SET role = 'admin' 
-- WHERE id = (
--     SELECT id 
--     FROM auth.users 
--     WHERE email = 'your-email-here@example.com'
-- );

-- Verify it worked
SELECT profiles.id, profiles.full_name, users.email, profiles.role 
FROM public.profiles 
JOIN auth.users ON profiles.id = users.id
WHERE profiles.role = 'admin';
