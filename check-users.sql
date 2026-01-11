-- Check registered users
SELECT email, id, created_at FROM auth.users ORDER BY created_at DESC;
