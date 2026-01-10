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
    const [results, setResults] = useState([]);
    const [userLocation, setUserLocation] = useState([12.9716, 80.2534]); // Chennai Default
    const [radius, setRadius] = useState(10); // km

    // Fetch all items initially to show something on the map
    useEffect(() => {
        const fetchInitialItems = async () => {
            let { data, error } = await supabase
                .from('inventory_items')
                .select(`
                *,
                shops (
                    name,
                    latitude,
                    longitude
                )
            `);
            if (data) {
                console.log("Initial data:", data);
                setResults(data);
            }
            if (error) console.error("Initial fetch error:", error);
        };
        fetchInitialItems();
    }, []);

    const handleSearch = async () => {
        if (!query) return;

        // Perform search in Supabase
        // Note: For radius search, usually we use PostGIS function.
        // For MVP, we will fetch matches and filter or just show top results.

        let { data, error } = await supabase
            .from('inventory_items')
            .select(`
                *,
                shops (
                    name,
                    latitude,
                    longitude
                )
            `)
            .ilike('name', `%${query}%`);

        if (error) {
            console.error('Search error', error);
        } else {
            console.log('Found', data);
            setResults(data);
        }
    };

    return (
        <div className="fixed inset-0 w-full h-screen">
            {/* Search Overlay */}
            <div className="absolute top-4 left-4 right-4 z-[1000] max-w-md mx-auto">
                <div className="bg-white p-2 rounded-xl shadow-xl flex gap-2">
                    <div className="flex-1 flex items-center bg-gray-100 rounded-lg px-3">
                        <Search className="w-5 h-5 text-gray-500" />
                        <input
                            className="w-full bg-transparent p-2 outline-none text-gray-800"
                            placeholder="Search 'Red Apple' or 'Wrench'..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                    </div>
                    <button
                        onClick={handleSearch}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                    >
                        Find
                    </button>
                    <select
                        className="bg-gray-100 rounded-lg px-2 text-sm text-gray-700 outline-none"
                        value={radius}
                        onChange={(e) => setRadius(e.target.value)}
                    >
                        <option value="5">5km</option>
                        <option value="10">10km</option>
                        <option value="20">20km</option>
                    </select>
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
                                            <button className="mt-3 w-full bg-black text-white py-2 rounded text-sm font-bold flex justify-center items-center gap-2">
                                                <ShoppingBag className="w-4 h-4" /> Reserve
                                            </button>
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
