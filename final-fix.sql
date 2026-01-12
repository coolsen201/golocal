-- FINAL FIX SCRIPT (Run this to solve 400 & 406 Errors)

-- PART 1: FIX DATABASE RELATIONSHIPS (Solves HTTP 400 on Admin Dashboard)
-- Explicitly link tables so joins work
ALTER TABLE public.shops DROP CONSTRAINT IF EXISTS shops_owner_id_fkey;
ALTER TABLE public.shops ADD CONSTRAINT shops_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.profiles(id);

ALTER TABLE public.inventory_items DROP CONSTRAINT IF EXISTS inventory_items_shop_id_fkey;
ALTER TABLE public.inventory_items ADD CONSTRAINT inventory_items_shop_id_fkey FOREIGN KEY (shop_id) REFERENCES public.shops(id);

-- PART 2: CREATE MISSING SHOPS (Solves HTTP 406 on Seller Dashboard)
-- If a seller has no shop, 406 error occurs. This creates a default shop for them.
INSERT INTO public.shops (owner_id, name, latitude, longitude, area, city, state, pincode, full_address, image_url)
SELECT 
    id, 
    'My Shop', -- Default Name
    12.9716, 
    80.2534, 
    'T. Nagar', 
    'Chennai', 
    'TN', 
    '600017', 
    'T. Nagar, Chennai', 
    'https://via.placeholder.com/150'
FROM public.profiles 
WHERE role = 'seller' 
AND NOT EXISTS (SELECT 1 FROM public.shops WHERE owner_id = profiles.id);

-- PART 3: RE-APPLY RLS (Just in case)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;

-- Allow public read access (essential for dashboards to see data)
DROP POLICY IF EXISTS "Public view shops" ON public.shops;
CREATE POLICY "Public view shops" ON public.shops FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public view inventory" ON public.inventory_items;
CREATE POLICY "Public view inventory" ON public.inventory_items FOR SELECT USING (true);
