import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from '../supabaseClient';
import { Search, ShoppingBag } from 'lucide-react';
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

const BuyerMap = () => {
    const [query, setQuery] = useState('');
    const [category, setCategory] = useState('All');
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

    const handleSearch = async () => {
        if (!query) return;

        setSuggestions([]); // Clear suggestions

        let searchQuery = supabase
            .from('inventory_items')
            .select(`
                *,
                shops (
                    name,
                    latitude,
                    longitude,
                    city
                )
            `)
            .ilike('name', `%${query}%`);

        if (category !== 'All') {
            searchQuery = searchQuery.eq('category', category);
        }

        const { data, error } = await searchQuery;

        if (error) {
            console.error('Search error', error);
            setResults([]);
        } else {
            setResults(data || []);
        }
    };

    return (
        <div className="fixed inset-0 w-full h-screen">
            {/* Search Overlay */}
            <div className="absolute top-4 left-4 right-4 z-[1000] max-w-2xl mx-auto">
                <div className="bg-white p-3 rounded-xl shadow-xl">
                    {/* Category Dropdown */}
                    <div className="mb-3">
                        <label className="text-xs text-gray-600 block mb-1">Category</label>
                        <select
                            className="w-full p-2 border border-gray-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            <option value="All">All Categories</option>
                            <option value="Groceries">Groceries</option>
                            <option value="Electronics">Electronics</option>
                            <option value="Clothing">Clothing</option>
                            <option value="Hardware">Hardware</option>
                        </select>
                    </div>

                    {/* Product Search with Autocomplete */}
                    <div className="relative">
                        <label className="text-xs text-gray-600 block mb-1">Product Name</label>
                        <div className="flex gap-2">
                            <div className="flex-1 relative">
                                <div className="flex items-center bg-gray-100 rounded-lg px-3">
                                    <Search className="w-5 h-5 text-gray-500" />
                                    <input
                                        className="w-full bg-transparent p-2 outline-none text-gray-800"
                                        placeholder="Type product name..."
                                        value={query}
                                        onChange={(e) => handleQueryChange(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    />
                                </div>

                                {/* Autocomplete Suggestions */}
                                {suggestions.length > 0 && (
                                    <div className="absolute top-full mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                                        {suggestions.map((suggestion, idx) => (
                                            <div
                                                key={idx}
                                                className="p-2 hover:bg-blue-50 cursor-pointer text-sm"
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
                                className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition"
                            >
                                Find
                            </button>
                        </div>
                    </div>

                    {/* Radius Selector */}
                    <div className="mt-3 flex items-center gap-2">
                        <span className="text-xs text-gray-600">Search Radius:</span>
                        <select
                            className="text-sm bg-gray-100 rounded-lg px-3 py-1 text-gray-700 outline-none"
                            value={radius}
                            onChange={(e) => setRadius(e.target.value)}
                        >
                            <option value="5">5 km</option>
                            <option value="10">10 km</option>
                            <option value="20">20 km</option>
                        </select>
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

                    {/* User Location Marker */}
                    <Marker position={userLocation}>
                        <Popup>You are here</Popup>
                    </Marker>

                    {/* Result Markers */}
                    {results.map((item) => (
                        item.shops && (
                            <Marker
                                key={item.id}
                                position={[item.shops.latitude, item.shops.longitude]}
                                icon={createPriceIcon(item.cost_per_unit)}
                            >
                                <Popup>
                                    <div className="min-w-[150px]">
                                        <h3 className="font-bold text-lg">{item.shops.name}</h3>
                                        <div className="mt-2">
                                            <p className="font-medium text-gray-900">{item.name}</p>
                                            <p className="text-sm text-gray-500">{item.shops.city}</p>
                                            <div className="mt-3 flex justify-between items-center bg-green-50 p-2 rounded">
                                                <span className="text-xs text-gray-600">Price</span>
                                                <span className="font-bold text-green-700 text-lg">₹{item.cost_per_unit}</span>
                                            </div>
                                            {item.min_moq > 1 && (
                                                <div className="mt-1 text-xs text-blue-600">
                                                    Bulk: ₹{item.bulk_moq_cost} (Min {item.min_moq})
                                                </div>
                                            )}

                                            {/* Action Buttons */}
                                            <div className="mt-3 flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${item.shops.latitude},${item.shops.longitude}`;
                                                        window.open(mapsUrl, '_blank');
                                                    }}
                                                    className="flex-1 bg-green-600 text-white py-2 rounded text-sm font-bold flex justify-center items-center gap-2 hover:bg-green-700 transition"
                                                >
                                                    📍 Get Directions
                                                </button>
                                                <button className="flex-1 bg-green-600 text-white py-2 rounded text-sm font-bold flex justify-center items-center gap-2 hover:bg-green-700 transition">
                                                    <ShoppingBag className="w-4 h-4" /> Reserve
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        )
                    ))}
                </MapContainer>
            </div>
        </div>
    );
};

export default BuyerMap;
