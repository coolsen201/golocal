-- STEP 2: Manually create the Seller Profile
-- Run this AFTER registering the user in the browser

-- Replace with the email you just registered
DO $$
DECLARE
    target_email TEXT := 'cobix57144@akixpres.com'; -- CHANGE THIS to your registered email
    user_id UUID;
BEGIN
    -- Get the user ID
    SELECT id INTO user_id FROM auth.users WHERE email = target_email;

    IF user_id IS NULL THEN
        RAISE EXCEPTION 'User with email % not found. Did you register first?', target_email;
    END IF;

    -- Insert the profile
    INSERT INTO public.profiles (id, full_name, email, role, approval_status)
    VALUES (
        user_id,
        'Test Seller',
        target_email,
        'seller',
        'pending' -- Set to pending so it shows up in Admin Dashboard
    )
    ON CONFLICT (id) DO UPDATE
    SET role = 'seller', approval_status = 'pending';

    RAISE NOTICE 'Seller profile created for %', target_email;
END $$;
