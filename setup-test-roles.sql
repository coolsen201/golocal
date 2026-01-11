-- FINAL SETUP: Assign Roles to Specific Users
-- Run this to force your 3 users into their correct roles

-- 1. SETUP ADMIN (coolsen2010@yahoo.com)
INSERT INTO public.profiles (id, full_name, role, approval_status)
SELECT id, 'CEO- senthil', 'admin', 'approved'
FROM auth.users WHERE email = 'coolsen2010@yahoo.com'
ON CONFLICT (id) DO UPDATE 
SET role = 'admin', approval_status = 'approved';

-- 2. SETUP SELLER (cobix57144@akixpres.com)
-- We set this to 'pending' so you can approve it in the Admin Dashboard
INSERT INTO public.profiles (id, full_name, role, approval_status)
SELECT id, 'Test Seller', 'seller', 'pending'
FROM auth.users WHERE email = 'cobix57144@akixpres.com'
ON CONFLICT (id) DO UPDATE 
SET role = 'seller', approval_status = 'pending';

-- 3. SETUP BUYER (tapohov585@atinjo.com)
INSERT INTO public.profiles (id, full_name, role, approval_status)
SELECT id, 'Test Buyer', 'buyer', 'approved'
FROM auth.users WHERE email = 'tapohov585@atinjo.com'
ON CONFLICT (id) DO UPDATE 
SET role = 'buyer', approval_status = 'approved';

-- 4. VERIFY RESULTS
SELECT u.email, p.role, p.approval_status, p.full_name
FROM auth.users u
JOIN public.profiles p ON u.id = p.id
ORDER BY p.role;
