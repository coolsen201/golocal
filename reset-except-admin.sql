-- RESET DATABASE EXCEPT ADMIN
-- This wipes all data but KEEPS the 'CEO-senthil' account safe.

-- 1. Clear Dependent Tables First
DELETE FROM public.inventory_items;

DELETE FROM public.shops;

-- 2. Delete all profiles EXCEPT 'CEO-senthil'
-- This effectively removes them from the app logic, 
-- though their login (auth.users) might still exist in Supabase Auth.
DELETE FROM public.profiles 
WHERE full_name != 'CEO-senthil';

-- 3. Verify Result
SELECT * FROM public.profiles;
