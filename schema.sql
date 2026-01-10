-- Hyperlocal Inventory Schema

-- 1. Shops Table (Sellers)
CREATE TABLE shops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    name TEXT NOT NULL,
    owner_id UUID, -- Links to auth.users
    
    -- Location Details
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    area TEXT,
    pincode TEXT,
    city TEXT,
    state TEXT,
    full_address TEXT,
    
    image_url TEXT
);

-- 2. Products Table (Master List of Items - Optional, or just store in Inventory)
-- To allow "Smart Search", consistent naming is better, but for MVP we might store per-shop.
-- Let's stick to the user's "Shop -> Item" flow.

CREATE TABLE inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Item Details
    name TEXT NOT NULL, -- "Red Apple", "Socket Wrench"
    description TEXT,
    category TEXT,
    image_url TEXT,
    barcode TEXT, -- Scanned or Auto-generated EAN-13
    
    -- Smart Search Meta
    tags TEXT[], -- ["fruit", "fresh", "apple"]
    
    -- Inventory & Pricing
    quantity_in_stock INTEGER DEFAULT 0,
    cost_per_unit NUMERIC(10,2) NOT NULL, -- One Unit Price
    
    -- Bulk / MOQ
    min_moq INTEGER DEFAULT 1,
    bulk_moq_cost NUMERIC(10,2) -- Cost when buying MOQ
    
    -- Derived/Computed:
    -- geometry column for PostGIS would act on shop_id location
);

-- Index for Radius Search (using basic lat/long box or PostGIS if available)
CREATE INDEX idx_shops_location ON shops(latitude, longitude);
CREATE INDEX idx_inventory_name ON inventory_items USING gin(to_tsvector('english', name));
