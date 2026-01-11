-- STEP 2 (ROBUST VERSION): Create Profile for the LATEST User
-- This script automatically finds the most recently registered user
-- and creates a seller profile for them.

DO $$
DECLARE
    target_user_id UUID;
    target_email TEXT;
BEGIN
    -- Get the ID and Email of the most recently created user
    SELECT id, email INTO target_user_id, target_email
    FROM auth.users
    ORDER BY created_at DESC
    LIMIT 1;

    IF target_user_id IS NULL THEN
        RAISE EXCEPTION 'No users found in auth.users!';
    END IF;

    RAISE NOTICE 'Found latest user: % (ID: %)', target_email, target_user_id;

    -- Insert or Update the profile
    INSERT INTO public.profiles (id, full_name, email, role, approval_status)
    VALUES (
        target_user_id,
        'Test Seller',
        target_email,
        'seller',
        'pending'
    )
    ON CONFLICT (id) DO UPDATE
    SET role = 'seller', approval_status = 'pending';

    RAISE NOTICE 'SUCCESS: Seller profile created for %. Go to Admin Dashboard to approve.', target_email;
END $$;
