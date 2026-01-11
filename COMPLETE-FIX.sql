-- COMPLETE FIX FOR SELLER REGISTRATION ISSUE
-- Run this entire script in Supabase SQL Editor
-- URL: https://supabase.com/dashboard/project/gjpzmvhcryvgogmhvjxq/sql

-- ============================================================================
-- STEP 1: Create missing profile for current user
-- ============================================================================
-- This user registered but has no profile because trigger failed
INSERT INTO public.profiles (id, full_name, role, approval_status)
VALUES (
    'fb9f11ce-a61d-4f40-ba43-3838e263c9a9',
    'Test Seller',  -- You can change this name
    'seller',
    'none'
)
ON CONFLICT (id) DO UPDATE SET
    role = 'seller',
    approval_status = 'none';

-- ============================================================================
-- STEP 2: Fix the trigger (remove exception handler to see errors)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Log for debugging
    RAISE NOTICE 'Creating profile for user: %', NEW.id;
    RAISE NOTICE 'User metadata: %', NEW.raw_user_meta_data;
    
    INSERT INTO public.profiles (id, full_name, avatar_url, role, approval_status)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
        'buyer'::user_role,  -- Default, will be updated by AuthCallback
        'none'::seller_status
    )
    ON CONFLICT (id) DO NOTHING;
    
    RAISE NOTICE 'Profile created successfully for: %', NEW.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- STEP 3: Verify the trigger is attached
-- ============================================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- STEP 4: Verify RLS policies are correct
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Recreate policies
CREATE POLICY "Public profiles are viewable by everyone" 
    ON public.profiles FOR SELECT 
    USING (true);

CREATE POLICY "Users can update own profile" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
    ON public.profiles FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- ============================================================================
-- STEP 5: Grant necessary permissions
-- ============================================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.profiles TO anon, authenticated;
GRANT ALL ON public.inventory_items TO authenticated;
GRANT ALL ON public.shops TO authenticated;

-- ============================================================================
-- VERIFICATION QUERIES (check results after running)
-- ============================================================================

-- Check if the profile was created
SELECT id, full_name, role, approval_status, created_at 
FROM public.profiles 
WHERE id = 'fb9f11ce-a61d-4f40-ba43-3838e263c9a9';

-- Check if trigger exists
SELECT trigger_name, event_manipulation, event_object_table 
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Check RLS policies
SELECT schemaname, tablename, policyname, roles, cmd 
FROM pg_policies 
WHERE tablename = 'profiles';

-- ============================================================================
-- NOTES:
-- ============================================================================
-- After running this script:
-- 1. Try logging in with the existing seller account
-- 2. You should now see the Seller Verification form
-- 3. Test creating a NEW seller account to verify trigger works
-- ============================================================================
