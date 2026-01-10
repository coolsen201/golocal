# GoLocal (ScanKalambu) - Hyperlocal Inventory Platform

**Version**: 1.0.0  
**Last Updated**: January 10, 2026  
**Repository**: https://github.com/coolsen201/golocal

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Technology Stack](#technology-stack)
4. [Setup & Installation](#setup--installation)
5. [Database Schema](#database-schema)
6. [User Flows](#user-flows)
7. [Cost Analysis](#cost-analysis)
8. [Deployment](#deployment)
9. [Future Enhancements](#future-enhancements)

---

## 🎯 Overview

**GoLocal** is a hyperlocal inventory discovery platform connecting local sellers with nearby buyers through real-time map-based search. Sellers can list products with pricing, location, and barcodes, while buyers can discover products on an interactive map and get instant directions to shops.

### **Core Concept**
- **Sellers**: Add products with smart image recognition, bulk pricing, and auto-generated barcodes
- **Buyers**: Search products by category/name, view on map, and navigate to shops

---

## ✨ Features

### **Seller Interface** (`AddProduct.jsx`)

#### 1. Smart Product Entry
- **Mock Image Upload**: Upload product image to auto-fill details (name, description, price)
- **Manual Entry**: Edit all auto-filled fields

#### 2. Pricing Strategy
- **Per Unit Price**: Standard retail price
- **Bulk Pricing**: Minimum order quantity (MOQ) with discounted bulk price
- **Auto-calculation**: Total bulk cost displayed automatically

#### 3. Barcode Generation
- **Auto-generate**: Creates unique EAN-13 compatible barcodes
- **Print Ready**: Display barcode for printing stickers
- **Library**: Uses `react-barcode`

#### 4. Location Tracking
- **GPS Mock**: Pre-filled latitude/longitude (Chennai default)
- **Manual Pincode**: 6-digit pincode entry for testing
- **Address Display**: Area, City, State auto-displayed

#### 5. Supabase Integration
- **Shop Creation**: First-time sellers get a demo shop created
- **Product Save**: All inventory items linked to shop ID
- **Persistent Storage**: Data stored in PostgreSQL via Supabase

---

### **Buyer Interface** (`BuyerMap.jsx`)

#### 1. Interactive Map
- **Library**: Leaflet + OpenStreetMap (100% free)
- **Full Screen**: Fixed positioning for mobile-friendly UX
- **Tile Server**: `tile.openstreetmap.org`

#### 2. Smart Search
- **Category Filter**: Dropdown (Groceries, Electronics, Clothing, Hardware, All)
- **Autocomplete**: Real-time product name suggestions from database
- **Radius Selection**: 5km, 10km, 20km search radius

#### 3. Map Markers
- **User Location**: Blue marker showing "You are here"
- **Product Markers**: Green price badges (₹45, ₹100, etc.)
- **Custom Icons**: `L.divIcon` with TailwindCSS styling

#### 4. Shop Popup
- **Shop Details**: Name, city, product name
- **Pricing**: Per-unit price + bulk pricing (if available)
- **Actions**:
  - **📍 Get Directions**: Opens Google Maps/Apple Maps for navigation
  - **🛒 Reserve**: Placeholder for future booking feature

#### 5. Navigation Integration
- **Universal URL**: `https://www.google.com/maps/dir/?api=1&destination=LAT,LONG`
- **Cross-Platform**: Works on Android, iOS, Desktop
- **No API Key Required**: Uses Google Maps web URL scheme

---

## 🛠️ Technology Stack

### **Frontend**
- **Framework**: React 18.3.1
- **Build Tool**: Vite 6.0.5
- **Styling**: TailwindCSS v4 (`@tailwindcss/postcss`)
- **Icons**: Lucide React
- **Barcode**: react-barcode

### **Maps**
- **Library**: Leaflet 1.9.4 + React-Leaflet 4.2.1
- **Tiles**: OpenStreetMap (free)
- **Markers**: Custom `L.divIcon` with TailwindCSS

### **Backend & Database**
- **BaaS**: Supabase
- **Database**: PostgreSQL
- **Client**: @supabase/supabase-js 2.49.2
- **Storage**: Supabase Storage (for future image uploads)

### **Development**
- **Linting**: ESLint 9.17.0
- **Version Control**: Git + GitHub

---

## 📦 Setup & Installation

### **Prerequisites**
- Node.js 16+ and npm
- Supabase account (free tier)
- Git

### **1. Clone Repository**
```bash
git clone https://github.com/coolsen201/golocal.git
cd golocal
```

### **2. Install Dependencies**
```bash
npm install
```

### **3. Environment Setup**
Create `.env.local` in the project root:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_KEY=your-anon-key-here
```

**Get Supabase Credentials:**
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create a new project
3. Go to Settings → API
4. Copy `URL` and `anon/public` key

### **4. Database Setup**
Run the SQL schema in Supabase SQL Editor:
```bash
# Copy contents of schema.sql
# Paste in Supabase Dashboard → SQL Editor → Run
```

### **5. Run Development Server**
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173)

---

## 🗄️ Database Schema

### **Tables**

#### `shops`
Stores seller shop information.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `created_at` | TIMESTAMPTZ | Auto-generated |
| `name` | TEXT | Shop name |
| `owner_id` | UUID | Links to auth.users (future) |
| `latitude` | DOUBLE PRECISION | GPS coordinate |
| `longitude` | DOUBLE PRECISION | GPS coordinate |
| `area` | TEXT | Neighborhood/area |
| `pincode` | TEXT | 6-digit postal code |
| `city` | TEXT | City name |
| `state` | TEXT | State code (e.g., TN) |
| `full_address` | TEXT | Complete address |
| `image_url` | TEXT | Shop photo URL |

#### `inventory_items`
Stores product listings linked to shops.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `shop_id` | UUID | Foreign key → shops(id) |
| `created_at` | TIMESTAMPTZ | Auto-generated |
| `name` | TEXT | Product name |
| `description` | TEXT | Product details |
| `category` | TEXT | Groceries/Electronics/etc. |
| `image_url` | TEXT | Product photo URL |
| `barcode` | TEXT | EAN-13 barcode |
| `quantity_in_stock` | INTEGER | Available quantity |
| `cost_per_unit` | NUMERIC(10,2) | Per-unit price (₹) |
| `min_moq` | INTEGER | Minimum order quantity |
| `bulk_moq_cost` | NUMERIC(10,2) | Bulk price per unit |

### **Indexes**
- `idx_shops_location`: B-tree on (latitude, longitude)
- `idx_inventory_name`: GIN full-text search on product names

---

## 👥 User Flows

### **Seller Flow**

1. **Open App** → Toggle to Seller View
2. **Upload Product Image** (optional mock)
   - Auto-fills: Name, Description, Price
3. **Edit Details**
   - Category, Price, Bulk Pricing
4. **Generate Barcode** (auto or manual)
5. **Enter Pincode** (manual for testing)
6. **Save Product**
   - Creates shop (first time)
   - Inserts inventory item
   - Shows success message

### **Buyer Flow**

1. **Open App** → Toggle to Buyer View
2. **Select Category** (optional filter)
3. **Type Product Name**
   - Autocomplete suggestions appear
   - Click suggestion or press Enter
4. **View Results on Map**
   - Green price markers appear
5. **Click Marker** → Popup shows:
   - Shop name, product, price
   - Bulk pricing (if available)
6. **Get Directions**
   - Opens Google Maps/Apple Maps
   - Navigation ready to shop location
7. **Reserve** (future feature)

---

## 💰 Cost Analysis

### **Current Setup (FREE)**

| Service | Tier | Cost |
|---------|------|------|
| **Supabase** | Free | $0/month |
| **Leaflet + OSM** | Open Source | $0/month |
| **Vercel/Netlify** | Hobby | $0/month |
| **GitHub** | Public Repo | $0/month |
| **TOTAL** | | **$0/month** |

### **Supabase Free Tier Limits**
- 500MB Database Storage
- 2GB Bandwidth/month
- 50,000 Monthly Active Users
- Suitable for: MVP, testing, small-scale production

### **Google Maps Alternative (Optional)**

If you switch from Leaflet to Google Maps:

| Usage | Cost per 1,000 | Estimate (10K users/month) |
|-------|---------------|---------------------------|
| Map Loads | $7.00 | $70 |
| Geocoding | $5.00 | $5 |
| Places API | $17.00 | $8.50 |
| **TOTAL** | | **~$84/month** |

**Google Cloud Free Credit**: $200/month  
**Net Cost for Testing**: $0 (within free tier)

### **Recommendation**
- **MVP/Testing**: Use current setup (Leaflet) - $0
- **Production**: Monitor usage, stay on Leaflet unless you need Google features
- **Scale**: Switch to Google Maps only if you need geocoding, places search, or better UX

---

## 🚀 Deployment

### **Option 1: Vercel (Recommended)**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel Dashboard
# Settings → Environment Variables
# VITE_SUPABASE_URL
# VITE_SUPABASE_KEY
```

### **Option 2: Netlify**

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build
npm run build

# Deploy
netlify deploy --prod --dir=dist
```

### **Environment Variables**
Both platforms require:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_KEY`

Add these in the platform's dashboard under Settings → Environment Variables.

---

## 🔮 Future Enhancements

### **Phase 2: Authentication & Admin** (In Planning)
- [ ] **User Authentication**
  - Email/password login
  - Google OAuth sign-in
  - Role-based access (Admin/Seller/Buyer)
  - Session management
- [ ] **Admin Dashboard**
  - Full inventory view (all sellers)
  - Sales tracking and analytics
  - User management
  - Real-time updates
- [ ] **Seller Inventory Management**
  - List view of own products
  - Inline editing (stock, price)
  - Product deletion
  - Sales history
- [ ] **Android Mobile App**
  - Capacitor integration
  - APK build for testing
  - Camera permissions (for barcode scanner)
  - Push notifications

### **Phase 3: Core Features**
- [ ] Real image upload to Supabase Storage
- [ ] Actual GPS location detection (browser geolocation API)
- [ ] Barcode scanner using device camera
- [ ] User authentication (Supabase Auth)
- [ ] Seller dashboard (view/edit products)

### **Phase 2: Buyer Experience**
- [ ] Product reservation system
- [ ] In-app messaging (buyer ↔ seller)
- [ ] Reviews and ratings
- [ ] Favorites/wishlist
- [ ] Order history

### **Phase 3: Advanced**
- [ ] Real-time inventory updates
- [ ] Push notifications
- [ ] Payment integration
- [ ] Delivery tracking
- [ ] Analytics dashboard

### **Phase 4: Scale**
- [ ] Multi-language support
- [ ] PWA (Progressive Web App)
- [ ] Native mobile apps (React Native)
- [ ] Seller analytics
- [ ] Admin panel

---

## 📞 Support & Contact

**Developer**: Antigravity AI  
**Repository**: [github.com/coolsen201/golocal](https://github.com/coolsen201/golocal)  
**License**: Private Project

---

## 📝 Changelog

### **v1.0.0** (2026-01-10)
- ✅ Seller interface with Smart Add, Barcode, Bulk Pricing
- ✅ Buyer map with Category filter + Autocomplete
- ✅ Supabase integration (shops + inventory_items)
- ✅ Leaflet map with OpenStreetMap tiles
- ✅ Get Directions integration (Google Maps/Apple Maps)
- ✅ Pincode manual entry for testing
- ✅ GitHub repository setup
- ✅ Complete documentation

---

**Built with ❤️ for local businesses and communities**
