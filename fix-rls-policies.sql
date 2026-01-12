-- fix-rls-policies.sql
-- Run this to fix "RLS Disabled" errors and set up proper security

-- 1. Enable RLS on Shops table
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;

-- Shops Policies (Drop first to avoid conflicts if re-running)
DROP POLICY IF EXISTS "Public view shops" ON public.shops;
CREATE POLICY "Public view shops" ON public.shops FOR SELECT USING (true);

DROP POLICY IF EXISTS "Owner manage shops" ON public.shops;
CREATE POLICY "Owner manage shops" ON public.shops FOR ALL 
USING (auth.uid() = owner_id);

-- 2. Enable RLS on Inventory Items
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;

-- Inventory Policies
DROP POLICY IF EXISTS "Public view inventory" ON public.inventory_items;
CREATE POLICY "Public view inventory" ON public.inventory_items FOR SELECT USING (true);

DROP POLICY IF EXISTS "Owner manage inventory" ON public.inventory_items;
CREATE POLICY "Owner manage inventory" ON public.inventory_items FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.shops 
        WHERE shops.id = inventory_items.shop_id 
        AND shops.owner_id = auth.uid()
    )
);

-- 3. HELPER: How to restore Admin Access
-- After you register your admin user (via the signup page), run the command below:
-- UPDATE public.profiles SET role = 'admin'::user_role WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@golocal.com');
