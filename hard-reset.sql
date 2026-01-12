-- Hard Reset: Clear all application data
-- Cascading deletes should handle dependencies, but doing it explicitly for clarity

TRUNCATE TABLE sales CASCADE;
TRUNCATE TABLE inventory_items CASCADE;
TRUNCATE TABLE shops CASCADE;

-- Be careful with profiles as it links to auth.users. 
-- If we delete profiles, we might break auth sync if we don't delete auth users too.
-- For now, let's clear data but keep the table structure. 
-- Ideally, user should also delete users from Supabase Auth dashboard for a FULL reset.
DELETE FROM profiles WHERE role != 'admin'; 
