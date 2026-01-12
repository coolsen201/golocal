-- debug-disable-trigger.sql
-- This script TEMPORARILY removes the automation to isolate the error.

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- We also make sure the profiles table is writable by RLS
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
