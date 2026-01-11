-- FIX: Add Missing Foreign Key Constraint
-- The 'shops' table has an 'owner_id' column, but it's not linked to 'profiles'.
-- This causes the "Bad Request" error when trying to join them in the API.

ALTER TABLE public.shops
ADD CONSTRAINT shops_owner_id_fkey
FOREIGN KEY (owner_id)
REFERENCES public.profiles(id)
ON DELETE CASCADE;

-- Verify the constraint was added
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'shops'
AND kcu.column_name = 'owner_id';
