-- =====================================================
-- Phase 2: Authentication & Admin Schema Updates
-- =====================================================

-- 1. Create ENUM for user roles
CREATE TYPE user_role AS ENUM ('admin', 'seller', 'buyer');

-- 2. User Profiles Table (extends Supabase auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'buyer',
    full_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Sales Tracking Table
CREATE TABLE sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inventory_item_id UUID REFERENCES inventory_items(id) ON DELETE CASCADE,
    buyer_id UUID REFERENCES profiles(id),
    quantity_sold INTEGER NOT NULL CHECK (quantity_sold > 0),
    sale_price NUMERIC(10,2) NOT NULL,
    total_amount NUMERIC(10,2) GENERATED ALWAYS AS (quantity_sold * sale_price) STORED,
    sold_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Modify existing tables to link with users

-- Add owner_id to shops table
ALTER TABLE shops 
ADD COLUMN owner_id UUID REFERENCES profiles(id);

-- Add quantity_sold tracking to inventory_items
ALTER TABLE inventory_items 
ADD COLUMN quantity_sold INTEGER DEFAULT 0 CHECK (quantity_sold >= 0);

-- 5. Create indexes for performance
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_sales_item ON sales(inventory_item_id);
CREATE INDEX idx_sales_buyer ON sales(buyer_id);
CREATE INDEX idx_sales_date ON sales(sold_at);
CREATE INDEX idx_shops_owner ON shops(owner_id);

-- 6. Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read all profiles, but only update their own
CREATE POLICY "Public profiles are viewable by everyone"
    ON profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Shops: Everyone can view, only owners can modify
CREATE POLICY "Shops are viewable by everyone"
    ON shops FOR SELECT
    USING (true);

CREATE POLICY "Owners can insert their own shops"
    ON shops FOR INSERT
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their own shops"
    ON shops FOR UPDATE
    USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete their own shops"
    ON shops FOR DELETE
    USING (auth.uid() = owner_id);

-- Inventory Items: Everyone can view, only shop owners can modify
CREATE POLICY "Inventory items are viewable by everyone"
    ON inventory_items FOR SELECT
    USING (true);

CREATE POLICY "Shop owners can insert inventory items"
    ON inventory_items FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM shops 
            WHERE shops.id = shop_id 
            AND shops.owner_id = auth.uid()
        )
    );

CREATE POLICY "Shop owners can update their inventory items"
    ON inventory_items FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM shops 
            WHERE shops.id = shop_id 
            AND shops.owner_id = auth.uid()
        )
    );

CREATE POLICY "Shop owners can delete their inventory items"
    ON inventory_items FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM shops 
            WHERE shops.id = shop_id 
            AND shops.owner_id = auth.uid()
        )
    );

-- Sales: Buyers can view their own purchases, sellers can view their sales
CREATE POLICY "Users can view their own purchases"
    ON sales FOR SELECT
    USING (auth.uid() = buyer_id);

CREATE POLICY "Sellers can view sales of their items"
    ON sales FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM inventory_items i
            JOIN shops s ON i.shop_id = s.id
            WHERE i.id = sales.inventory_item_id
            AND s.owner_id = auth.uid()
        )
    );

CREATE POLICY "Buyers can insert sales"
    ON sales FOR INSERT
    WITH CHECK (auth.uid() = buyer_id);

-- 7. Functions and Triggers

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 8. Admin user setup (run this manually with your admin email)
-- UPDATE profiles SET role = 'admin' WHERE id = (SELECT id FROM auth.users WHERE email = 'your-admin-email@example.com');

-- 9. Useful views for admin dashboard

CREATE VIEW admin_inventory_overview AS
SELECT 
    p.full_name AS seller_name,
    p.phone AS seller_phone,
    s.name AS shop_name,
    i.name AS product_name,
    i.category,
    i.quantity_in_stock,
    i.quantity_sold,
    i.cost_per_unit,
    (i.quantity_in_stock * i.cost_per_unit) AS stock_value,
    i.created_at
FROM inventory_items i
JOIN shops s ON i.shop_id = s.id
JOIN profiles p ON s.owner_id = p.id
WHERE p.role = 'seller'
ORDER BY i.created_at DESC;

CREATE VIEW seller_sales_summary AS
SELECT 
    s.owner_id,
    p.full_name AS seller_name,
    COUNT(DISTINCT i.id) AS total_products,
    SUM(i.quantity_in_stock) AS total_stock,
    SUM(i.quantity_sold) AS total_sold,
    SUM(i.quantity_in_stock * i.cost_per_unit) AS inventory_value
FROM shops s
JOIN profiles p ON s.owner_id = p.id
LEFT JOIN inventory_items i ON s.id = i.shop_id
WHERE p.role = 'seller'
GROUP BY s.owner_id, p.full_name;
