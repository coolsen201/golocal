-- fix-security-and-linter.sql
-- Fixes Supabase Linter Warnings

-- 1. Fix "Function Search Path Mutable"
-- This ensures the trigger function only looks in the 'public' schema, preventing hijacking.
ALTER FUNCTION public.handle_new_user() SET search_path = public;

-- 2. Fix "RLS Disabled in Public"
-- Ensuring RLS is enabled on all tables (idempotent)
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Grant usage on schema to anon/authenticated (standard fix for some 500s)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated;
