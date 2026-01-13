import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import Barcode from 'react-barcode';
import { Scan, Printer, Plus, Save, Map as MapIcon, RefreshCw, Lock, Unlock } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet marker icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Sub-categories Data
const SUB_CATEGORIES = {
    'Groceries': ['Fruits', 'Vegetables', 'Dairy', 'Snacks', 'Beverages', 'Staples'],
    'Electronics': ['Mobile', 'Laptop', 'Accessories', 'Home Appliances'],
    'Clothing': ['Men', 'Women', 'Kids', 'Accessories'],
    'Hardware': ['Tools', 'Plumbing', 'Electrical', 'Paint'],
};

const AddProduct = () => {
    const [loading, setLoading] = useState(false);
    const [saveStatus, setSaveStatus] = useState(null);

    const [product, setProduct] = useState({
        name: '',
        category: 'Groceries',
        subCategory: 'Fruits',
        price: '',
        minOrderQty: '',
        bulkPricePerUnit: '',
        barcode: '',
        imageUrl: '',
        description: '',
        location: {
            latitude: 12.9716,
            longitude: 80.2534,
            area: 'T. Nagar',
            city: 'Chennai',
            state: 'TN',
            pincode: ''
        },
        useShopLocation: true // Toggle for location Strategy
    });

    const [shopLocation, setShopLocation] = useState(null); // Base Shop Location
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    useEffect(() => {
        const fetchShopDetails = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: shop } = await supabase
                .from('shops')
                .select('*')
                .eq('owner_id', user.id)
                .single();

            if (shop) {
                const shopLoc = {
                    latitude: shop.latitude || 12.9716,
                    longitude: shop.longitude || 80.2534,
                    area: shop.area || '',
                    city: shop.city || '',
                    state: shop.state || '',
                    pincode: shop.pincode || ''
                };
                setShopLocation(shopLoc);
                // Initialize product location with Shop Location if useShopLocation is true
                setProduct(prev => ({
                    ...prev,
                    location: shopLoc,
                    area: shop.area,
                }));
            }
        };

        fetchShopDetails();
    }, []);

    // Update sub-category when main category changes
    useEffect(() => {
        const subs = SUB_CATEGORIES[product.category] || [];
        if (subs.length > 0) {
            setProduct(prev => ({ ...prev, subCategory: subs[0] }));
        } else {
            setProduct(prev => ({ ...prev, subCategory: '' }));
        }
    }, [product.category]);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const previewUrl = URL.createObjectURL(file);

        setProduct(prev => ({
            ...prev,
            imageUrl: previewUrl
        }));

        // Production Logic: Extract Name from Filename
        setIsAnalyzing(true);
        setTimeout(() => {
            setIsAnalyzing(false);

            // 1. Extract Name (remove extension and special chars)
            const fileName = file.name.split('.').slice(0, -1).join('.');
            const cleanName = fileName
                .replace(/[-_]/g, ' ') // Replace dashes/underscores with spaces
                .replace(/[0-9]/g, '') // Remove numbers (optional, keeps 'Ginger1' as 'Ginger')
                .trim();

            // Capitalize First Letter of each word
            const formattedName = cleanName.replace(/\w\S*/g, (w) => (w.replace(/^\w/, (c) => c.toUpperCase())));

            // 2. Simple Heuristic for Category (Optional but helpful)
            let detectedCategory = 'Groceries'; // Default
            const nameLower = formattedName.toLowerCase();

            if (['phone', 'laptop', 'cable', 'charge', 'screen'].some(k => nameLower.includes(k))) {
                detectedCategory = 'Electronics';
            } else if (['shirt', 'pant', 'dress', 'shoe', 'wear'].some(k => nameLower.includes(k))) {
                detectedCategory = 'Clothing';
            } else if (['tool', 'pipe', 'paint', 'drill'].some(k => nameLower.includes(k))) {
                detectedCategory = 'Hardware';
            }

            setProduct(prev => ({
                ...prev,
                name: formattedName || prev.name, // Use extracted name or keep existing
                category: detectedCategory,
                imageUrl: previewUrl
            }));
        }, 1500); // Short delay to simulate processing
    };

    const generateBarcode = () => {
        const timestamp = Date.now().toString().slice(-12);
        setProduct({ ...product, barcode: timestamp });
    };

    const calculateBulkTotal = () => {
        if (product.minOrderQty && product.bulkPricePerUnit) {
            return (Number(product.minOrderQty) * Number(product.bulkPricePerUnit)).toFixed(2);
        }
        return '0.00';
    };

    const handleSave = async () => {
        setLoading(true);
        setSaveStatus(null);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            let { data: shopData } = await supabase
                .from('shops')
                .select('id')
                .eq('owner_id', user.id)
                .single();

            // Create shop if missing (fallback)
            if (!shopData) {
                const { data: newShop } = await supabase
                    .from('shops')
                    .insert([{
                        name: 'My Shop',
                        owner_id: user.id,
                        latitude: product.location.latitude,
                        longitude: product.location.longitude,
                        image_url: 'https://via.placeholder.com/150'
                    }])
                    .select()
                    .single();
                shopData = newShop;
            }

            // Insert Product with Location
            const { error: productError } = await supabase
                .from('inventory_items')
                .insert([{
                    shop_id: shopData.id,
                    name: product.name,
                    category: product.category,
                    sub_category: product.subCategory, // Fixed in schema? If not, ignore
                    description: product.description,
                    image_url: product.imageUrl,
                    barcode: product.barcode,
                    quantity_in_stock: 100,
                    cost_per_unit: parseFloat(product.price) || 0,
                    min_moq: parseInt(product.minOrderQty) || 1,
                    bulk_moq_cost: parseFloat(product.bulkPricePerUnit) || null,
                    // **NEW**: Per Item Location Logic
                    // If using Shop Location, save NULL so it stays linked to Shop
                    // If Custom, save the specific coordinates
                    latitude: product.useShopLocation ? null : product.location.latitude,
                    longitude: product.useShopLocation ? null : product.location.longitude,
                    full_address: product.useShopLocation ? null : `${product.location.area}, ${product.location.city}`
                }]);

            if (productError) throw productError;

            setSaveStatus('success');
            setTimeout(() => setSaveStatus(null), 3000);

        } catch (error) {
            console.error('Error saving:', error);
            setSaveStatus('error');
        } finally {
            setLoading(false);
        }
    };

    // Component to handle map clicks/drags for specific item location
    const MapEvents = () => {
        useMapEvents({
            click(e) {
                if (!product.useShopLocation) {
                    setProduct(prev => ({
                        ...prev,
                        location: {
                            ...prev.location,
                            latitude: e.latlng.lat,
                            longitude: e.latlng.lng
                        }
                    }));
                }
            }
        });
        return null;
    };

    const MapUpdater = ({ center }) => {
        const map = useMap();
        useEffect(() => {
            map.flyTo(center, 13);
        }, [center, map]);
        return null;
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg my-10 border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                <Plus className="w-6 h-6 text-blue-600" />
                Add New Product
            </h2>

            <div className="space-y-6">

                {/* Smart Image Search */}
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                    <h3 className="text-sm font-bold text-blue-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                        {isAnalyzing ? (
                            <>
                                <Scan className="w-5 h-5 animate-spin" />
                                Analyzing Image with AI...
                            </>
                        ) : (
                            <>Step 1: Smart Product Lookup</>
                        )}
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                        <label className="cursor-pointer bg-white border border-gray-200 p-4 rounded-xl flex flex-col items-center gap-2 hover:bg-gray-50 transition shadow-sm">
                            <span className="text-3xl">📁</span>
                            <span className="text-sm font-bold text-gray-700">Gallery</span>
                            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                        </label>
                        <label className="cursor-pointer bg-white border border-gray-200 p-4 rounded-xl flex flex-col items-center gap-2 hover:bg-gray-50 transition shadow-sm">
                            <span className="text-3xl">📸</span>
                            <span className="text-sm font-bold text-gray-700">Camera</span>
                            <input type="file" accept="image/*" capture="environment" onChange={handleImageUpload} className="hidden" />
                        </label>
                    </div>

                    {/* Image Preview - WAS MISSING */}
                    {product.imageUrl && (
                        <div className="mt-4 flex justify-center">
                            <img src={product.imageUrl} alt="Preview" className="h-40 rounded-lg shadow-md border border-gray-200" />
                        </div>
                    )}
                </div>

                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Product Name</label>
                        <input
                            type="text"
                            className="w-full p-3 border border-gray-300 rounded-lg outline-none"
                            placeholder="e.g. Red Apple"
                            value={product.name}
                            onChange={(e) => setProduct({ ...product, name: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Category</label>
                        <select
                            className="w-full p-3 border border-gray-300 rounded-lg bg-white"
                            value={product.category}
                            onChange={(e) => setProduct({ ...product, category: e.target.value })}
                        >
                            {Object.keys(SUB_CATEGORIES).map(cat => (
                                <option key={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Sub Category</label>
                        <select
                            className="w-full p-3 border border-gray-300 rounded-lg bg-white"
                            value={product.subCategory}
                            onChange={(e) => setProduct({ ...product, subCategory: e.target.value })}
                        >
                            {SUB_CATEGORIES[product.category]?.map(sub => (
                                <option key={sub}>{sub}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Pricing Section */}
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Pricing Strategy</h3>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Per Unit Price (₹)</label>
                            <input
                                type="number"
                                className="w-full p-3 border border-gray-300 rounded-lg"
                                placeholder="40.00"
                                value={product.price}
                                onChange={(e) => setProduct({ ...product, price: e.target.value })}
                            />
                        </div>

                        <div className="pt-4 border-t border-gray-200">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3">Bulk Pricing (Optional)</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs text-gray-600">Min Order Qty</label>
                                    <input
                                        type="number"
                                        className="w-full p-2 border border-gray-300 rounded-lg"
                                        placeholder="10"
                                        value={product.minOrderQty}
                                        onChange={(e) => setProduct({ ...product, minOrderQty: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs text-gray-600">Bulk Price / Unit (₹)</label>
                                    <input
                                        type="number"
                                        className="w-full p-2 border border-gray-300 rounded-lg"
                                        placeholder="35.00"
                                        value={product.bulkPricePerUnit}
                                        onChange={(e) => setProduct({ ...product, bulkPricePerUnit: e.target.value })}
                                    />
                                </div>
                            </div>
                            {product.minOrderQty && product.bulkPricePerUnit && (
                                <div className="mt-3 text-sm text-green-700 bg-green-50 p-2 rounded flex justify-between items-center">
                                    <span>Total for {product.minOrderQty} units:</span>
                                    <span className="font-bold">₹{calculateBulkTotal()}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Barcode Section */}
                <div className="border-2 border-dashed border-gray-300 p-6 rounded-xl text-center">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Barcode</h3>
                        <button
                            onClick={generateBarcode}
                            className="text-sm text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
                        >
                            <Scan className="w-4 h-4" /> Auto-Generate
                        </button>
                    </div>

                    <div className="flex flex-col items-center justify-center min-h-[100px] bg-white p-4 rounded-lg shadow-sm">
                        {product.barcode ? (
                            <>
                                <Barcode value={product.barcode} width={2} height={60} fontSize={14} />
                            </>
                        ) : (
                            <span className="text-gray-400 text-sm">No barcode generated yet</span>
                        )}
                    </div>
                </div>

                {/* Shop Location Strategy */}
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                            Item Location
                        </h3>
                        <button
                            onClick={() => {
                                const newVal = !product.useShopLocation;
                                setProduct(prev => ({
                                    ...prev,
                                    useShopLocation: newVal,
                                    // If locking back to shop, reset coords
                                    location: newVal && shopLocation ? shopLocation : prev.location
                                }));
                            }}
                            className={`text-xs px-3 py-1 rounded-full border flex items-center gap-1 transition-all ${product.useShopLocation ? 'bg-blue-100 text-blue-700 border-blue-300' : 'bg-orange-100 text-orange-700 border-orange-300'}`}
                        >
                            {product.useShopLocation ? <><Lock className="w-3 h-3" /> Shop Default</> : <><Unlock className="w-3 h-3" /> Custom Location</>}
                        </button>
                    </div>

                    <div className="h-64 rounded-lg overflow-hidden border border-gray-300 shadow-sm relative z-0 mb-4">
                        <MapContainer
                            center={[product.location.latitude, product.location.longitude]}
                            zoom={13}
                            style={{ height: '100%', width: '100%' }}
                        >
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            {/* Make marker draggable ONLY if custom location is enabled */}
                            <Marker
                                position={[product.location.latitude, product.location.longitude]}
                                draggable={!product.useShopLocation}
                                eventHandlers={{
                                    dragend: (e) => {
                                        const marker = e.target;
                                        const position = marker.getLatLng();
                                        setProduct(prev => ({
                                            ...prev,
                                            location: {
                                                ...prev.location,
                                                latitude: position.lat,
                                                longitude: position.lng
                                            }
                                        }));
                                    }
                                }}
                            />
                            <MapUpdater center={[product.location.latitude, product.location.longitude]} />
                            <MapEvents />
                        </MapContainer>
                    </div>

                    {!product.useShopLocation && (
                        <p className="text-xs text-orange-600 mt-2">
                            * You are setting a custom location for this item.
                        </p>
                    )}
                </div>

                {/* Actions */}
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className={`w-full text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex justify-center items-center gap-2 ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                >
                    {loading ? <span>Saving...</span> : <><Save className="w-5 h-5" /> Save Product to Inventory</>}
                </button>
                {saveStatus === 'success' && <div className="mt-4 p-4 bg-green-100 text-green-700 text-center rounded-lg">Product saved successfully!</div>}
                {saveStatus === 'error' && <div className="mt-4 p-4 bg-red-100 text-red-700 text-center rounded-lg">Error saving product.</div>}
            </div>
        </div>
    );
};

export default AddProduct;
