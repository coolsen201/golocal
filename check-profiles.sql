-- DIAGNOSTIC: Check Profiles vs Users
-- Run this to see what's actually in your database

SELECT 
    u.email, 
    u.created_at as user_created_at,
    p.full_name, 
    p.role, 
    p.approval_status
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
ORDER BY u.created_at DESC;
