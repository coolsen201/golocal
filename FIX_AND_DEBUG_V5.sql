-- FIX V5: Correcting Enum Type Casting
-- The previous error showed that 'approval_status' is an ENUM type 'seller_status', not TEXT.

-- 1. Redefine the trigger function with correct casting
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
DECLARE
    meta_role text;
    final_role public.user_role;
    final_status public.seller_status; -- Changed variable type
BEGIN
    -- Extract role from metadata safely
    meta_role := NEW.raw_user_meta_data->>'role';

    -- Logic to determine role and status
    IF meta_role = 'seller' THEN
        final_role := 'seller'::public.user_role;
        final_status := 'pending'::public.seller_status;
    ELSIF meta_role = 'admin' THEN
        final_role := 'admin'::public.user_role;
        final_status := 'approved'::public.seller_status;
    ELSE
        final_role := 'buyer'::public.user_role;
        -- Buyers might not need a status, or default to 'approved' if the column is NOT NULL
        -- Assuming 'approved' is valid for buyers for simplicity, or use NULL if allowed.
        final_status := 'approved'::public.seller_status;
    END IF;

    -- Insert profile
    INSERT INTO public.profiles (id, full_name, role, approval_status, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
        final_role,
        final_status,
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        approval_status = EXCLUDED.approval_status,
        updated_at = NOW();

    RETURN NEW;
EXCEPTION 
    WHEN OTHERS THEN
        RAISE WARNING 'Trigger failed for user %. Error: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Re-attach trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. RETROACTIVE FIX with correct casting
INSERT INTO public.profiles (id, full_name, role, approval_status)
SELECT 
    id, 
    COALESCE(raw_user_meta_data->>'full_name', 'Restored User'),
    CASE 
        WHEN raw_user_meta_data->>'role' = 'seller' THEN 'seller'::public.user_role 
        WHEN raw_user_meta_data->>'role' = 'admin' THEN 'admin'::public.user_role 
        ELSE 'buyer'::public.user_role 
    END,
    CASE 
        WHEN raw_user_meta_data->>'role' = 'seller' THEN 'pending'::public.seller_status 
        ELSE 'approved'::public.seller_status 
    END
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles);
