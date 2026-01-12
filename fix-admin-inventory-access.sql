
-- Fix Admin Access (Updated)
-- We use DROP IF EXISTS to avoid errors if you run it multiple times.

-- 1. SHOPS
DROP POLICY IF EXISTS "Admins can view all shops" ON public.shops;
DROP POLICY IF EXISTS "Public view shops" ON public.shops;

-- Re-create Public View (Base)
CREATE POLICY "Public view shops" ON public.shops FOR SELECT USING (true);

-- Re-create Admin View (Explicit)
CREATE POLICY "Admins can view all shops" ON public.shops 
FOR SELECT 
USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );


-- 2. INVENTORY
DROP POLICY IF EXISTS "Admins can view all inventory" ON public.inventory_items;
DROP POLICY IF EXISTS "Public view inventory" ON public.inventory_items;

-- Re-create Public View (Base)
CREATE POLICY "Public view inventory" ON public.inventory_items FOR SELECT USING (true);

-- Re-create Admin View (Explicit)
CREATE POLICY "Admins can view all inventory" ON public.inventory_items 
FOR SELECT 
USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );


-- 3. VERIFY ROLE
-- Check if you are actually an admin
SELECT id, role FROM public.profiles WHERE id = auth.uid();
