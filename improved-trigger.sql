-- improved-trigger.sql

-- Ensure types exist locally if not already created
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'seller', 'buyer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE seller_status AS ENUM ('none', 'pending', 'approved', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    new_role user_role;
    raw_role text;
BEGIN
    -- Extract role safely
    raw_role := NEW.raw_user_meta_data->>'role';

    -- Validate and cast role
    CASE raw_role
        WHEN 'seller' THEN new_role := 'seller'::user_role;
        WHEN 'admin' THEN new_role := 'buyer'::user_role; -- Prevent auto-admin
        ELSE new_role := 'buyer'::user_role;
    END CASE;

    INSERT INTO public.profiles (
        id, 
        full_name, 
        avatar_url, 
        role, 
        approval_status
    )
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
        new_role,
        CASE 
            WHEN new_role = 'seller' THEN 'pending'::seller_status 
            ELSE 'none'::seller_status 
        END
    )
    ON CONFLICT (id) 
    DO UPDATE SET
        full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
        role = EXCLUDED.role,
        updated_at = NOW();
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
        -- Don't block signup, but maybe log it?
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
