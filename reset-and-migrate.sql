-- 1. Schema Migration: Ensure 'shops' has location columns
-- Using DO block to check and add columns safely if they don't exist (Postgres)

DO $$ 
BEGIN 
    -- latitude
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='shops' AND column_name='latitude') THEN
        ALTER TABLE shops ADD COLUMN latitude DOUBLE PRECISION DEFAULT 0;
    END IF;

    -- longitude
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='shops' AND column_name='longitude') THEN
        ALTER TABLE shops ADD COLUMN longitude DOUBLE PRECISION DEFAULT 0;
    END IF;

    -- full_address
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='shops' AND column_name='full_address') THEN
        ALTER TABLE shops ADD COLUMN full_address TEXT;
    END IF;

    -- area
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='shops' AND column_name='area') THEN
        ALTER TABLE shops ADD COLUMN area TEXT;
    END IF;

    -- city
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='shops' AND column_name='city') THEN
        ALTER TABLE shops ADD COLUMN city TEXT;
    END IF;

    -- state
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='shops' AND column_name='state') THEN
        ALTER TABLE shops ADD COLUMN state TEXT;
    END IF;

    -- pincode
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='shops' AND column_name='pincode') THEN
        ALTER TABLE shops ADD COLUMN pincode TEXT;
    END IF;
END $$;

-- 2. Hard Data Reset
-- Clear all transactional and profile data to start fresh with new schema
DO $$
BEGIN
    -- Sales
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'sales') THEN
        TRUNCATE TABLE sales CASCADE;
    END IF;

    -- Inventory Items
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'inventory_items') THEN
        TRUNCATE TABLE inventory_items CASCADE;
    END IF;

    -- Shops
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'shops') THEN
        TRUNCATE TABLE shops CASCADE;
    END IF;
END $$;

-- Clear non-admin profiles
DELETE FROM profiles WHERE role != 'admin'; 
