-- CHECK FOR DUPLICATE SHOPS
-- Run this in Supabase SQL Editor

SELECT 
    owner_id, 
    COUNT(*) as shop_count,
    array_agg(id) as shop_ids,
    array_agg(created_at) as created_dates
FROM 
    public.shops
GROUP BY 
    owner_id
HAVING 
    COUNT(*) > 1;

-- Also check for orphaned inventory items (items with invalid shop_id)
SELECT * FROM public.inventory_items 
WHERE shop_id NOT IN (SELECT id FROM public.shops);
