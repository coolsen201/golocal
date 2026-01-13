import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Search, ShoppingBag, Map, LogOut, LogIn } from 'lucide-react';
import L from 'leaflet';

// Fix for Leaflet default markers in Vite
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: iconRetina,
    iconUrl: icon,
    shadowUrl: iconShadow,
});

// Custom Price Marker
const createPriceIcon = (price) => {
    return L.divIcon({
        className: 'custom-price-icon',
        html: `<div class="bg-green-600 text-white font-bold px-2 py-1 rounded-full shadow-lg border-2 border-white text-xs">₹${price}</div>`,
        iconSize: [40, 24],
        iconAnchor: [20, 24]
    });
};

// Sub-categories Data
// Removed in favor of dynamic Item Name fetching
// const SUB_CATEGORIES = { ... };

const BuyerMap = () => {
    const { user, profile, signOut } = useAuth();
    const [query, setQuery] = useState('');
    const [category, setCategory] = useState('All');
    const [itemName, setItemName] = useState(''); // Replaces subCategory
    const [results, setResults] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [userLocation, setUserLocation] = useState([12.9716, 80.2534]); // Chennai Default
    const [radius, setRadius] = useState(10); // km

    // Fetch product suggestions as user types
    const handleQueryChange = async (value) => {
        setQuery(value);

        if (value.length < 2) {
            setSuggestions([]);
            return;
        }

        // Fetch matching products from DB
        let query = supabase
            .from('inventory_items')
            .select('name')
            .ilike('name', `%${value}%`)
            .limit(5);

        if (category !== 'All') {
            query = query.eq('category', category);
        }

        const { data } = await query;
        if (data) {
            // Get unique product names
            const uniqueNames = [...new Set(data.map(item => item.name))];
            setSuggestions(uniqueNames);
        }
    };

    // Fetch Unique Item Names when Category changes
    useEffect(() => {
        const fetchItemNames = async () => {
            if (category === 'All') {
                setSuggestions([]);
                return;
            }

            const { data } = await supabase
                .from('inventory_items')
                .select('name')
                .eq('category', category);

            if (data) {
                const unique = [...new Set(data.map(i => i.name))];
                setSuggestions(unique);
            }
        };
        fetchItemNames();
    }, [category]);

    // Auto-Search when Category or Sub-Category changes
    useEffect(() => {
        handleSearch();
    }, [category, itemName]);

    const handleSearch = async () => {
        // Allow search with empty query to show all items
        // if (!query && category === 'All' && !itemName) return;

        setSuggestions([]); // Clear suggestions

        let searchQuery = supabase
            .from('inventory_items')
            .select(`
                *,
                shops (
                    name,
                    city,
                    latitude,
                    longitude
                )
            `);

        if (query) {
            searchQuery = searchQuery.ilike('name', `%${query}%`);
        }

        if (category !== 'All') {
            searchQuery = searchQuery.eq('category', category);
        }

        if (itemName) {
            searchQuery = searchQuery.eq('name', itemName);
        }

        const { data, error } = await searchQuery;

        if (error) {
            console.error('Search error', error);
            setResults([]);
        } else {
            setResults(data || []);
        }
    };

    // Map Component to auto-fit bounds to results
    const MapBoundsUpdater = ({ results, userLocation }) => {
        const map = useMap();

        useEffect(() => {
            if (results.length > 0) {
                // Use Item location (fallback to Shop Location)
                const bounds = L.latLngBounds(results.map(r => [
                    r.latitude || r.shops?.latitude || 0,
                    r.longitude || r.shops?.longitude || 0
                ]));
                bounds.extend(userLocation);
                map.flyToBounds(bounds, { padding: [50, 50], maxZoom: 15 });
            } else {
                map.flyTo(userLocation, 13);
            }
        }, [results, userLocation, map]);

        return null;
    };

    return (
        <div className="fixed inset-0 w-full h-screen">
            {/* Search Overlay - Moved to Bottom */}
            <div className="absolute bottom-6 left-4 right-4 z-[1000] max-w-2xl mx-auto pointer-events-none">
                <div className="bg-white/90 backdrop-blur-md p-3 rounded-xl shadow-2xl border border-gray-200 pointer-events-auto">
                    {/* Top Row: Category & Radius */}
                    <div className="flex gap-2 mb-3">
                        <select
                            className="flex-1 p-2 border border-gray-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-green-500 text-sm"
                            value={category}
                            onChange={(e) => {
                                setCategory(e.target.value);
                                setItemName('');
                            }}
                        >
                            <option value="All">All Categories</option>
                            <option value="Groceries">Groceries</option>
                            <option value="Electronics">Electronics</option>
                            <option value="Clothing">Clothing</option>
                            <option value="Hardware">Hardware</option>
                        </select>

                        {/* Item Name Dropdown (Replaces SubCategory) */}
                        {category !== 'All' && suggestions.length > 0 && (
                            <select
                                className="flex-1 p-2 border border-blue-500 rounded-lg bg-white outline-none focus:ring-2 focus:ring-green-500 text-sm"
                                value={itemName}
                                onChange={(e) => setItemName(e.target.value)}
                            >
                                <option value="">Select Specific Item (Found: {suggestions.length})</option>
                                {suggestions.map(name => (
                                    <option key={name} value={name}>{name}</option>
                                ))}
                            </select>
                        )}

                        <select
                            className="w-1/3 p-2 border border-gray-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-green-500 text-sm"
                            value={radius}
                            onChange={(e) => setRadius(e.target.value)}
                        >
                            <option value="5">5 km</option>
                            <option value="10">10 km</option>
                            <option value="20">20 km</option>
                        </select>
                    </div>

                    {/* Bottom Row: Search Input */}
                    <div className="relative">
                        <div className="flex gap-2">
                            <div className="flex-1 relative">
                                <div className="flex items-center bg-gray-50 border border-gray-300 rounded-lg px-3 py-1">
                                    <Search className="w-5 h-5 text-gray-500" />
                                    <input
                                        className="w-full bg-transparent p-2 outline-none text-gray-800 placeholder-gray-500 font-medium"
                                        placeholder="Search products..."
                                        value={query}
                                        onChange={(e) => handleQueryChange(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    />
                                </div>

                                {/* Autocomplete Suggestions (Expanding Upwards) */}
                                {suggestions.length > 0 && (
                                    <div className="absolute bottom-full mb-2 w-full bg-white border border-gray-200 rounded-lg shadow-xl z-20 overflow-hidden">
                                        {suggestions.map((suggestion, idx) => (
                                            <div
                                                key={idx}
                                                className="p-3 hover:bg-green-50 cursor-pointer text-sm font-medium text-gray-700 border-b last:border-0"
                                                onClick={() => {
                                                    setQuery(suggestion);
                                                    setSuggestions([]);
                                                    handleSearch();
                                                }}
                                            >
                                                {suggestion}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={handleSearch}
                                className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 transition shadow-md whitespace-nowrap"
                            >
                                Find
                            </button>

                            {/* Moved Navigation Buttons - Scaled Down */}
                            <div className="flex items-center gap-2 ml-2 transform scale-75 origin-left">
                                {/* Seller Views */}
                                {profile?.role === 'seller' && (
                                    <Link
                                        to="/seller"
                                        className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-semibold transition flex items-center hover:bg-white hover:text-green-600 hover:shadow whitespace-nowrap"
                                    >
                                        <ShoppingBag className="w-4 h-4 mr-1" />
                                        Seller Zone
                                    </Link>
                                )}

                                {/* Buyer View (Active) */}
                                <div className="px-3 py-2 bg-white text-green-600 rounded-lg text-sm font-semibold shadow border border-green-100 flex items-center whitespace-nowrap">
                                    <Map className="w-4 h-4 mr-1" />
                                    Buyer
                                </div>

                                {/* Sign Out / Login */}
                                {user ? (
                                    <button
                                        onClick={signOut}
                                        className="px-3 py-2 bg-red-100 text-red-700 rounded-lg font-semibold hover:bg-red-200 transition flex items-center gap-2 whitespace-nowrap"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Sign Out
                                    </button>
                                ) : (
                                    <Link
                                        to="/login"
                                        className="px-3 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition flex items-center gap-2 whitespace-nowrap"
                                    >
                                        <LogIn className="w-4 h-4" />
                                        Login
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Map */}
            <div className="absolute inset-0 z-0 bg-gray-200">
                <MapContainer
                    center={userLocation}
                    zoom={13}
                    style={{ height: '100vh', width: '100%' }}
                    zoomControl={false}
                >
                    <TileLayer
                        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />

                    <MapBoundsUpdater results={results} userLocation={userLocation} />

                    {/* User Location Marker */}
                    <Marker position={userLocation}>
                        <Popup>You are here</Popup>
                    </Marker>

                    {/* Group Results by Location (Lat/Long) to compare apples to apples */}
                    {Object.values(results.reduce((acc, item) => {
                        // Determine Effective Location (Item Specific OR Shop Default)
                        const lat = item.latitude || item.shops?.latitude;
                        const lng = item.longitude || item.shops?.longitude;

                        if (!lat || !lng) return acc; // Skip invalid locations

                        const locKey = `${lat}-${lng}`;

                        if (!acc[locKey]) {
                            acc[locKey] = {
                                coords: [lat, lng],
                                shopName: item.shops?.name,
                                // Use item-specific address if available, else fallback to Shop details
                                address: item.full_address || `${item.shops?.area || ''}, ${item.shops?.city || ''}`,
                                city: item.shops?.city,
                                items: []
                            };
                        }
                        acc[locKey].items.push(item);
                        return acc;
                    }, {})).map((group, idx) => (
                        <Marker
                            key={idx}
                            position={group.coords}
                            icon={createPriceIcon(group.items[0].cost_per_unit)}
                        >
                            <Popup>
                                <div className="min-w-[200px]">
                                    {/* Show Shop Name if available, or just 'Location' */}
                                    <h3 className="font-bold text-lg border-b pb-2 mb-2">{group.shopName || 'Item Location'}</h3>
                                    <p className="text-xs text-gray-500 mb-2">{group.address}</p>

                                    <div className="max-h-[150px] overflow-y-auto space-y-3">
                                        {group.items.map((item, i) => (
                                            <div key={i} className="bg-gray-50 p-2 rounded">
                                                <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                                                <div className="flex justify-between items-center mt-1">
                                                    <span className="font-bold text-green-700">₹{item.cost_per_unit}</span>
                                                    {item.quantity_in_stock < 5 && <span className="text-[10px] text-red-500 font-bold">Low Stock!</span>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-3 flex gap-2">
                                        <button
                                            onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${group.coords[0]},${group.coords[1]}`, '_blank')}
                                            className="flex-1 bg-green-600 text-white py-2 rounded text-sm font-bold flex justify-center items-center gap-2 hover:bg-green-700 transition"
                                        >
                                            📍 Directions
                                        </button>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>
        </div>
    );
};

export default BuyerMap;
