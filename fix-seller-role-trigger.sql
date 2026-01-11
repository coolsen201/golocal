-- Fix seller role registration issue
-- Run this in Supabase SQL Editor to update the trigger
-- URL: https://supabase.com/dashboard/project/gjpzmvhcryvgogmhvjxq/sql

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_role_value user_role;
BEGIN
    -- Safely get role from metadata, default to 'buyer'
    user_role_value := CASE 
        WHEN NEW.raw_user_meta_data->>'role' = 'seller' THEN 'seller'::user_role
        WHEN NEW.raw_user_meta_data->>'role' = 'admin' THEN 'admin'::user_role
        ELSE 'buyer'::user_role
    END;
    
    INSERT INTO public.profiles (id, full_name, avatar_url, role)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url',
        user_role_value
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
