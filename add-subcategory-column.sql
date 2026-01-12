-- Add sub_category column to inventory_items table

ALTER TABLE public.inventory_items 
ADD COLUMN IF NOT EXISTS sub_category TEXT DEFAULT NULL;

-- Verify it was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'inventory_items' AND column_name = 'sub_category';
