-- STEP 1: Disable the faulty trigger
-- Run this to allow registration to succeed without "Database error"

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- After running this:
-- 1. Go to http://localhost:5173/register
-- 2. Register a new user (e.g., testseller@akixpres.com)
-- 3. It will succeed (but won't create a profile yet)
