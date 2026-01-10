# GoLocal - Hyperlocal Inventory

**GoLocal** (ScanKalambu) is a platform connecting local sellers with nearby buyers through real-time inventory discovery.

## 🚀 Features

### For Sellers
- **Smart Add**: Upload an image to auto-detect product details.
- **Inventory Management**: Set unit prices, bulk MOQs, and bulk pricing.
- **Barcode Support**: Auto-generate unique EAN-13 barcodes for printing.
- **Location**: Automatic GPS tagging of shops.

### For Buyers
- **Map Discovery**: Find products on an interactive map.
- **Price Transparency**: See exact unit prices on map markers.
- **Smart Search**: Filter by product name (e.g., "Apple", "Hammer") within a 5-20km radius.

## 🛠️ Technology Stack
- **Frontend**: React, Vite, TailwindCSS v4
- **Maps**: Leaflet, React-Leaflet
- **Backend & Database**: Supabase (PostgreSQL)

## 📦 Setup & Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/coolsen201/golocal.git
   cd golocal
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   Create `.env.local` with your Supabase credentials:
   ```env
   VITE_SUPABASE_KEY=your_key_here
   VITE_SUPABASE_URL=your_url_here
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

## 📄 License
Private Project.
