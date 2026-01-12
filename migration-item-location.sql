-- 1. Migration: Add Location Columns to Inventory Items
-- This allows each item to have a specific location (overriding the shop's default)

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='inventory_items' AND column_name='latitude') THEN
        ALTER TABLE inventory_items ADD COLUMN latitude DOUBLE PRECISION;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='inventory_items' AND column_name='longitude') THEN
        ALTER TABLE inventory_items ADD COLUMN longitude DOUBLE PRECISION;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='inventory_items' AND column_name='full_address') THEN
        ALTER TABLE inventory_items ADD COLUMN full_address TEXT;
    END IF;
END $$;

-- 2. Query to display all data from all three tables (Profiles -> Shops -> Items)
-- Run this to view your current data state
SELECT 
    p.full_name, 
    p.role, 
    s.name as shop_name, 
    s.latitude as shop_lat, 
    i.latitude as item_specific_lat, 
    i.longitude as item_specific_long,
    COALESCE(i.latitude, s.latitude) as effective_lat,
    COALESCE(i.longitude, s.longitude) as effective_long,
    i.quantity_in_stock
FROM profiles p
JOIN shops s ON p.id = s.owner_id
JOIN inventory_items i ON s.id = i.shop_id;
