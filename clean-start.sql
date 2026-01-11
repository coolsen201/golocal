-- Clean Start: Delete All Test Users
-- Run this in Supabase SQL Editor to start fresh
-- WARNING: This will delete ALL users and profiles!

-- Step 1: Delete all profiles first (due to foreign key constraints)
DELETE FROM public.profiles;

-- Step 2: Delete all auth users (this cascades to profiles too)
DELETE FROM auth.users;

-- Step 3: Verify everything is clean
SELECT COUNT(*) as profile_count FROM public.profiles;
SELECT COUNT(*) as user_count FROM auth.users;

-- You should see 0 for both counts

-- ============================================================================
-- AFTER RUNNING THE ABOVE:
-- ============================================================================
-- 1. Register your ADMIN account first:
--    - Go to http://localhost:5173/register
--    - Email: coolsen2010@yahoo.com
--    - Name: CEO- senthil
--    - Password: (your choice)
--    - Role: Select either (doesn't matter, we'll change it)
--    - Check email and confirm
--
-- 2. Make it admin with this SQL:
--    UPDATE public.profiles 
--    SET role = 'admin' 
--    WHERE id = (SELECT id FROM auth.users WHERE email = 'coolsen2010@yahoo.com');
--
-- 3. Register a TEST SELLER account:
--    - Go to http://localhost:5173/register
--    - Email: (any test email)
--    - Select Role: 🏪 Seller
--    - Check email and confirm
--    - Should redirect to Seller Verification form
--    - Fill out and submit
--
-- 4. Log in as ADMIN and approve the seller:
--    - Login with coolsen2010@yahoo.com
--    - Click "Admin" → "Approvals" 
--    - Click "✓ Approve"
--
-- 5. Test complete seller flow!
-- ============================================================================
