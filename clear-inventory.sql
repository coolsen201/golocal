-- CLEAN START
-- Run this to wipe all inventory and shops (but keep user accounts)

-- 1. Delete all Inventory Items
DELETE FROM public.inventory_items;

-- 2. Delete all Shops
DELETE FROM public.shops;

-- 3. Reset Seller Approval Status (Optional, if you want them to re-apply)
-- UPDATE public.profiles 
-- SET approval_status = 'pending' 
-- WHERE role = 'seller';

-- 4. Verify Empty State
SELECT COUNT(*) as inventory_count FROM public.inventory_items;
SELECT COUNT(*) as shop_count FROM public.shops;
